import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/teams/[teamId]/image-sets/[setId]/approve - Leader approves or requests revisions on a submission
export async function POST(
  req: Request,
  context: { params: Promise<{ teamId: string; setId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { teamId, setId } = await context.params;
    const body = await req.json();
    const { action, feedback } = body; // "APPROVE" | "REJECT"

    if (!["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be APPROVE or REJECT." },
        { status: 400 }
      );
    }

    // Verify team leadership or admin
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
        { success: false, error: "Only the squad leader or administrator can approve or reject submissions." },
        { status: 403 }
      );
    }

    const currentSet = await prisma.imageSet.findUnique({
      where: { id: setId },
      include: {
        claimedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!currentSet) {
      return NextResponse.json({ success: false, error: "Image set not found." }, { status: 404 });
    }

    if (action === "APPROVE") {
      const updated = await prisma.imageSet.update({
        where: { id: setId },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Approved report for ${currentSet.name}! Observation recorded for campaign.`,
        imageSet: updated,
      });
    } else {
      // REJECT / Request Changes: return back to IN_PROGRESS so the analyst can adjust
      const updated = await prisma.imageSet.update({
        where: { id: setId },
        data: {
          status: "IN_PROGRESS",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Returned set ${currentSet.name} to analyst for revision.`,
        imageSet: updated,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
