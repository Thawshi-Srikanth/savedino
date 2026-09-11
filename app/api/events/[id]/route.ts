import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/events/[id] - Get detailed campaign by ID or Code
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ id }, { code: id.toUpperCase() }],
      },
      include: {
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    country: true,
                    institution: true,
                  },
                },
              },
            },
            _count: {
              select: {
                members: true,
                imageSets: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { teams: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Campaign not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/events/[id] - Update campaign event (Admin only)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const existingEvent = await prisma.event.findFirst({
      where: { OR: [{ id }, { code: id.toUpperCase() }] },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: "Campaign event not found." },
        { status: 404 }
      );
    }

    const dataToUpdate: any = {};

    if (body.title !== undefined) dataToUpdate.title = body.title.trim();
    if (body.description !== undefined) dataToUpdate.description = body.description?.trim() || null;
    if (body.status !== undefined) dataToUpdate.status = body.status;

    if (body.code !== undefined && body.code.trim()) {
      const newCode = body.code.toUpperCase().trim();
      if (newCode !== existingEvent.code) {
        const codeConflict = await prisma.event.findUnique({
          where: { code: newCode },
        });
        if (codeConflict) {
          return NextResponse.json(
            { success: false, error: `Campaign code '${newCode}' is already in use.` },
            { status: 400 }
          );
        }
        dataToUpdate.code = newCode;
      }
    }

    if (body.regStart) dataToUpdate.regStart = new Date(body.regStart);
    if (body.regEnd) dataToUpdate.regEnd = new Date(body.regEnd);
    if (body.teamFormationStart)
      dataToUpdate.teamFormationStart = new Date(body.teamFormationStart);
    if (body.teamFormationEnd) dataToUpdate.teamFormationEnd = new Date(body.teamFormationEnd);
    if (body.startDate) dataToUpdate.startDate = new Date(body.startDate);
    if (body.endDate) dataToUpdate.endDate = new Date(body.endDate);
    if (body.submissionStart) dataToUpdate.submissionStart = new Date(body.submissionStart);
    if (body.submissionEnd) dataToUpdate.submissionEnd = new Date(body.submissionEnd);
    if (body.maxTeamSize !== undefined) {
      dataToUpdate.maxTeamSize = Math.max(2, Math.min(30, Number(body.maxTeamSize)));
    }

    const updatedEvent = await prisma.event.update({
      where: { id: existingEvent.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error: any) {
    console.error("PATCH /api/events/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update campaign." },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete campaign event (Admin & Staff only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Administrator or Staff privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingEvent = await prisma.event.findFirst({
      where: { OR: [{ id }, { code: id.toUpperCase() }] },
    });

    if (!existingEvent) {
      return NextResponse.json({ success: false, error: "Campaign not found." }, { status: 404 });
    }

    // Cleanly delete all associated child records in safe foreign key order
    await prisma.$transaction(async (tx) => {
      // 1. Delete all image sets in this campaign
      await tx.imageSet.deleteMany({
        where: { eventId: existingEvent.id },
      });

      // 2. Find all teams in this campaign
      const teams = await tx.team.findMany({
        where: { eventId: existingEvent.id },
        select: { id: true },
      });
      const teamIds = teams.map((t) => t.id);

      if (teamIds.length > 0) {
        // 3. Delete join requests for these teams
        await tx.teamJoinRequest.deleteMany({
          where: { teamId: { in: teamIds } },
        });

        // 4. Delete team members
        await tx.teamMember.deleteMany({
          where: { teamId: { in: teamIds } },
        });

        // 5. Delete the teams
        await tx.team.deleteMany({
          where: { id: { in: teamIds } },
        });
      }

      // 6. Delete the campaign event
      await tx.event.delete({
        where: { id: existingEvent.id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Campaign '${existingEvent.title}' (${existingEvent.code}) and all related data deleted successfully.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete campaign." },
      { status: 500 }
    );
  }
}
