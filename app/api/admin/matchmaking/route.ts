import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkUserEventConcurrency, calculateTeamStatus } from "@/lib/campaign-engine";

// GET /api/admin/matchmaking - List unassigned users and teams needing members
export async function GET() {
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

    // 1. Get all events
    const events = await prisma.event.findMany({
      orderBy: { startDate: "desc" },
    });

    // 2. Get all teams needing members (< 6)
    const teams = await prisma.team.findMany({
      include: {
        event: true,
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, institution: true, country: true },
            },
          },
        },
        _count: {
          select: { members: true, imageSets: true },
        },
      },
    });

    // 3. Get all eligible participant users (excluding platform admins)
    const allUsers = await prisma.user.findMany({
      where: {
        role: { not: "admin" },
      },
      select: {
        id: true,
        name: true,
        email: true,
        institution: true,
        country: true,
        role: true,
        createdAt: true,
        teamMembers: {
          include: {
            team: {
              include: { event: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      events,
      teams,
      users: allUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/matchmaking - Match a solo student into a team
export async function POST(req: Request) {
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

    const body = await req.json();
    const { userId, teamId } = body;

    if (!userId || !teamId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, teamId" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    if (targetUser.role === "admin") {
      return NextResponse.json(
        { success: false, error: "Administrators cannot be assigned to participant teams." },
        { status: 400 }
      );
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true, event: true },
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Target team not found." },
        { status: 404 }
      );
    }

    if (team.status === "DISQUALIFIED") {
      return NextResponse.json(
        { success: false, error: "Cannot assign members to a disabled/disqualified squad." },
        { status: 400 }
      );
    }

    const maxLimit = team.event?.maxTeamSize || 6;
    if (team.members.length >= maxLimit) {
      return NextResponse.json(
        {
          success: false,
          error: `Squad is already full (max ${maxLimit} members for this campaign).`,
        },
        { status: 400 }
      );
    }

    // Check concurrency
    const concurrency = await checkUserEventConcurrency(userId, team.eventId);
    if (!concurrency.canEnroll) {
      return NextResponse.json({ success: false, error: concurrency.reason }, { status: 409 });
    }

    const newCount = team.members.length + 1;
    const newStatus = calculateTeamStatus(newCount);

    await prisma.$transaction([
      prisma.teamMember.create({
        data: {
          teamId,
          userId,
          role: "MEMBER",
        },
      }),
      prisma.team.update({
        where: { id: teamId },
        data: { status: newStatus },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Student successfully assigned to team.",
      newStatus,
      newCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
