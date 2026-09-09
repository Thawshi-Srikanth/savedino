import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateInviteCode } from "@/lib/campaign-engine";

export const dynamic = "force-dynamic";

// GET: Fetch squad workspace details (members, event, invite code, status)
export async function GET(
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

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            code: true,
            startDate: true,
            endDate: true,
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
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            members: true,
            joinRequests: true,
            imageSets: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Squad not found." }, { status: 404 });
    }

    const isMember = team.members.some((m) => m.userId === session.user.id);
    const isStaffOrAdmin = session.user.role === "admin" || session.user.role === "staff";

    if (!isMember && !isStaffOrAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. You are not an active member of this squad.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        team,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/teams/[teamId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load squad details." },
      { status: 500 }
    );
  }
}

// PATCH: Update team settings, status, name, leader, recruitment, and disqualification reason
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
    const { name, inviteCode, status, isRecruiting, recruitmentNotes, disqualificationReason, leaderId, rotateInviteCode } = body;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found." }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin";
    const isLeader = team.leaderId === session.user.id;

    if (!isAdmin && !isLeader) {
      return NextResponse.json(
        { success: false, error: "Only team leader or administrator can update this squad." },
        { status: 403 }
      );
    }

    // Strict guard: if squad was disabled/disqualified by an admin, non-admins cannot alter anything
    if (team.status === "DISQUALIFIED" && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "This squad has been disabled by platform administration and cannot be modified by team members or leaders.",
        },
        { status: 403 }
      );
    }

    const updateData: any = {};

    // Status updates
    let targetStatus = team.status;
    if (status && (status === "FORMING" || status === "ACTIVE" || status === "SUBMITTED" || status === "DISQUALIFIED")) {
      if (isAdmin || (isLeader && status !== "DISQUALIFIED")) {
        updateData.status = status;
        targetStatus = status;
        if (status !== "DISQUALIFIED" && isAdmin && disqualificationReason === undefined) {
          updateData.disqualificationReason = null;
        }
      }
    }

    // Strict recruitment rule: if status is or becomes DISQUALIFIED, isRecruiting is strictly forced to false
    if (targetStatus === "DISQUALIFIED") {
      updateData.isRecruiting = false;
    } else if (typeof isRecruiting === "boolean") {
      updateData.isRecruiting = isRecruiting;
    }

    if (typeof recruitmentNotes === "string") {
      updateData.recruitmentNotes = recruitmentNotes.trim();
    }

    if (typeof disqualificationReason === "string" && isAdmin) {
      updateData.disqualificationReason = disqualificationReason.trim() || null;
    }

    if (rotateInviteCode || inviteCode === "ROTATE") {
      let newCode = generateInviteCode();
      while (await prisma.team.findUnique({ where: { inviteCode: newCode } })) {
        newCode = generateInviteCode();
      }
      updateData.inviteCode = newCode;
    } else if (inviteCode && typeof inviteCode === "string" && isAdmin) {
      updateData.inviteCode = inviteCode.trim().toUpperCase();
    }

    if (name && typeof name === "string") {
      updateData.name = name.trim();
    }

    if (leaderId && typeof leaderId === "string" && isAdmin) {
      // Ensure the new leader is a member of the team
      const isMember = team.members.some((m) => m.userId === leaderId);
      if (isMember) {
        updateData.leaderId = leaderId;
        // Also update role in team_member table
        await prisma.teamMember.updateMany({
          where: { teamId, role: "LEADER" },
          data: { role: "member" },
        });
        await prisma.teamMember.updateMany({
          where: { teamId, userId: leaderId },
          data: { role: "LEADER" },
        });
      }
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
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
    });

    return NextResponse.json({
      success: true,
      team: updatedTeam,
      message: "Squad updated successfully!",
    });
  } catch (error: any) {
    console.error("PATCH /api/teams/[teamId] error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Squad name or invite code is already taken." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update squad." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a squad (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only administrators can delete squads." },
        { status: 403 }
      );
    }

    const { teamId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Squad not found." }, { status: 404 });
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json({
      success: true,
      message: `Squad '${team.name}' has been deleted.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/teams/[teamId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete squad." },
      { status: 500 }
    );
  }
}
