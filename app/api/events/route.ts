import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { captureServerEvent, captureServerException } from "@/lib/posthog-server";

// Server-side in-memory cache for Events (TTL: 10 seconds)
let cachedEvents: { timestamp: number; data: any } | null = null;
const EVENTS_CACHE_TTL_MS = 10 * 1000;

export function invalidateEventsCache() {
  cachedEvents = null;
}

// GET /api/events - List all events (Cached)
export async function GET() {
  try {
    if (cachedEvents && Date.now() - cachedEvents.timestamp < EVENTS_CACHE_TTL_MS) {
      return NextResponse.json(cachedEvents.data, {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
          "X-Cache": "HIT",
        },
      });
    }

    const events = await prisma.event.findMany({
      orderBy: { startDate: "asc" },
      include: {
        _count: {
          select: { teams: true },
        },
      },
    });

    const responseData = { success: true, events };
    cachedEvents = { timestamp: Date.now(), data: responseData };

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        "X-Cache": "MISS",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/events - Create a new event (Admin only)
export async function POST(req: Request) {
  let distinctId = "server";
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

    distinctId = session.user.id;
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
      maxTeams,
      discordRoleId,
      discordAlertsChannelId,
      discordSquadsChannelId,
    } = body;

    const parsedMaxTeamSize =
      maxTeamSize !== undefined &&
      maxTeamSize !== null &&
      maxTeamSize !== "" &&
      Number(maxTeamSize) > 0
        ? Math.max(1, Number(maxTeamSize))
        : null;

    const parsedMaxTeams =
      maxTeams !== undefined && maxTeams !== null && maxTeams !== "" && Number(maxTeams) > 0
        ? Math.max(1, Number(maxTeams))
        : null;

    const newEvent = await prisma.event.create({
      data: {
        title: title.trim(),
        code: code.toUpperCase().trim(),
        description: description?.trim() || null,
        regStart: regStart ? new Date(regStart) : null,
        regEnd: regEnd ? new Date(regEnd) : null,
        teamFormationStart: teamFormationStart ? new Date(teamFormationStart) : null,
        teamFormationEnd: teamFormationEnd ? new Date(teamFormationEnd) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        submissionStart: submissionStart ? new Date(submissionStart) : null,
        submissionEnd: submissionEnd ? new Date(submissionEnd) : null,
        maxTeamSize: parsedMaxTeamSize,
        maxTeams: parsedMaxTeams,
        discordRoleId: discordRoleId?.trim() || null,
        discordAlertsChannelId: discordAlertsChannelId?.trim() || null,
        discordSquadsChannelId: discordSquadsChannelId?.trim() || null,
        status: "ACTIVE",
      },
    });

    invalidateEventsCache();

    await captureServerEvent(session.user.id, "campaign_created", {
      campaign_id: newEvent.id,
      status: newEvent.status,
      max_team_size: newEvent.maxTeamSize,
      max_teams: newEvent.maxTeams,
      has_registration_window: Boolean(newEvent.regStart || newEvent.regEnd),
      has_submission_window: Boolean(newEvent.submissionStart || newEvent.submissionEnd),
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error: any) {
    await captureServerException(error, distinctId, { route: "/api/events", method: "POST" });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
