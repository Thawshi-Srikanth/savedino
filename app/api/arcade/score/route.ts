import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.DEMO_MODE === "true") {
      return NextResponse.json(
        { success: false, error: "Registrations and leaderboard are disabled in Demo Mode." },
        { status: 403 }
      );
    }

    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to submit global scores." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const rawScore = Number(body.score);
    const rawDestroyed = Number(body.meteorsDestroyed ?? 0);

    // 2. Validate inputs
    if (isNaN(rawScore) || rawScore < 0 || rawScore > 10_000_000) {
      return NextResponse.json({ success: false, error: "Invalid score value." }, { status: 400 });
    }

    const score = Math.floor(rawScore);
    const meteorsDestroyed = Math.max(0, Math.floor(isNaN(rawDestroyed) ? 0 : rawDestroyed));

    // 3. Find existing record
    const existing = await prisma.arcadeScore.findUnique({
      where: { userId },
    });

    let isNewHighScore = false;
    let finalScore = score;
    let finalDestroyed = meteorsDestroyed;

    if (!existing) {
      isNewHighScore = true;
      await prisma.arcadeScore.create({
        data: {
          userId,
          score,
          meteorsDestroyed,
        },
      });
      finalScore = score;
      finalDestroyed = meteorsDestroyed;
    } else {
      isNewHighScore = score > existing.score;
      finalScore = Math.max(existing.score, score);
      finalDestroyed = existing.meteorsDestroyed + meteorsDestroyed;

      await prisma.arcadeScore.update({
        where: { userId },
        data: {
          score: finalScore,
          meteorsDestroyed: finalDestroyed,
        },
      });
    }

    // 4. Calculate current global rank
    const higherCount = await prisma.arcadeScore.count({
      where: {
        OR: [
          { score: { gt: finalScore } },
          {
            score: finalScore,
            meteorsDestroyed: { gt: finalDestroyed },
          },
        ],
      },
    });

    const rank = higherCount + 1;

    return NextResponse.json({
      success: true,
      isNewHighScore,
      highScore: finalScore,
      meteorsDestroyed: finalDestroyed,
      rank,
    });
  } catch (error: any) {
    console.error("[Arcade Score Submission Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit score." },
      { status: 500 }
    );
  }
}
