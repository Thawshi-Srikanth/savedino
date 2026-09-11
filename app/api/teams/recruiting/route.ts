import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      where: {
        isRecruiting: true,
        status: { not: "DISQUALIFIED" },
      },
      include: {
        event: {
          select: {
            title: true,
            code: true,
            maxTeamSize: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter out full teams based on campaign maxTeamSize
    const recruitingTeams = teams.filter(
      (t: any) => t.members.length < (t.event?.maxTeamSize || 6)
    );

    return NextResponse.json({
      success: true,
      teams: recruitingTeams,
    });
  } catch (error: any) {
    console.error("GET /api/teams/recruiting error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch recruiting teams." },
      { status: 500 }
    );
  }
}
