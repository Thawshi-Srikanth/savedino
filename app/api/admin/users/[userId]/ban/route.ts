import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  sendAccountBannedEmail,
  sendNameWarningEmail,
  sendTeamMemberBannedEmail,
} from "@/lib/email";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST /api/admin/users/[userId]/ban - Ban, unban, or issue name warnings, with squad leader notifications & removal
export async function POST(req: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin or Staff privileges required." },
        { status: 403 }
      );
    }

    const { userId } = await context.params;
    const body = await req.json();
    const { action = "BAN", reason, customMessage, sendEmail = true } = body;

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "https://savedino.sedssl.org";

    // Prevent action on own account
    if (session.user.id === userId) {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot perform moderation actions on your own administrator account.",
        },
        { status: 400 }
      );
    }

    // Retrieve target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    // Safeguard: Staff cannot ban full Admins, and Admins cannot ban other Admins directly
    if (targetUser.role === "admin" && action === "BAN") {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator accounts cannot be banned. Demote the role first if required.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------------------
    // ACTION 1: WARN_NAME (Invalid Full Name Warning without Banning)
    // -------------------------------------------------------------------------
    if (action === "WARN_NAME") {
      const profileUrl = `${baseUrl}/profile`;

      let emailDispatched = false;
      try {
        await sendNameWarningEmail({
          name: targetUser.name,
          email: targetUser.email,
          currentName: targetUser.name,
          customNote:
            customMessage && typeof customMessage === "string" ? customMessage.trim() : undefined,
          profileUrl,
        });
        emailDispatched = true;
      } catch (warnErr: any) {
        console.error(
          "[Name Warning Action] Email dispatch exception:",
          warnErr?.message || warnErr
        );
      }

      return NextResponse.json({
        success: true,
        message: emailDispatched
          ? `Invalid full name warning notice sent to ${targetUser.name} (${targetUser.email}).`
          : `Warning processed for ${targetUser.name}.`,
        user: targetUser,
        emailSent: emailDispatched,
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 2: BAN (Ban User, Remove from Squads, & Notify Squad Leaders)
    // -------------------------------------------------------------------------
    if (action === "BAN") {
      const primaryReason = typeof reason === "string" ? reason.trim() : "";
      if (!primaryReason) {
        return NextResponse.json(
          { success: false, error: "A primary reason is required to ban a user." },
          { status: 400 }
        );
      }

      const fullStoredReason =
        customMessage && typeof customMessage === "string" && customMessage.trim()
          ? `${primaryReason} (${customMessage.trim()})`
          : primaryReason;

      // 1. Update user record in database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          banned: true,
          banReason: fullStoredReason,
          bannedAt: new Date(),
        },
      });

      // 2. Terminate all active sessions immediately for the banned user
      try {
        await prisma.session.deleteMany({
          where: { userId },
        });
      } catch (sessionErr) {
        console.warn("[Ban Action] Failed to flush active sessions:", sessionErr);
      }

      // 3. Find all squads this user is a member of and remove them + notify leaders
      const userMemberships = await prisma.teamMember.findMany({
        where: { userId },
        include: {
          team: {
            include: {
              event: {
                select: { id: true, title: true, code: true },
              },
            },
          },
        },
      });

      let leadersNotifiedCount = 0;

      for (const tm of userMemberships) {
        const team = tm.team;
        const isLeader = team.leaderId === userId;

        // If banned user is not the leader, notify the squad leader
        if (!isLeader) {
          const leaderUser = await prisma.user.findUnique({
            where: { id: team.leaderId },
            select: { id: true, name: true, email: true },
          });

          if (leaderUser?.email) {
            try {
              await sendTeamMemberBannedEmail({
                leaderName: leaderUser.name,
                leaderEmail: leaderUser.email,
                memberName: targetUser.name,
                memberEmail: targetUser.email,
                teamName: team.name,
                campaignName: team.event?.title || null,
                workspaceUrl: `${baseUrl}/team/${team.id}`,
              });
              leadersNotifiedCount++;
            } catch (leaderEmailErr) {
              console.warn(
                `[Ban Action] Failed to notify leader of squad ${team.name}:`,
                leaderEmailErr
              );
            }
          }
        } else {
          // If the banned user WAS the squad leader, transfer leadership to next oldest member
          const remainingMembers = await prisma.teamMember.findMany({
            where: { teamId: team.id, userId: { not: userId } },
            orderBy: { createdAt: "asc" },
          });

          if (remainingMembers.length > 0) {
            const newLeaderMember = remainingMembers[0];
            await prisma.team.update({
              where: { id: team.id },
              data: { leaderId: newLeaderMember.userId },
            });
            await prisma.teamMember.update({
              where: { id: newLeaderMember.id },
              data: { role: "leader" },
            });
          }
        }

        // Delete membership from squad
        await prisma.teamMember.delete({
          where: { id: tm.id },
        });

        // Release any claimed in-progress image sets back to the squad pool
        await prisma.imageSet.updateMany({
          where: { claimedById: userId, status: "IN_PROGRESS" },
          data: { claimedById: null, status: "UNASSIGNED" },
        });
      }

      // 4. Dispatch suspension notice email to the banned user
      let emailDispatched = false;
      if (sendEmail) {
        try {
          await sendAccountBannedEmail({
            email: targetUser.email,
            name: targetUser.name,
            reason: primaryReason,
            details:
              customMessage && typeof customMessage === "string" ? customMessage.trim() : undefined,
          });
          emailDispatched = true;
        } catch (emailErr: any) {
          console.error("[Ban Action] Email dispatch exception:", emailErr?.message || emailErr);
        }
      }

      const squadMsg =
        userMemberships.length > 0
          ? ` Removed from ${userMemberships.length} squad(s)${
              leadersNotifiedCount > 0 ? ` and ${leadersNotifiedCount} leader(s) notified.` : "."
            }`
          : "";

      return NextResponse.json({
        success: true,
        message: `User ${targetUser.name} has been banned.${squadMsg}${
          emailDispatched ? " Email notice sent." : ""
        }`,
        user: updatedUser,
        emailSent: emailDispatched,
        removedFromSquadsCount: userMemberships.length,
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 3: UNBAN (Reinstate User)
    // -------------------------------------------------------------------------
    if (action === "UNBAN") {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          banned: false,
          banReason: null,
          bannedAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Account for ${targetUser.name} has been reinstated successfully.`,
        user: updatedUser,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Expected 'BAN', 'UNBAN', or 'WARN_NAME'." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[POST /api/admin/users/[userId]/ban Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update ban status." },
      { status: 500 }
    );
  }
}
