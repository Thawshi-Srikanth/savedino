import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET pending join requests for a team (Leader only)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
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

    return NextResponse.json({
      success: true,
      requests: team.joinRequests,
      isLeader: team.leaderId === session.user.id,
    });
  } catch (error: any) {
    console.error("GET /api/teams/[teamId]/requests error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch join requests." },
      { status: 500 }
    );
  }
}

// POST: Student sends a join request to a recruiting team
export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { teamId } = await params;
    const body = await request.json();
    const message = body.message?.trim() || null;

    // Check if team exists and is recruiting
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found." }, { status: 404 });
    }

    if (!team.isRecruiting) {
      return NextResponse.json({ success: false, error: "This team is currently not accepting join requests." }, { status: 400 });
    }

    if (team.members.length >= 6) {
      return NextResponse.json({ success: false, error: "This team is already at max capacity (6 members)." }, { status: 400 });
    }

    // Check if user is already in this team
    const alreadyMember = team.members.some((m) => m.userId === session.user.id);
    if (alreadyMember) {
      return NextResponse.json({ success: false, error: "You are already a member of this team." }, { status: 400 });
    }

    // Create or update Join Request
    const joinRequest = await prisma.teamJoinRequest.upsert({
      where: {
        teamId_userId: {
          teamId,
          userId: session.user.id,
        },
      },
      update: {
        message,
        status: "PENDING",
      },
      create: {
        teamId,
        userId: session.user.id,
        message,
        status: "PENDING",
      },
    });

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
