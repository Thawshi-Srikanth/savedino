import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Dev switcher is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const currentUserId = session?.user?.id;

    // Fetch the 6 distinct test personas
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: [
            "admin@savedino.org",
            "staff@savedino.org",
            "leader@savedino.org",
            "member@savedino.org",
            "applicant@savedino.org",
            "solo@savedino.org",
          ],
        },
      },
      include: {
        teamMembers: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                inviteCode: true,
              },
            },
          },
        },
        joinRequests: {
          where: { status: "PENDING" },
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const orderMap: Record<string, number> = {
      admin: 1,
      staff: 2,
      leader: 3,
      member: 4,
      applicant: 5,
      solo: 6,
    };

    const personas = users.map((u) => {
      const isLeader = u.teamMembers.some((tm) => tm.role === "leader" || tm.role === "LEADER");
      const primaryTeam = u.teamMembers[0]?.team?.name;
      const pendingTeam = u.joinRequests[0]?.team?.name;

      let category: "admin" | "staff" | "leader" | "member" | "applicant" | "solo" = "solo";
      let contextLabel = "Solo Student";

      if (u.role === "admin") {
        category = "admin";
        contextLabel = "Platform Admin";
      } else if (u.role === "staff") {
        category = "staff";
        contextLabel = "Platform Staff";
      } else if (isLeader && primaryTeam) {
        category = "leader";
        contextLabel = `Leader (${primaryTeam})`;
      } else if (primaryTeam) {
        category = "member";
        contextLabel = `Member (${primaryTeam})`;
      } else if (pendingTeam) {
        category = "applicant";
        contextLabel = `Pending (${pendingTeam})`;
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        institution: u.institution,
        category,
        contextLabel,
        isCurrent: u.id === currentUserId,
        order: orderMap[category] || 99,
      };
    });

    personas.sort((a, b) => a.order - b.order);

    return NextResponse.json({
      success: true,
      currentSession: session?.user || null,
      personas,
    });
  } catch (error: any) {
    console.error("[Dev Personas Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load personas" },
      { status: 500 }
    );
  }
}
