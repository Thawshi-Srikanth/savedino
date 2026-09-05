import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  checkUserEventConcurrency,
  calculateTeamStatus,
  isRegistrationClosed,
} from "@/lib/campaign-engine";

// POST /api/teams/join - Join a team via invite code
export async function POST(req: Request) {
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

    // 2. Check Event Registration Deadline
    if (team.event) {
      const regCheck = isRegistrationClosed(team.event);
      if (regCheck.closed) {
        return NextResponse.json(
          { success: false, error: regCheck.reason || "Team registration has closed for this campaign." },
          { status: 400 }
        );
      }
    }

    // 3. Check if team is full (Max 6 members)
    if (team.members.length >= 6) {
      return NextResponse.json(
        { success: false, error: "This team has already reached the maximum limit of 6 members." },
        { status: 400 }
      );
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
      return NextResponse.json(
        { success: false, error: concurrency.reason },
        { status: 409 }
      );
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

    return NextResponse.json({
      success: true,
      teamId: team.id,
      teamName: team.name,
      membersCount: newCount,
      status: newStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
