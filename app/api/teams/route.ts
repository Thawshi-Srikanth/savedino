import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  checkUserEventConcurrency,
  generateInviteCode,
  isRegistrationClosed,
} from "@/lib/campaign-engine";

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

    // 1. Check Event Existence & Registration Deadline
    const targetEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!targetEvent) {
      return NextResponse.json(
        { success: false, error: "Campaign not found." },
        { status: 404 }
      );
    }

    const regCheck = isRegistrationClosed(targetEvent);
    if (regCheck.closed) {
      return NextResponse.json(
        { success: false, error: regCheck.reason || "Registration has closed for this campaign." },
        { status: 400 }
      );
    }

    // 2. Enforce Event Concurrency Rule
    const concurrency = await checkUserEventConcurrency(session.user.id, eventId);
    if (!concurrency.canEnroll) {
      return NextResponse.json(
        { success: false, error: concurrency.reason },
        { status: 409 }
      );
    }

    // 3. Generate unique invite code
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

// GET /api/teams - List all teams with search & filter support
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const eventId = searchParams.get("eventId") || "";
    const isRecruiting = searchParams.get("isRecruiting");
    const status = searchParams.get("status") || "";

    const where: any = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (status) {
      where.status = status;
    }

    if (isRecruiting === "true") {
      where.isRecruiting = true;
    } else if (isRecruiting === "false") {
      where.isRecruiting = false;
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { recruitmentNotes: { contains: q, mode: "insensitive" } },
        {
          members: {
            some: {
              user: {
                name: { contains: q, mode: "insensitive" },
              },
            },
          },
        },
        {
          event: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { code: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const teams = await prisma.team.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            code: true,
            status: true,
          },
        },
        members: {
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
        },
        _count: {
          select: {
            members: true,
            joinRequests: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, teams });
  } catch (error: any) {
    console.error("GET /api/teams error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch teams." },
      { status: 500 }
    );
  }
}
