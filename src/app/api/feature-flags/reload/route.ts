import { NextRequest, NextResponse } from "next/server";
import { clearFeatureFlagsCache, getAllFeatureFlags } from "@/lib/utils/feature-flags";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    // Clear the cache
    clearFeatureFlagsCache();
    
    // Get fresh flags
    const flags = getAllFeatureFlags();
    
    return NextResponse.json(
      { 
        message: "Feature flags cache cleared successfully",
        flags 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error clearing feature flags cache:", error);
    
    return NextResponse.json(
      { error: "Failed to clear feature flags cache" },
      { status: 500 }
    );
  }
}
