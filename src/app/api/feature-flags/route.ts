import { NextRequest, NextResponse } from "next/server";
import { getFeatureFlags, DEFAULT_FLAGS } from "@/lib/utils/feature-flags";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const flags = await getFeatureFlags();
    
    return NextResponse.json(flags, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch {
    // Return default flags as fallback
    return NextResponse.json(DEFAULT_FLAGS, { status: 200 });
  }
}
