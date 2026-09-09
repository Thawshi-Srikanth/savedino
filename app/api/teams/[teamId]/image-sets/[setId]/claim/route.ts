import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isOrganizer } from "@/lib/rbac";

// POST /api/teams/[teamId]/image-sets/[setId]/claim
// Handles: Member claim requests, Leader approvals/rejections, Member releases, and Leader direct member assignments
export async function POST(
  req: Request,
  context: { params: Promise<{ teamId: string; setId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { teamId, setId } = await context.params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is valid for simple toggle
    }

    const { action, targetUserId } = body; // action: "REQUEST_CLAIM" | "APPROVE_CLAIM" | "REJECT_CLAIM" | "ASSIGN" | "RELEASE"

    // 1. Fetch team and user membership
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Squad not found." }, { status: 404 });
    }

    const isMember = team.members.some((m) => m.userId === session.user.id);
    const isLeader = team.leaderId === session.user.id;
    const isStaffOrAdmin = isOrganizer(session.user);

    // Organizers observing cannot claim sets for themselves
    if (isStaffOrAdmin && !isMember && !action) {
      return NextResponse.json(
        { success: false, error: "Organizers view squads in read-only mode and cannot claim participant image sets." },
        { status: 403 }
      );
    }

    if (!isMember && !isStaffOrAdmin) {
      return NextResponse.json(
        { success: false, error: "Only active squad members can interact with image sets." },
        { status: 403 }
      );
    }

    // 2. Fetch target image set
    const currentSet = await prisma.imageSet.findUnique({
      where: { id: setId },
      include: {
        claimedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!currentSet) {
      return NextResponse.json({ success: false, error: "Image set not found." }, { status: 404 });
    }

    // --- CASE A: Leader Direct Assignment to a Team Member ---
    if (action === "ASSIGN") {
      if (!isLeader && !isStaffOrAdmin) {
        return NextResponse.json(
          { success: false, error: "Only squad leaders can assign image sets directly to members." },
          { status: 403 }
        );
      }

      if (!targetUserId) {
        return NextResponse.json(
          { success: false, error: "Target member ID is required." },
          { status: 400 }
        );
      }

      const targetMember = team.members.find((m) => m.userId === targetUserId);
      if (!targetMember) {
        return NextResponse.json(
          { success: false, error: "Selected user is not an active member of this squad." },
          { status: 400 }
        );
      }

      const updated = await prisma.imageSet.update({
        where: { id: setId },
        data: {
          claimedById: targetUserId,
          status: "IN_PROGRESS",
        },
        include: {
          claimedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully assigned ${currentSet.name} to ${targetMember.user.name}.`,
        imageSet: updated,
      });
    }

    // --- CASE B: Leader Approves a Member's Claim Request ---
    if (action === "APPROVE_CLAIM") {
      if (!isLeader && !isStaffOrAdmin) {
        return NextResponse.json(
          { success: false, error: "Only squad leaders can approve claim requests." },
          { status: 403 }
        );
      }

      if (!currentSet.claimedById) {
        return NextResponse.json(
          { success: false, error: "No member has requested this set." },
          { status: 400 }
        );
      }

      const updated = await prisma.imageSet.update({
        where: { id: setId },
        data: {
          status: "IN_PROGRESS",
        },
        include: {
          claimedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Approved claim request for ${currentSet.name}. Set is now in progress.`,
        imageSet: updated,
      });
    }

    // --- CASE C: Leader Rejects a Member's Claim Request ---
    if (action === "REJECT_CLAIM") {
      if (!isLeader && !isStaffOrAdmin) {
        return NextResponse.json(
          { success: false, error: "Only squad leaders can reject claim requests." },
          { status: 403 }
        );
      }

      const updated = await prisma.imageSet.update({
        where: { id: setId },
        data: {
          claimedById: null,
          status: "UNASSIGNED",
        },
        include: {
          claimedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Declined claim request. ${currentSet.name} is now unassigned.`,
        imageSet: updated,
      });
    }

    // --- CASE D: Member or Leader Releases / Unclaims / Cancels Request ---
    const isAlreadyMine = currentSet.claimedById === session.user.id;
    if (action === "RELEASE" || (isAlreadyMine && !action)) {
      const updated = await prisma.imageSet.update({
        where: { id: setId },
        data: {
          claimedById: null,
          status: "UNASSIGNED",
        },
        include: {
          claimedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Released ${currentSet.name}.`,
        imageSet: updated,
      });
    }

    // --- CASE E: Member Requests to Claim or Leader Claims for Self ---
    // If the set is already claimed by someone else
    if (currentSet.claimedById && currentSet.claimedById !== session.user.id && currentSet.status !== "UNASSIGNED") {
      return NextResponse.json(
        { success: false, error: "This image set is already being analyzed or requested by another member." },
        { status: 409 }
      );
    }

    // If Leader claims for self -> Immediately active (IN_PROGRESS)
    // If Member claims -> Requires Leader approval (CLAIM_REQUESTED)
    const newStatus = isLeader ? "IN_PROGRESS" : "CLAIM_REQUESTED";

    const updated = await prisma.imageSet.update({
      where: { id: setId },
      data: {
        claimedById: session.user.id,
        status: newStatus,
      },
      include: {
        claimedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const message = isLeader
      ? `Claimed ${currentSet.name}. You can now analyze and submit discovery reports.`
      : `Claim request submitted for ${currentSet.name}! Awaiting team leader approval.`;

    return NextResponse.json({
      success: true,
      message,
      imageSet: updated,
    });
  } catch (error: any) {
    console.error("[Claim Route Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
