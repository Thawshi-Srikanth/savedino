import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { assignDiscordRole, addMemberToThread } from "@/lib/discord";

export const dynamic = "force-dynamic";

/**
 * POST /api/user/sync-discord
 * Automatically syncs Discord roles & threads for the logged-in user if they have a connected Discord account.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Find linked Discord account
    const discordAccount = await prisma.account.findFirst({
      where: { userId, providerId: "discord" },
      select: { accountId: true },
    });

    if (!discordAccount?.accountId) {
      return NextResponse.json(
        { success: false, error: "No Discord account linked to this profile." },
        { status: 400 }
      );
    }

    const discordUserId = discordAccount.accountId;

    // 2. Assign Global Member Role (if configured in .env)
    const globalRoleId = process.env.DISCORD_MEMBER_ROLE_ID;
    if (globalRoleId) {
      await assignDiscordRole(discordUserId, globalRoleId).catch((e) =>
        console.error("[Discord Sync] Failed to assign global role:", e)
      );
    }

    // 3. Find user's active team memberships & campaigns
    const memberships = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            event: true,
          },
        },
      },
    });

    for (const m of memberships) {
      const { team } = m;
      if (!team) continue;

      // Assign Campaign Role
      if (team.event?.discordRoleId) {
        await assignDiscordRole(discordUserId, team.event.discordRoleId).catch((e) =>
          console.error("[Discord Sync] Failed to assign campaign role:", e)
        );
      }

      // Add to Squad Thread
      if (team.discordThreadId) {
        await addMemberToThread(team.discordThreadId, discordUserId).catch((e) =>
          console.error("[Discord Sync] Failed to add member to squad thread:", e)
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Discord roles and squad channels synced successfully.",
    });
  } catch (error: any) {
    console.error("POST /api/user/sync-discord error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync Discord." },
      { status: 500 }
    );
  }
}
