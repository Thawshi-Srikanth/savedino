import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/user/profile - Fetch current user profile, team history, and event activity
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch user details and related squad & campaign records
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        institution: true,
        country: true,
        createdAt: true,
        teamMembers: {
          include: {
            team: {
              include: {
                event: {
                  select: {
                    id: true,
                    title: true,
                    code: true,
                    status: true,
                    startDate: true,
                    endDate: true,
                    regStart: true,
                    regEnd: true,
                  },
                },
                _count: {
                  select: {
                    members: true,
                    imageSets: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        claimedSets: {
          select: {
            id: true,
            name: true,
            status: true,
            isClean: true,
            submittedAt: true,
            createdAt: true,
            event: {
              select: {
                id: true,
                title: true,
                code: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
        joinRequests: {
          select: {
            id: true,
            status: true,
            message: true,
            createdAt: true,
            team: {
              select: {
                id: true,
                name: true,
                inviteCode: true,
                event: {
                  select: {
                    id: true,
                    title: true,
                    code: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const isStaffOrAdmin = user.role === "admin" || user.role === "staff";

    // Extract unique campaigns
    const uniqueCampaignsMap = new Map<string, any>();
    user.teamMembers.forEach((tm) => {
      if (tm.team?.event) {
        const isLeader = tm.role === "leader";
        const canSeeCode = isLeader || isStaffOrAdmin;
        uniqueCampaignsMap.set(tm.team.event.id, {
          event: tm.team.event,
          team: {
            id: tm.team.id,
            name: tm.team.name,
            inviteCode: canSeeCode ? tm.team.inviteCode : null,
            status: tm.team.status,
            role: tm.role,
            memberCount: tm.team._count.members,
            imageSetsCount: tm.team._count.imageSets,
            joinedAt: tm.createdAt,
          },
        });
      }
    });

    const campaigns = Array.from(uniqueCampaignsMap.values());
    const squadsLeadCount = user.teamMembers.filter((tm) => tm.role === "leader").length;
    const submittedSetsCount = user.claimedSets.filter((s) => s.status === "SUBMITTED").length;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        institution: user.institution,
        country: user.country,
        createdAt: user.createdAt,
      },
      campaigns,
      teams: user.teamMembers.map((tm) => {
        const isLeader = tm.role === "leader";
        const canSeeCode = isLeader || isStaffOrAdmin;
        return {
          id: tm.team.id,
          name: tm.team.name,
          inviteCode: canSeeCode ? tm.team.inviteCode : null,
          status: tm.team.status,
          role: tm.role,
          event: tm.team.event,
          memberCount: tm.team._count.members,
          imageSetsCount: tm.team._count.imageSets,
          joinedAt: tm.createdAt,
        };
      }),
      claimedSets: user.claimedSets,
      joinRequests: user.joinRequests,
      stats: {
        campaignsCount: campaigns.length,
        teamsCount: user.teamMembers.length,
        squadsLeadCount,
        claimedSetsCount: user.claimedSets.length,
        submittedSetsCount,
      },
    });
  } catch (err: any) {
    console.error("GET /api/user/profile error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load profile data." },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile - Update user profile information & avatar seed
export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, institution, country, image } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Name is required and cannot be empty." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        institution: institution !== undefined ? (institution?.trim() || null) : undefined,
        country: country !== undefined ? (country?.trim() || null) : undefined,
        image: image !== undefined ? (image?.trim() || null) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        institution: true,
        country: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully.",
    });
  } catch (err: any) {
    console.error("PATCH /api/user/profile error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
