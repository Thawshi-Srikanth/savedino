import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkUserEventConcurrency, generateInviteCode } from "@/lib/campaign-engine";
import { notifySquadCreated, createSquadThread } from "@/lib/discord";
import { invalidateTeamsCache } from "@/app/api/teams/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST /api/admin/teams - Admin manual squad/team creation
export async function POST(req: Request) {
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

    const body = await req.json();
    const {
      eventId,
      name,
      leaderId,
      inviteCode: customInviteCode,
      status = "FORMING",
      isRecruiting = true,
      recruitmentNotes,
      leaderContact,
    } = body;

    // Validate required fields
    if (!eventId || typeof eventId !== "string" || !eventId.trim()) {
      return NextResponse.json(
        { success: false, error: "Please select a campaign event." },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid squad name." },
        { status: 400 }
      );
    }

    if (!leaderId || typeof leaderId !== "string" || !leaderId.trim()) {
      return NextResponse.json(
        { success: false, error: "Please assign a squad leader." },
        { status: 400 }
      );
    }

    // 1. Check Event Existence
    const targetEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!targetEvent) {
      return NextResponse.json(
        { success: false, error: "Selected campaign does not exist." },
        { status: 404 }
      );
    }

    // 2. Check Leader User Existence & Eligibility
    const leaderUser = await prisma.user.findUnique({
      where: { id: leaderId },
    });

    if (!leaderUser) {
      return NextResponse.json(
        { success: false, error: "Selected squad leader does not exist." },
        { status: 404 }
      );
    }

    if (leaderUser.banned) {
      return NextResponse.json(
        {
          success: false,
          error: "Suspended or banned users cannot be assigned as squad leaders.",
        },
        { status: 400 }
      );
    }

    // 3. Check Event Concurrency for Leader
    const concurrency = await checkUserEventConcurrency(leaderId, eventId);
    if (!concurrency.canEnroll) {
      return NextResponse.json(
        {
          success: false,
          error: `Leader conflict: ${concurrency.reason || "User is already participating in a concurrent squad."}`,
        },
        { status: 409 }
      );
    }

    // 4. Check for duplicate squad name in same campaign
    const duplicateTeam = await prisma.team.findFirst({
      where: {
        eventId,
        name: { equals: name.trim(), mode: "insensitive" },
      },
    });

    if (duplicateTeam) {
      return NextResponse.json(
        {
          success: false,
          error: `A squad named "${name.trim()}" already exists in this campaign. Please choose a different name.`,
        },
        { status: 400 }
      );
    }

    // 5. Generate or validate invite code
    let inviteCode = customInviteCode
      ? customInviteCode.trim().toUpperCase()
      : generateInviteCode();

    if (customInviteCode) {
      const codeTaken = await prisma.team.findUnique({
        where: { inviteCode },
      });
      if (codeTaken) {
        return NextResponse.json(
          {
            success: false,
            error: `Invite code "${inviteCode}" is already taken. Please choose another or rotate.`,
          },
          { status: 400 }
        );
      }
    } else {
      while (await prisma.team.findUnique({ where: { inviteCode } })) {
        inviteCode = generateInviteCode();
      }
    }

    // 6. Create Team and add leader as first member
    const newTeam = await prisma.team.create({
      data: {
        eventId,
        name: name.trim(),
        inviteCode,
        leaderId,
        status: (status as any) || "FORMING",
        isRecruiting: Boolean(isRecruiting),
        recruitmentNotes:
          typeof recruitmentNotes === "string" ? recruitmentNotes.trim() || null : null,
        leaderContact: typeof leaderContact === "string" ? leaderContact.trim() || null : null,
        members: {
          create: {
            userId: leaderId,
            role: "LEADER",
          },
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            code: true,
            maxTeamSize: true,
            maxTeams: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                country: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            joinRequests: true,
            imageSets: true,
          },
        },
      },
    });

    // Invalidate Teams cache
    invalidateTeamsCache();

    // Trigger Discord Thread Creation & Notification if configured
    if (targetEvent.discordSquadsChannelId) {
      const leaderAccount = await prisma.account.findFirst({
        where: { userId: leaderId, providerId: "discord" },
        select: { accountId: true },
      });

      createSquadThread({
        channelId: targetEvent.discordSquadsChannelId,
        squadName: newTeam.name,
        teamCode: newTeam.inviteCode,
        leaderDiscordUserId: leaderAccount?.accountId || null,
      })
        .then(async (threadInfo) => {
          if (threadInfo) {
            await prisma.team.update({
              where: { id: newTeam.id },
              data: {
                discordThreadId: threadInfo.threadId,
                discordThreadUrl: threadInfo.threadUrl,
              },
            });
          }

          return notifySquadCreated({
            channelId: targetEvent.discordSquadsChannelId!,
            campaignTitle: targetEvent.title,
            teamName: newTeam.name,
            leaderName: leaderUser.name || "Squad Leader",
            inviteCode: newTeam.inviteCode,
            isRecruiting: newTeam.isRecruiting,
            recruitmentNotes: newTeam.recruitmentNotes,
            maxTeamSize: targetEvent.maxTeamSize,
            threadUrl: threadInfo?.threadUrl || null,
          });
        })
        .catch((err) => console.error("[Discord Broadcast] Failed admin squad automation:", err));
    }

    return NextResponse.json({
      success: true,
      message: `Squad "${newTeam.name}" successfully created with ${leaderUser.name} as squad leader.`,
      team: newTeam,
    });
  } catch (error: any) {
    console.error("POST /api/admin/teams error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create squad." },
      { status: 500 }
    );
  }
}
