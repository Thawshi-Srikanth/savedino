import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { parseMpcReport } from "@/lib/mpc-parser";
import { isSubmissionClosed } from "@/lib/campaign-engine";
import { notifyAsteroidDiscovery } from "@/lib/discord";
import { captureServerEvent, captureServerException } from "@/lib/posthog-server";

// POST /api/teams/[teamId]/image-sets/[setId]/report - Submit MPC Discovery Report
export async function POST(
  req: Request,
  context: { params: Promise<{ teamId: string; setId: string }> }
) {
  let distinctId = "server";
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    distinctId = session.user.id;
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
          {
            success: false,
            error: subCheck.reason || "The report submission window for this campaign has closed.",
          },
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

    // Check membership
    const isMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: session.user.id,
        },
      },
    });

    const isLeader = team?.leaderId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isMember && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Only team members can submit reports for this squad." },
        { status: 403 }
      );
    }

    const targetStatus = isLeader || isAdmin ? "SUBMITTED" : "PENDING_APPROVAL";

    // 1. If marked clean (no asteroids in this set)
    if (markClean) {
      const updatedSet = await prisma.imageSet.update({
        where: { id: setId },
        data: {
          status: targetStatus,
          isClean: true,
          mpcReportText: null,
          claimedById: session.user.id,
          submittedAt: isLeader || isAdmin ? new Date() : null,
        },
      });

      await captureServerEvent(session.user.id, "discovery_report_submitted", {
        team_id: teamId,
        campaign_id: team?.eventId,
        image_set_id: setId,
        marked_clean: true,
        pending_approval: targetStatus === "PENDING_APPROVAL",
        observation_count: 0,
      });

      return NextResponse.json({
        success: true,
        pendingApproval: targetStatus === "PENDING_APPROVAL",
        message:
          targetStatus === "PENDING_APPROVAL"
            ? "Picture set marked clean. Awaiting team leader approval."
            : "Picture set marked clean and submitted.",
        imageSet: updatedSet,
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
        status: targetStatus,
        isClean: false,
        mpcReportText: reportText,
        claimedById: session.user.id,
        submittedAt: isLeader || isAdmin ? new Date() : null,
      },
    });

    // Trigger Discord notification if candidates found and submitted
    if (
      targetStatus === "SUBMITTED" &&
      team?.event?.discordAlertsChannelId &&
      parsed.totalObservations > 0
    ) {
      notifyAsteroidDiscovery({
        channelId: team.event.discordAlertsChannelId,
        campaignTitle: team.event.title,
        teamName: team.name,
        setName: currentSet.name,
        candidateCount: parsed.totalObservations,
      }).catch((err) =>
        console.error("[Discord Broadcast] Failed to notify asteroid discovery:", err)
      );
    }

    await captureServerEvent(session.user.id, "discovery_report_submitted", {
      team_id: teamId,
      campaign_id: team?.eventId,
      image_set_id: setId,
      marked_clean: false,
      pending_approval: targetStatus === "PENDING_APPROVAL",
      observation_count: parsed.totalObservations,
    });

    return NextResponse.json({
      success: true,
      pendingApproval: targetStatus === "PENDING_APPROVAL",
      message:
        targetStatus === "PENDING_APPROVAL"
          ? "Discovery report submitted. Awaiting team leader approval."
          : "Discovery report submitted and approved for squad.",
      observatory: parsed.observatoryCode,
      telescope: parsed.telescope,
      totalObservations: parsed.totalObservations,
      imageSet: updatedSet,
    });
  } catch (error: any) {
    await captureServerException(error, distinctId, {
      route: "/api/teams/[teamId]/image-sets/[setId]/report",
      method: "POST",
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
