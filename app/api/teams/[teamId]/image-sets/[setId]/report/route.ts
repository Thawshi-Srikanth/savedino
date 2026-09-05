import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { parseMpcReport } from "@/lib/mpc-parser";
import { isSubmissionClosed } from "@/lib/campaign-engine";

// POST /api/teams/[teamId]/image-sets/[setId]/report - Submit MPC Discovery Report
export async function POST(
  req: Request,
  context: { params: Promise<{ teamId: string; setId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { teamId, setId } = await context.params;
    const body = await req.json();
    const { reportText, markClean } = body;

    // Check team & event submission deadline
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { event: true },
    });

    if (team?.event) {
      const subCheck = isSubmissionClosed(team.event);
      if (subCheck.closed) {
        return NextResponse.json(
          { success: false, error: subCheck.reason || "The report submission window for this campaign has closed." },
          { status: 400 }
        );
      }
    }

    // Check set ownership
    const currentSet = await prisma.imageSet.findUnique({
      where: { id: setId },
    });

    if (!currentSet) {
      return NextResponse.json({ success: false, error: "Set not found." }, { status: 404 });
    }

    // 1. If marked clean (no asteroids in this set)
    if (markClean) {
      await prisma.imageSet.update({
        where: { id: setId },
        data: {
          status: "SUBMITTED",
          isClean: true,
          claimedById: session.user.id,
          submittedAt: new Date(),
        },
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

    // Save report on ImageSet
    const updatedSet = await prisma.imageSet.update({
      where: { id: setId },
      data: {
        status: "SUBMITTED",
        mpcReportText: reportText,
        claimedById: session.user.id,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      observatory: parsed.observatoryCode,
      telescope: parsed.telescope,
      totalObservations: parsed.totalObservations,
      imageSet: updatedSet,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
