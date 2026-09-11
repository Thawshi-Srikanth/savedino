import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_ROLES = ["admin", "staff", "user"] as const;

// PATCH /api/admin/users/[userId] - Update user role, profile details, or emailVerified
export async function PATCH(req: Request, context: { params: Promise<{ userId: string }> }) {
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
    const { name, role, institution, country, emailVerified } = body;

    // Validate role if provided
    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    // Prevent non-admin staff from assigning admin role
    if (role === "admin" && session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only full Administrators can grant the Admin role." },
        { status: 403 }
      );
    }

    // Prevent admin from demoting themselves to avoid accidental lockout
    if (session.user.id === userId && role && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "You cannot change your own Administrator role." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: typeof name === "string" ? name.trim() : "" }),
        ...(role !== undefined && { role }),
        ...(institution !== undefined && {
          institution: typeof institution === "string" ? institution.trim() || null : null,
        }),
        ...(country !== undefined && {
          country: typeof country === "string" ? country.trim() || null : null,
        }),
        ...(emailVerified !== undefined && { emailVerified: Boolean(emailVerified) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[userId] - Delete user account
export async function DELETE(req: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Only full Administrators can delete accounts." },
        { status: 403 }
      );
    }

    const { userId } = await context.params;

    // Prevent deleting own account
    if (session.user.id === userId) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own Administrator account." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete user." },
      { status: 500 }
    );
  }
}
