import { NextRequest, NextResponse } from "next/server";
import { getAllFeatureFlags, DEFAULT_FLAGS } from "@/lib/utils/feature-flags";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const flags = getAllFeatureFlags();
    
    return NextResponse.json(flags, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Error serving feature flags:", error);
    
    // Return default flags as fallback
    return NextResponse.json(DEFAULT_FLAGS, { status: 200 });
  }
}
