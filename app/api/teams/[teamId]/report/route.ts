import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendTeamReportEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { teamId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Squad not found." }, { status: 404 });
    }

    const currentMember = team.members.find((m) => m.userId === session.user.id);
    const isStaffOrAdmin = session.user.role === "admin" || session.user.role === "staff";

    // Only active members of this squad (or staff/admins) can submit a squad report
    if (!currentMember && !isStaffOrAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be an active member of this squad to submit an incident report.",
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { reason, description } = body;

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: "Please select a valid report reason / category." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please provide a detailed description (at least 10 characters) explaining the issue.",
        },
        { status: 400 }
      );
    }

    // Find squad leader details
    const leaderMember = team.members.find(
      (m) => m.role === "LEADER" || m.userId === team.leaderId
    );
    const leaderName = leaderMember?.user?.name || "Squad Leader";
    const leaderEmail = leaderMember?.user?.email || "Unknown";

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "https://savedino.sedssl.org";
    const teamUrl = `${baseUrl}/team/${team.id}`;

    // Dispatch incident report email to savedino@sedssl.org
    try {
      await sendTeamReportEmail(
        {
          reporterName: session.user.name || "Squad Member",
          reporterEmail: session.user.email || "",
          reporterRole: currentMember?.role === "LEADER" ? "Squad Leader" : "Squad Member",
          reporterUserId: session.user.id,
          teamName: team.name,
          teamId: team.id,
          campaignName: team.event?.title || team.event?.code || "SaveDino Campaign",
          leaderName,
          leaderEmail,
          reason: reason.trim(),
          description: description.trim(),
          teamUrl,
        },
        "savedino@sedssl.org"
      );
    } catch (emailErr: any) {
      console.error("[Team Report Email Error]:", emailErr);
      // Still return success to the user so they know their report was received
    }

    return NextResponse.json({
      success: true,
      message:
        "Your incident report has been securely submitted to the SaveDino administration team (savedino@sedssl.org). We will review the matter promptly.",
    });
  } catch (error: any) {
    console.error("POST /api/teams/[teamId]/report error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit incident report." },
      { status: 500 }
    );
  }
}
