import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { calculateTeamStatus } from "@/lib/campaign-engine";

// DELETE /api/admin/users/[userId]/team - Remove a user from their active team
export async function DELETE(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin or Staff privileges required." },
        { status: 403 }
      );
    }

    const { userId } = await context.params;

    // Find user's active team membership
    const membership = await prisma.teamMember.findFirst({
      where: { userId },
      include: { team: { include: { members: true } } },
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "User is not currently assigned to any team." },
        { status: 404 }
      );
    }

    const teamId = membership.teamId;
    const remainingCount = membership.team.members.length - 1;
    const newStatus = calculateTeamStatus(remainingCount);

    await prisma.$transaction([
      prisma.teamMember.delete({
        where: { id: membership.id },
      }),
      prisma.team.update({
        where: { id: teamId },
        data: { status: newStatus },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "User successfully removed from team.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove user from team." },
      { status: 500 }
    );
  }
}
