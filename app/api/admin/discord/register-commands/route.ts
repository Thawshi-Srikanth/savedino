import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { registerDiscordCommands } from "@/lib/discord";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/discord/register-commands
 * Registers the /link slash command with Discord REST API.
 * Accessible to Admin users.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userRole = (session?.user as any)?.role;
    if (!session?.user?.id || userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { guildId } = await req.json().catch(() => ({ guildId: undefined }));

    const result = await registerDiscordCommands(guildId);

    return NextResponse.json({
      success: true,
      message: "Successfully registered /link slash command with Discord!",
      data: result,
    });
  } catch (error: any) {
    console.error("POST /api/admin/discord/register-commands error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register Discord commands." },
      { status: 500 }
    );
  }
}
