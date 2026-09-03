import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/teams/[teamId]/image-sets/[setId]/claim - Claim or unclaim image set
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

    // Check membership
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
        { success: false, error: "Only team members can claim image sets." },
        { status: 403 }
      );
    }

    const currentSet = await prisma.imageSet.findUnique({
      where: { id: setId },
    });

    if (!currentSet) {
      return NextResponse.json({ success: false, error: "Set not found." }, { status: 404 });
    }

    // Toggle claim
    const isAlreadyClaimedByMe = currentSet.claimedByUserId === session.user.id;
    const updated = await prisma.imageSet.update({
      where: { id: setId },
      data: {
        claimedByUserId: isAlreadyClaimedByMe ? null : session.user.id,
        status: isAlreadyClaimedByMe ? "PENDING" : "CLAIMED",
      },
      include: {
        claimedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, imageSet: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
