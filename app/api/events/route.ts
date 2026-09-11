import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/events - List all events
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: "asc" },
      include: {
        _count: {
          select: { teams: true },
        },
      },
    });

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/events - Create a new event (Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      code,
      description,
      regStart,
      regEnd,
      teamFormationStart,
      teamFormationEnd,
      startDate,
      endDate,
      submissionStart,
      submissionEnd,
      maxTeamSize,
    } = body;

    const sDate = startDate ? new Date(startDate) : new Date();
    const eDate = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 86400000);
    const teamSize = maxTeamSize ? Math.max(2, Math.min(30, Number(maxTeamSize))) : 6;

    const newEvent = await prisma.event.create({
      data: {
        title,
        code: code.toUpperCase().trim(),
        description,
        regStart: regStart ? new Date(regStart) : sDate,
        regEnd: regEnd ? new Date(regEnd) : eDate,
        teamFormationStart: teamFormationStart ? new Date(teamFormationStart) : sDate,
        teamFormationEnd: teamFormationEnd ? new Date(teamFormationEnd) : eDate,
        startDate: sDate,
        endDate: eDate,
        submissionStart: submissionStart ? new Date(submissionStart) : sDate,
        submissionEnd: submissionEnd ? new Date(submissionEnd) : eDate,
        maxTeamSize: teamSize,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
