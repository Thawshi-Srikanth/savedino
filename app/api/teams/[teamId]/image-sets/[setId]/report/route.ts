import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { parseMpcReport } from "@/lib/mpc-parser";

// POST /api/teams/[teamId]/image-sets/[setId]/report - Upload Astrometrica MPC Report
export async function POST(
  req: Request,
  context: { params: Promise<{ teamId: string; setId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, setId } = await context.params;
    const body = await req.json();
    const { reportText, markClean } = body;

    // Verify membership
    const isMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: session.user.id,
        },
      },
    });

    if (!isMember && session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only team members can submit reports." },
        { status: 403 }
      );
    }

    // 1. If marked clean (no asteroids in this set)
    if (markClean) {
      await prisma.imageSet.update({
        where: { id: setId },
        data: { status: "CLEAN", claimedByUserId: session.user.id },
      });

      return NextResponse.json({
        success: true,
        message: "Picture set marked as Clean (No moving objects detected).",
      });
    }

    // 2. Parse MPC Report
    if (!reportText) {
      return NextResponse.json(
        { success: false, error: "Report text or clean flag required." },
        { status: 400 }
      );
    }

    const parsed = parseMpcReport(reportText);

    if (parsed.candidates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No valid candidate observations found in this report. If no asteroids were detected, use 'Mark Clean'.",
        },
        { status: 400 }
      );
    }

    // 3. Save candidates
    const createdCandidates = [];
    for (const cand of parsed.candidates) {
      const firstObs = cand.observations[0];
      const newCand = await prisma.candidate.create({
        data: {
          teamId,
          imageSetId: setId,
          candidateCode: cand.candidateCode,
          ra: firstObs.raRaw,
          dec: firstObs.decRaw,
          magnitude: cand.avgMagnitude,
          observedAt: cand.firstSeen,
          status: cand.isNewDiscovery ? "PRELIMINARY" : "SUBMITTED",
          rawMpcLine: firstObs.rawLine,
        },
      });
      createdCandidates.push({
        ...newCand,
        speedArcsecPerHour: cand.speedArcsecPerHour,
        observationCount: cand.observationCount,
      });
    }

    // 4. Update image set to REPORTED
    await prisma.imageSet.update({
      where: { id: setId },
      data: { status: "REPORTED", claimedByUserId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      observatory: parsed.observatoryCode,
      telescope: parsed.telescope,
      candidates: createdCandidates,
      totalObservations: parsed.totalObservations,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
