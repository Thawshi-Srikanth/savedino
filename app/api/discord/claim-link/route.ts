import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyDiscordLinkToken, assignDiscordRole, addMemberToThread } from "@/lib/discord";

export const dynamic = "force-dynamic";

/**
 * POST /api/discord/claim-link
 * Claims a 1-time Discord link token for the currently authenticated user.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please sign in to complete account linking." },
        { status: 401 }
      );
    }

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing link token." }, { status: 400 });
    }

    // 1. Verify token validity and signature
    const verified = verifyDiscordLinkToken(token);
    if (!verified || !verified.discordUserId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This link has expired or is invalid. Please type /link again in Discord to get a fresh link.",
        },
        { status: 400 }
      );
    }

    const { discordUserId, username } = verified;
    const userId = session.user.id;

    // 2. Link Discord account to current user in database
    const existingAccount = await prisma.account.findFirst({
      where: {
        providerId: "discord",
        accountId: discordUserId,
      },
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { userId },
      });
    } else {
      await prisma.account.create({
        data: {
          userId,
          providerId: "discord",
          accountId: discordUserId,
        },
      });
    }

    // 3. Auto-sync Discord Roles and Squad Channels in background
    const globalRoleId = process.env.DISCORD_MEMBER_ROLE_ID;
    if (globalRoleId) {
      await assignDiscordRole(discordUserId, globalRoleId).catch((e) =>
        console.error("[Discord Link] Global role error:", e)
      );
    }

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

      if (team.event?.discordRoleId) {
        await assignDiscordRole(discordUserId, team.event.discordRoleId).catch((e) =>
          console.error("[Discord Link] Campaign role error:", e)
        );
      }

      if (team.discordThreadId) {
        await addMemberToThread(team.discordThreadId, discordUserId).catch((e) =>
          console.error("[Discord Link] Squad thread error:", e)
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully linked Discord account ${username ? `(@${username})` : ""}!`,
      username,
    });
  } catch (error: any) {
    console.error("POST /api/discord/claim-link error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to link Discord account." },
      { status: 500 }
    );
  }
}
