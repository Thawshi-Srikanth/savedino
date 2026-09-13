import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendTeamJoinRequestEmail } from "@/lib/email";
import { maskEmail } from "@/lib/mask-email";

export const dynamic = "force-dynamic";

// GET pending join requests for a team (Leader, Squad Members & Admins)
export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { teamId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        joinRequests: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                institution: true,
                country: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found." }, { status: 404 });
    }

    const isMember = team.members.some((m) => m.userId === session.user.id);
    const isLeader = team.leaderId === session.user.id;
    const isStaffOrAdmin = session.user.role === "admin" || session.user.role === "staff";

    if (!isMember && !isStaffOrAdmin) {
      return NextResponse.json(
        { success: false, error: "Only team members or admins can view join requests." },
        { status: 403 }
      );
    }

    // Get all userIds of the applicants
    const userIds = team.joinRequests.map((r) => r.userId);

    // Find if any of these users have active memberships in ANY team for this campaign
    const campaignMemberships = await prisma.teamMember.findMany({
      where: {
        userId: { in: userIds },
        team: {
          eventId: team.eventId,
        },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            leaderId: true,
          },
        },
      },
    });

    const membershipMap = new Map<
      string,
      { teamId: string; teamName: string; isThisTeam: boolean }
    >();
    for (const mem of campaignMemberships) {
      membershipMap.set(mem.userId, {
        teamId: mem.team.id,
        teamName: mem.team.name,
        isThisTeam: mem.teamId === teamId,
      });
    }

    const canSeeFullEmails = isLeader || isStaffOrAdmin;

    const requestsWithConflictInfo = team.joinRequests.map((req) => {
      const activeMem = membershipMap.get(req.userId);
      const isSelf = req.userId === session.user.id;
      return {
        ...req,
        user: {
          ...req.user,
          email: canSeeFullEmails || isSelf ? req.user.email : maskEmail(req.user.email),
        },
        alreadyJoinedSquad: activeMem
          ? {
              teamId: activeMem.teamId,
              teamName: activeMem.teamName,
              isThisTeam: activeMem.isThisTeam,
            }
          : null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        requests: requestsWithConflictInfo,
        isLeader,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/teams/[teamId]/requests error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch join requests." },
      { status: 500 }
    );
  }
}

// POST: Student sends a join request to a recruiting team
export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    if (session.user.role === "admin" || session.user.role === "staff") {
      return NextResponse.json(
        {
          success: false,
          error: "Administrators and staff manage campaigns and cannot submit team join requests.",
        },
        { status: 403 }
      );
    }

    const { teamId } = await params;
    const body = await request.json();
    const message = body.message?.trim() || null;

    // Check if team exists and is recruiting
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        event: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found." }, { status: 404 });
    }

    if (team.status === "DISQUALIFIED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This squad has been disabled by platform administration and is not accepting join requests.",
        },
        { status: 403 }
      );
    }

    if (!team.isRecruiting) {
      return NextResponse.json(
        { success: false, error: "This team is currently not accepting join requests." },
        { status: 400 }
      );
    }

    if (team.event?.maxTeamSize && team.event.maxTeamSize > 0) {
      if (team.members.length >= team.event.maxTeamSize) {
        return NextResponse.json(
          {
            success: false,
            error: `This squad is already at max capacity (${team.event.maxTeamSize} members).`,
          },
          { status: 400 }
        );
      }
    }

    // Check if user is already in this team
    const alreadyMember = team.members.some((m) => m.userId === session.user.id);
    if (alreadyMember) {
      return NextResponse.json(
        { success: false, error: "You are already a member of this team." },
        { status: 400 }
      );
    }

    // Check existing join request
    const existing = await prisma.teamJoinRequest.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (existing) {
      if (existing.status === "REJECTED") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Your previous application to this squad was declined. You cannot re-apply to the same squad.",
          },
          { status: 403 }
        );
      }
      if (existing.status === "PENDING") {
        return NextResponse.json(
          {
            success: false,
            error: "You already have a pending join request awaiting review by this squad leader.",
          },
          { status: 400 }
        );
      }
      if (existing.status === "ACCEPTED") {
        return NextResponse.json(
          {
            success: false,
            error: "You are already a member of this squad.",
          },
          { status: 400 }
        );
      }
    }

    const joinRequest = await prisma.teamJoinRequest.create({
      data: {
        teamId,
        userId: session.user.id,
        message,
        status: "PENDING",
      },
    });

    // Send email notification to squad leader asynchronously without blocking response
    const leaderUser =
      team.members.find((m) => m.role === "leader")?.user ||
      (team.leaderId
        ? await prisma.user.findUnique({
            where: { id: team.leaderId },
            select: { id: true, name: true, email: true },
          })
        : null);

    if (leaderUser?.email) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.BETTER_AUTH_URL ||
        "https://savedino.sedssl.org";
      const reviewUrl = `${appUrl}/team/${team.id}?tab=requests`;

      sendTeamJoinRequestEmail(leaderUser.email, {
        leaderName: leaderUser.name || "Squad Leader",
        applicantName: session.user.name || "A Citizen Scientist",
        applicantEmail: session.user.email,
        teamName: team.name,
        campaignName: team.event?.title || "Asteroid Campaign",
        message,
        reviewUrl,
      }).catch((emailErr) => {
        console.warn("[Send Team Join Request Email Warning]:", emailErr?.message || emailErr);
      });
    }

    return NextResponse.json({
      success: true,
      request: joinRequest,
      message: "Join request submitted successfully!",
    });
  } catch (error: any) {
    console.error("POST /api/teams/[teamId]/requests error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send join request." },
      { status: 500 }
    );
  }
}
