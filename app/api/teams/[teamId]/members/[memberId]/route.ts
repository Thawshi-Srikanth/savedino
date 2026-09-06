import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isRegistrationClosed, calculateTeamStatus } from "@/lib/campaign-engine";

// DELETE /api/teams/[teamId]/members/[memberId] - Remove a member from the squad
export async function DELETE(
  req: Request,
  context: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { teamId, memberId } = await context.params;

    // Fetch team with event and members
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        event: true,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Squad not found." }, { status: 404 });
    }

    const isLeader = team.leaderId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isLeader && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Only the squad leader or administrator can remove members." },
        { status: 403 }
      );
    }

    // Squad disabled guard
    if (team.status === "DISQUALIFIED" && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "This squad has been disabled by platform administration and roster changes are locked." },
        { status: 403 }
      );
    }

    // Registration Window Guard: Removal allowed ONLY during registration / team formation period
    if (team.event) {
      const regCheck = isRegistrationClosed(team.event);
      if (regCheck.closed && !isAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: "Members can only be removed during the campaign registration and team formation period. Once the campaign begins, squad rosters are locked.",
          },
          { status: 400 }
        );
      }
    }

    // Find the member (supports matching by TeamMember.id or User.id)
    const targetMember = team.members.find(
      (m) => m.id === memberId || m.userId === memberId
    );

    if (!targetMember) {
      return NextResponse.json(
        { success: false, error: "Member not found in this squad roster." },
        { status: 404 }
      );
    }

    // Cannot remove team leader
    if (targetMember.userId === team.leaderId || targetMember.role === "leader") {
      return NextResponse.json(
        {
          success: false,
          error: "The squad leader cannot be removed from the roster. Transfer leadership in Squad Settings first.",
        },
        { status: 400 }
      );
    }

    // Execute removal transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete member record
      await tx.teamMember.delete({
        where: { id: targetMember.id },
      });

      // 2. Unclaim any active in-progress image sets
      await tx.imageSet.updateMany({
        where: {
          teamId,
          claimedById: targetMember.userId,
          status: { in: ["IN_PROGRESS", "UNASSIGNED"] },
        },
        data: {
          claimedById: null,
          status: "UNASSIGNED",
        },
      });

      // 3. Remove or update any pending/accepted join requests for this team
      await tx.teamJoinRequest.deleteMany({
        where: {
          teamId,
          userId: targetMember.userId,
        },
      });

      // 4. Update team status if membership count drops below active threshold
      const remainingCount = team.members.length - 1;
      const newStatus = calculateTeamStatus(remainingCount);
      if (team.status !== "DISQUALIFIED" && team.status !== newStatus) {
        await tx.team.update({
          where: { id: teamId },
          data: { status: newStatus },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Removed ${targetMember.user.name} from the squad.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
