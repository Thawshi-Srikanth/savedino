import { NextRequest, NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const result = await subscribeToNewsletter(trimmedEmail);

    return NextResponse.json({
      success: result.success,
      message: "You're on the list! We'll notify you when the full platform launches.",
      data: (result as any).data,
    });
  } catch (error: any) {
    console.error("[Subscribe Route Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to subscribe." },
      { status: 500 }
    );
  }
}
