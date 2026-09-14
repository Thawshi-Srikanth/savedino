import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyDiscordSignature,
  generateDiscordLinkToken,
} from "@/lib/discord";

export const dynamic = "force-dynamic";

/**
 * POST /api/discord/interactions
 * Discord Serverless Webhook for Slash Commands (e.g., /link)
 * Verifies Ed25519 signature and handles interaction events.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature-ed25519");
    const timestamp = req.headers.get("x-signature-timestamp");

    // 1. Validate cryptographic Ed25519 signature
    const isVerified = verifyDiscordSignature(rawBody, signature, timestamp);
    if (!isVerified) {
      return new NextResponse("Invalid request signature", { status: 401 });
    }

    const interaction = JSON.parse(rawBody);

    // 2. Handle PING (Type 1) from Discord endpoint validation
    if (interaction.type === 1) {
      return NextResponse.json({ type: 1 });
    }

    // 3. Handle Application Slash Commands (Type 2)
    if (interaction.type === 2) {
      const commandName = interaction.data?.name;
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") || "https";
      const dynamicOrigin = host ? `${proto}://${host}` : null;
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        dynamicOrigin ||
        "https://savedino.sedssl.org";

      const discordUser =
        interaction.member?.user || interaction.user;
      const discordUserId = discordUser?.id;
      const discordUsername =
        discordUser?.global_name || discordUser?.username || "Space Explorer";

      if (commandName === "link") {
        if (!discordUserId) {
          return NextResponse.json({
            type: 4,
            data: {
              content: "Could not identify Discord user ID. Please try again.",
              flags: 64, // Ephemeral (private to user)
            },
          });
        }

        // Check if Discord account is already linked
        const existingAccount = await prisma.account.findFirst({
          where: {
            providerId: "discord",
            accountId: discordUserId,
          },
          include: {
            user: true,
          },
        });

        if (existingAccount?.user) {
          // Already linked response
          return NextResponse.json({
            type: 4,
            data: {
              flags: 64, // Ephemeral
              embeds: [
                {
                  title: "✅ SaveDino Account Connected",
                  description: `Your Discord account is already connected to **${existingAccount.user.name}** (\`${existingAccount.user.email}\`).\n\nYour squad voice channels, private threads, and campaign roles are active!`,
                  color: 0x8b5cf6, // Electric Violet
                  footer: {
                    text: "SaveDino Citizen Science • SEDS Sri Lanka",
                  },
                },
              ],
              components: [
                {
                  type: 1, // Action Row
                  components: [
                    {
                      type: 2, // Button
                      style: 5, // Link Style
                      label: "Open SaveDino Dashboard",
                      url: `${appUrl}/campaigns`,
                    },
                  ],
                },
              ],
            },
          });
        }

        // Generate secure 15-minute one-time link token
        const linkToken = generateDiscordLinkToken(
          discordUserId,
          discordUsername
        );
        const linkUrl = `${appUrl}/link-discord?token=${linkToken}`;

        return NextResponse.json({
          type: 4,
          data: {
            flags: 64, // Ephemeral (private to user)
            embeds: [
              {
                title: "🔗 Link Your SaveDino Account",
                description: `Click the button below to link your Discord account to SaveDino.\n\n✨ **What you'll unlock:**\n• Private **Squad Voice & Text Channels**\n• Official **Campaign & Participant Roles**\n• Real-time **Asteroid Discovery Alerts**\n\n*(This secure link is private to you and expires in 15 minutes)*`,
                color: 0x5865F2, // Discord Blurple
                footer: {
                  text: "SaveDino Citizen Science • SEDS Sri Lanka",
                },
              },
            ],
            components: [
              {
                type: 1, // Action Row
                components: [
                  {
                    type: 2, // Button
                    style: 5, // Link Style
                    label: "Link SaveDino Account",
                    url: linkUrl,
                  },
                ],
              },
            ],
          },
        });
      }

      // Default fallback for unknown commands
      return NextResponse.json({
        type: 4,
        data: {
          content: "Unknown command.",
          flags: 64,
        },
      });
    }

    return NextResponse.json({ error: "Unhandled interaction type" }, { status: 400 });
  } catch (error: any) {
    console.error("[Discord Interactions] Error handling webhook:", error);
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
