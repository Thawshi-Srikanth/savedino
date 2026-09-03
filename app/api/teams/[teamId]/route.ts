import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// PATCH: Toggle team recruitment status and notes
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { teamId } = await params;
    const body = await request.json();
    const { isRecruiting, recruitmentNotes } = body;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found." }, { status: 404 });
    }

    if (team.leaderId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Only team leader or admin can update recruitment settings." }, { status: 403 });
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        isRecruiting: typeof isRecruiting === "boolean" ? isRecruiting : team.isRecruiting,
        recruitmentNotes: typeof recruitmentNotes === "string" ? recruitmentNotes.trim() : team.recruitmentNotes,
      },
    });

    return NextResponse.json({
      success: true,
      team: updatedTeam,
      message: "Recruitment stance updated!",
    });
  } catch (error: any) {
    console.error("PATCH /api/teams/[teamId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update recruitment stance." },
      { status: 500 }
    );
  }
}
