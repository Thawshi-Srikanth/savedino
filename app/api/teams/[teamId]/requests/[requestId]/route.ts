import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { calculateTeamStatus } from "@/lib/campaign-engine";
import { sendTeamRequestAcceptedEmail, sendTeamRequestRejectedEmail } from "@/lib/email";
import { captureServerEvent, captureServerException } from "@/lib/posthog-server";

// PUT: Team Leader accepts or rejects a join request
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ teamId: string; requestId: string }> }
) {
  let distinctId = "server";
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    distinctId = session.user.id;
    const { teamId, requestId } = await params;
    const body = await request.json();
    const { action } = body; // "ACCEPT" | "REJECT"

    if (!["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        event: true,
        members: true,
      },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found." }, { status: 404 });
    }

    // Verify leader authorization
    if (team.leaderId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only team leader or admin can process join requests." },
        { status: 403 }
      );
    }

    const joinReq = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!joinReq || joinReq.teamId !== teamId) {
      return NextResponse.json({ success: false, error: "Request not found." }, { status: 404 });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "https://savedino.sedssl.org";

    if (action === "REJECT") {
      await prisma.teamJoinRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      // Send rejection notification email asynchronously
      if (joinReq.user?.email) {
        sendTeamRequestRejectedEmail(joinReq.user.email, {
          applicantName: joinReq.user.name || "Citizen Scientist",
          teamName: team.name,
          campaignName: team.event?.title || "Asteroid Campaign",
          exploreTeamsUrl: `${appUrl}/teams?eventId=${team.eventId}`,
        }).catch((err) => {
          console.warn("[Send Team Rejection Email Warning]:", err?.message || err);
        });
      }

      await captureServerEvent(session.user.id, "team_join_request_decided", {
        team_id: team.id,
        campaign_id: team.eventId,
        request_id: requestId,
        decision: "rejected",
      });

      return NextResponse.json({
        success: true,
        message: "Join request rejected.",
      });
    }

    // Action === "ACCEPT"
    if (team.status === "DISQUALIFIED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This squad has been disabled by platform administration and cannot accept new members.",
        },
        { status: 403 }
      );
    }

    if (team.event?.maxTeamSize && team.event.maxTeamSize > 0) {
      if (team.members.length >= team.event.maxTeamSize) {
        return NextResponse.json(
          {
            success: false,
            error: `Squad is already at max capacity (${team.event.maxTeamSize} members).`,
          },
          { status: 400 }
        );
      }
    }

    // Check if user is already enrolled in ANY squad for this campaign
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId: joinReq.userId,
        team: {
          eventId: team.eventId,
        },
      },
      include: {
        team: { select: { id: true, name: true } },
      },
    });

    if (existingMembership) {
      if (existingMembership.teamId === teamId) {
        // Already a member of this team - update request to ACCEPTED
        await prisma.teamJoinRequest.update({
          where: { id: requestId },
          data: { status: "ACCEPTED" },
        });
        await captureServerEvent(session.user.id, "team_join_request_decided", {
          team_id: team.id,
          campaign_id: team.eventId,
          request_id: requestId,
          decision: "accepted",
          member_already_present: true,
        });
        return NextResponse.json({
          success: true,
          message: "This scientist is already a member of your squad.",
        });
      } else {
        // Enrolled in a different team
        return NextResponse.json(
          {
            success: false,
            error: `Cannot accept: This user has already joined squad "${existingMembership.team.name}" for this campaign.`,
          },
          { status: 400 }
        );
      }
    }

    // Transaction to add member and mark request accepted
    await prisma.$transaction([
      prisma.teamMember.create({
        data: {
          teamId,
          userId: joinReq.userId,
          role: "member",
        },
      }),
      prisma.teamJoinRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      }),
    ]);

    // Recalculate team status
    const updatedMemberCount = team.members.length + 1;
    const newStatus = calculateTeamStatus(updatedMemberCount);

    await prisma.team.update({
      where: { id: teamId },
      data: {
        status: newStatus,
        isRecruiting: !team.event?.maxTeamSize || updatedMemberCount < team.event.maxTeamSize,
      },
    });

    // Send acceptance notification email asynchronously
    if (joinReq.user?.email) {
      sendTeamRequestAcceptedEmail(joinReq.user.email, {
        applicantName: joinReq.user.name || "Citizen Scientist",
        teamName: team.name,
        campaignName: team.event?.title || "Asteroid Campaign",
        leaderName: session.user.name || "Squad Leader",
        workspaceUrl: `${appUrl}/team/${team.id}`,
      }).catch((err) => {
        console.warn("[Send Team Acceptance Email Warning]:", err?.message || err);
      });
    }

    await captureServerEvent(session.user.id, "team_join_request_decided", {
      team_id: team.id,
      campaign_id: team.eventId,
      request_id: requestId,
      decision: "accepted",
      member_count: updatedMemberCount,
    });

    return NextResponse.json({
      success: true,
      message: "Student accepted into squad!",
    });
  } catch (error: any) {
    console.error("PUT /api/teams/[teamId]/requests/[requestId] error:", error);
    await captureServerException(error, distinctId, {
      route: "/api/teams/[teamId]/requests/[requestId]",
      method: "PUT",
    });
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request." },
      { status: 500 }
    );
  }
}
