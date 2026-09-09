import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  // Security guard: Only allow in development environment
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Dev switcher is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { email, callbackURL = "/" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find the user in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${email} not found. Please run seed script.` },
        { status: 404 }
      );
    }

    // Generate verification token for Better-Auth magic-link plugin
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create the verification record that Better-Auth magic-link plugin expects
    await prisma.verification.create({
      data: {
        identifier: token,
        value: JSON.stringify({
          email: user.email,
          name: user.name,
        }),
        expiresAt,
      },
    });

    // Construct the Better-Auth verification URL
    const verifyUrl = `/api/auth/magic-link/verify?token=${token}&callbackURL=${encodeURIComponent(callbackURL)}`;

    return NextResponse.json({
      success: true,
      verifyUrl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("[Dev Switcher Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to switch session" },
      { status: 500 }
    );
  }
}
