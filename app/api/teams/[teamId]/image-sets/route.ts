import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { parseMpcReport, extractImageSetIds } from "@/lib/mpc-parser";
import { CandidateReport } from "@/types/mpc";
import { isOrganizer } from "@/lib/rbac";

// GET /api/teams/[teamId]/image-sets - List image sets for the team
export async function GET(
  req: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { teamId } = await context.params;

    // Check membership
    const isMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: session.user.id,
        },
      },
    });

    const isStaffOrAdmin = isOrganizer(session.user);

    if (!isMember && !isStaffOrAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied. You are not an active member of this squad." },
        { status: 403 }
      );
    }

    const sets = await prisma.imageSet.findMany({
      where: { teamId },
      include: {
        claimedBy: {
          select: { id: true, name: true, email: true, institution: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formattedSets = sets.map((s) => {
      let candidates: any[] = [];
      if (s.mpcReportText) {
        try {
          const parsed = parseMpcReport(s.mpcReportText);
          candidates = parsed.candidates.map((c: CandidateReport, i: number) => ({
            id: `${s.id}-${i}`,
            candidateCode: c.candidateCode,
            ra: c.observations?.[0]?.raRaw || "",
            dec: c.observations?.[0]?.decRaw || "",
            magnitude: c.avgMagnitude || 0,
            status: "REPORTED",
            observationCount: c.observationCount || 0,
            speedArcsecPerHour: c.speedArcsecPerHour || null,
          }));
        } catch {
          // ignore parse errors
        }
      }

      return {
        id: s.id,
        setCode: s.name,
        fitsUrl: s.fitsUrl,
        status: s.status, // "UNASSIGNED" | "IN_PROGRESS" | "PENDING_APPROVAL" | "SUBMITTED"
        isClean: s.isClean,
        mpcReportText: s.mpcReportText,
        submittedAt: s.submittedAt,
        claimedByUser: s.claimedBy,
        candidates,
      };
    });

    return NextResponse.json({ success: true, imageSets: formattedSets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/teams/[teamId]/image-sets - Add image set(s) (Only Team Leader or Admin)
export async function POST(
  req: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await context.params;

    // Fetch team to verify leadership and event
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found." }, { status: 404 });
    }

    const isLeader = team.leaderId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isLeader && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Only the squad leader or administrator can upload or import image sets." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { rawText, setCode } = body;

    let codesToAdd: string[] = [];

    if (rawText) {
      codesToAdd = extractImageSetIds(rawText);
    } else if (setCode) {
      codesToAdd = [setCode.toUpperCase().trim()];
    }

    if (codesToAdd.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid image set codes found (e.g. PS1-26A-01, G96-24K02)." },
        { status: 400 }
      );
    }

    const created: string[] = [];
    for (const code of codesToAdd) {
      try {
        await prisma.imageSet.create({
          data: {
            eventId: team.eventId,
            teamId,
            name: code,
            status: "UNASSIGNED",
          },
        });
        created.push(code);
      } catch (err: any) {
        // Skip duplicates
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${created.length} image set(s).`,
      totalAdded: created.length,
      sets: created,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
