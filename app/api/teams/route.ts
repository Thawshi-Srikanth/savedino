import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkUserEventConcurrency, generateInviteCode } from "@/lib/campaign-engine";

// POST /api/teams - Create a team in an event
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Please log in to create a team." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { eventId, name } = body;

    if (!eventId || !name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: eventId, name" },
        { status: 400 }
      );
    }

    // 1. Enforce Event Concurrency Rule
    const concurrency = await checkUserEventConcurrency(session.user.id, eventId);
    if (!concurrency.canEnroll) {
      return NextResponse.json(
        { success: false, error: concurrency.reason },
        { status: 409 }
      );
    }

    // 2. Generate unique invite code
    let inviteCode = generateInviteCode();
    while (await prisma.team.findUnique({ where: { inviteCode } })) {
      inviteCode = generateInviteCode();
    }

    // 3. Create Team & add leader as first member
    const newTeam = await prisma.team.create({
      data: {
        eventId,
        name: name.trim(),
        inviteCode,
        leaderId: session.user.id,
        status: "FORMING", // Initially 1 member (< 2 is FORMING)
        members: {
          create: {
            userId: session.user.id,
            role: "LEADER",
          },
        },
      },
      include: {
        event: true,
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, institution: true, country: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, team: newTeam }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A team with this name already exists in this event." },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
