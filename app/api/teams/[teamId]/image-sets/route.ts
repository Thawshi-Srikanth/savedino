import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { extractImageSetIds } from "@/lib/mpc-parser";

// GET /api/teams/[teamId]/image-sets - List image sets for the team
export async function GET(
  req: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await context.params;

    const sets = await prisma.imageSet.findMany({
      where: { teamId },
      include: {
        claimedByUser: {
          select: { id: true, name: true, email: true },
        },
        candidates: true,
      },
      orderBy: { setCode: "asc" },
    });

    return NextResponse.json({ success: true, imageSets: sets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/teams/[teamId]/image-sets - Add image set(s) (supports manual code or bulk pasted IASC text)
export async function POST(
  req: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await context.params;
    const body = await req.json();
    const { rawText, setCode } = body;

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
        { success: false, error: "Only team members can log image sets." },
        { status: 403 }
      );
    }

    let codesToAdd: string[] = [];

    if (rawText) {
      codesToAdd = extractImageSetIds(rawText);
    } else if (setCode) {
      codesToAdd = [setCode.toUpperCase().trim()];
    }

    if (codesToAdd.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid image set codes found (e.g. PS1-26A-01, G96-24K02)." },
        { status: 400 }
      );
    }

    const created: string[] = [];
    for (const code of codesToAdd) {
      try {
        await prisma.imageSet.create({
          data: {
            teamId,
            setCode: code,
            status: "PENDING",
          },
        });
        created.push(code);
      } catch (err: any) {
        // Skip duplicate unique constraint
      }
    }

    return NextResponse.json({
      success: true,
      addedCodes: created,
      totalAdded: created.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
