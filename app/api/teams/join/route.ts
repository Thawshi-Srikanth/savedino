import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  checkUserEventConcurrency,
  calculateTeamStatus,
  isRegistrationClosed,
} from "@/lib/campaign-engine";
import { addMemberToThread, assignDiscordRole } from "@/lib/discord";
import { captureServerEvent, captureServerException } from "@/lib/posthog-server";

// POST /api/teams/join - Join a team via invite code
export async function POST(req: Request) {
  let distinctId = "server";
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Please log in to join a team." },
        { status: 401 }
      );
    }

    distinctId = session.user.id;

    if (session.user.role === "admin" || session.user.role === "staff") {
      return NextResponse.json(
        {
          success: false,
          error: "Administrators and staff manage campaigns and cannot join participant teams.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { inviteCode } = body;

    if (!inviteCode) {
      return NextResponse.json(
        { success: false, error: "Invite code is required." },
        { status: 400 }
      );
    }

    const cleanCode = inviteCode.toUpperCase().trim();

    // 1. Find team
    const team = await prisma.team.findUnique({
      where: { inviteCode: cleanCode },
      include: {
        event: true,
        members: true,
      },
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Invalid invite code. No matching team found." },
        { status: 404 }
      );
    }

    // 2. Check if team is disabled / disqualified by administration
    if (team.status === "DISQUALIFIED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This squad has been disabled by platform administration and is not accepting new members.",
        },
        { status: 403 }
      );
    }

    // 3. Check Event Registration Deadline
    if (team.event) {
      const regCheck = isRegistrationClosed(team.event);
      if (regCheck.closed) {
        return NextResponse.json(
          {
            success: false,
            error: regCheck.reason || "Team registration has closed for this campaign.",
          },
          { status: 400 }
        );
      }
    }

    // 3. Check if team is full based on campaign maxTeamSize (if configured)
    if (team.event?.maxTeamSize && team.event.maxTeamSize > 0) {
      if (team.members.length >= team.event.maxTeamSize) {
        return NextResponse.json(
          {
            success: false,
            error: `This squad has already reached the maximum limit of ${team.event.maxTeamSize} members for this campaign.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Check if user is already in this team
    const alreadyMember = team.members.some((m) => m.userId === session.user.id);
    if (alreadyMember) {
      return NextResponse.json(
        { success: false, error: "You are already a member of this team." },
        { status: 400 }
      );
    }

    // 4. Check Event Concurrency
    const concurrency = await checkUserEventConcurrency(session.user.id, team.eventId);
    if (!concurrency.canEnroll) {
      return NextResponse.json({ success: false, error: concurrency.reason }, { status: 409 });
    }

    // 5. Add user to team and update status
    const newCount = team.members.length + 1;
    const newStatus = calculateTeamStatus(newCount);

    await prisma.$transaction([
      prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: session.user.id,
          role: "MEMBER",
        },
      }),
      prisma.team.update({
        where: { id: team.id },
        data: { status: newStatus },
      }),
    ]);

    // Discord Automation: Add user to private squad thread & assign campaign role
    (async () => {
      try {
        const userAccount = await prisma.account.findFirst({
          where: { userId: session.user.id, providerId: "discord" },
          select: { accountId: true },
        });

        if (userAccount?.accountId) {
          // Add to squad thread
          if (team.discordThreadId) {
            await addMemberToThread(team.discordThreadId, userAccount.accountId);
          }
          // Assign campaign role
          if (team.event?.discordRoleId) {
            await assignDiscordRole(userAccount.accountId, team.event.discordRoleId);
          }
        }
      } catch (err) {
        console.error("[Discord Join Automation] Error:", err);
      }
    })();

    await captureServerEvent(session.user.id, "team_joined", {
      team_id: team.id,
      campaign_id: team.eventId,
      member_count: newCount,
      status: newStatus,
      join_method: "invite_code",
    });

    return NextResponse.json({
      success: true,
      teamId: team.id,
      teamName: team.name,
      membersCount: newCount,
      status: newStatus,
    });
  } catch (error: any) {
    await captureServerException(error, distinctId, { route: "/api/teams/join", method: "POST" });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
