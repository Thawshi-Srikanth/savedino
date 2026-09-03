import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { calculateTeamStatus } from "@/lib/campaign-engine";

// PUT: Team Leader accepts or rejects a join request
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ teamId: string; requestId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { teamId, requestId } = await params;
    const body = await request.json();
    const { action } = body; // "ACCEPT" | "REJECT"

    if (!["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found." }, { status: 404 });
    }

    // Verify leader authorization
    if (team.leaderId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Only team leader or admin can process join requests." }, { status: 403 });
    }

    const joinReq = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
    });

    if (!joinReq || joinReq.teamId !== teamId) {
      return NextResponse.json({ success: false, error: "Request not found." }, { status: 404 });
    }

    if (action === "REJECT") {
      await prisma.teamJoinRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({
        success: true,
        message: "Join request rejected.",
      });
    }

    // Action === "ACCEPT"
    if (team.members.length >= 6) {
      return NextResponse.json({ success: false, error: "Team is already at max capacity (6 members)." }, { status: 400 });
    }

    // Transaction to add member and mark request accepted
    await prisma.$transaction([
      prisma.teamMember.create({
        data: {
          teamId,
          userId: joinReq.userId,
          role: "MEMBER",
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
        isRecruiting: updatedMemberCount < 6,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student accepted into squad!",
    });
  } catch (error: any) {
    console.error("PUT /api/teams/[teamId]/requests/[requestId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request." },
      { status: 500 }
    );
  }
}
