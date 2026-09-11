import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Dev seed is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const result = await seedDatabase();
    return NextResponse.json({
      success: true,
      message: "Database reset and seeded successfully",
      result,
    });
  } catch (error: any) {
    console.error("[Dev Seed Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
