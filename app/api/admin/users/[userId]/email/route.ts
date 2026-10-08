import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendCustomUserEmail, EMAIL_SENDERS } from "@/lib/email";
import { renderCustomAdminEmail } from "@/lib/email-templates/custom-admin-email";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST /api/admin/users/[userId]/email - Send a custom editable email to selected user under official SaveDino template
export async function POST(req: Request, context: { params: Promise<{ userId: string }> }) {
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

    const { userId } = await context.params;
    const body = await req.json();
    const {
      subject,
      message,
      badgeText,
      badgeColor,
      actionLabel,
      actionUrl,
      senderType = "default",
      senderName,
      previewOnly = false,
    } = body;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { success: false, error: "Email subject is required." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Email message body is required." },
        { status: 400 }
      );
    }

    // Retrieve target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const emailParams = {
      name: targetUser.name,
      email: targetUser.email,
      subject: subject.trim(),
      message: message.trim(),
      badgeText: badgeText ? String(badgeText).trim() : null,
      badgeColor: badgeColor || "violet",
      actionLabel: actionLabel ? String(actionLabel).trim() : null,
      actionUrl: actionUrl ? String(actionUrl).trim() : null,
      senderName: senderName ? String(senderName).trim() : session.user.name || "SaveDino Team",
    };

    // If client requested preview only, render and return HTML/text without sending
    if (previewOnly) {
      const { html, text } = renderCustomAdminEmail(emailParams);
      return NextResponse.json({
        success: true,
        preview: true,
        html,
        text,
      });
    }

    // Determine sender address based on senderType
    const senderFrom =
      EMAIL_SENDERS[senderType as keyof typeof EMAIL_SENDERS] || EMAIL_SENDERS.default;

    const result = await sendCustomUserEmail({
      ...emailParams,
      from: senderFrom,
    });

    return NextResponse.json({
      success: true,
      message: `Custom email sent successfully to ${targetUser.name || targetUser.email}.`,
      recipient: targetUser.email,
      dispatchResult: result,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/users/[userId]/email Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send custom email." },
      { status: 500 }
    );
  }
}
