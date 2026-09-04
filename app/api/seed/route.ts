import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

// GET or POST /api/seed - Trigger database seeding
export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      data: result,
    });
  } catch (error: any) {
    console.error("Database seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed database." },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
