import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitizeSeed } from "@/lib/seed-avatar";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.DEMO_MODE === "true") {
      return NextResponse.json(
        { success: false, error: "Leaderboard is disabled during Demo Mode." },
        { status: 403 }
      );
    }

    // 1. Parse leaderboard type from query: "score" (default) or "asteroids"
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") === "asteroids" ? "asteroids" : "score";

    // 2. Optional Authentication (to identify caller's rank)
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const currentUserId = session?.user?.id || null;

    // 3. Fetch Top 3 Global Scores according to selected type
    const orderByClause =
      type === "asteroids"
        ? [
            { meteorsDestroyed: "desc" as const },
            { score: "desc" as const },
            { updatedAt: "asc" as const },
          ]
        : [
            { score: "desc" as const },
            { meteorsDestroyed: "desc" as const },
            { updatedAt: "asc" as const },
          ];

    const [topScores, totalPlayers] = await Promise.all([
      prisma.arcadeScore.findMany({
        take: 3,
        orderBy: orderByClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              institution: true,
              country: true,
              role: true,
            },
          },
        },
      }),
      prisma.arcadeScore.count(),
    ]);

    const topThree = topScores.map((item, index) => ({
      id: item.id,
      userId: item.userId,
      rank: index + 1,
      score: item.score,
      meteorsDestroyed: item.meteorsDestroyed,
      updatedAt: item.updatedAt,
      user: {
        id: item.user.id,
        name: item.user.name,
        image: sanitizeSeed(item.user.image || item.user.name || item.user.id),
        institution: item.user.institution,
        country: item.user.country,
        role: item.user.role,
      },
    }));

    // 4. Determine current user's personal best & global rank
    let currentUserEntry: {
      id: string;
      userId: string;
      rank: number;
      score: number;
      meteorsDestroyed: number;
      updatedAt: Date;
      user: {
        id: string;
        name: string;
        image: string | null;
        institution: string | null;
        country: string | null;
        role: string;
      };
    } | null = null;

    if (currentUserId) {
      const existingInTop = topThree.find((entry) => entry.userId === currentUserId);
      if (existingInTop) {
        currentUserEntry = existingInTop as any;
      } else {
        const userScoreRecord = await prisma.arcadeScore.findUnique({
          where: { userId: currentUserId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                institution: true,
                country: true,
                role: true,
              },
            },
          },
        });

        if (userScoreRecord) {
          const rankWhere =
            type === "asteroids"
              ? {
                  OR: [
                    { meteorsDestroyed: { gt: userScoreRecord.meteorsDestroyed } },
                    {
                      meteorsDestroyed: userScoreRecord.meteorsDestroyed,
                      score: { gt: userScoreRecord.score },
                    },
                  ],
                }
              : {
                  OR: [
                    { score: { gt: userScoreRecord.score } },
                    {
                      score: userScoreRecord.score,
                      meteorsDestroyed: { gt: userScoreRecord.meteorsDestroyed },
                    },
                  ],
                };

          const higherCount = await prisma.arcadeScore.count({
            where: rankWhere,
          });

          currentUserEntry = {
            id: userScoreRecord.id,
            userId: userScoreRecord.userId,
            rank: higherCount + 1,
            score: userScoreRecord.score,
            meteorsDestroyed: userScoreRecord.meteorsDestroyed,
            updatedAt: userScoreRecord.updatedAt,
            user: {
              ...userScoreRecord.user,
              image: sanitizeSeed(
                userScoreRecord.user.image || userScoreRecord.user.name || userScoreRecord.user.id
              ),
            },
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      type,
      leaderboard: topThree,
      currentUser: currentUserEntry,
      totalPlayers,
    });
  } catch (error: any) {
    console.error("[Arcade Leaderboard Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load leaderboard." },
      { status: 500 }
    );
  }
}
