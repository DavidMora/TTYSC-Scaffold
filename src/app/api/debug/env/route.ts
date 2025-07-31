import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    "FEATURE_FLAG_ENABLE_AUTHENTICATION": process.env.FEATURE_FLAG_ENABLE_AUTHENTICATION,
    "ENABLE_AUTHENTICATION": process.env.ENABLE_AUTHENTICATION,
    "NODE_ENV": process.env.NODE_ENV,
    "allEnvVars": Object.keys(process.env).filter(key => key.includes('FEATURE_FLAG') || key.includes('ENABLE_AUTH')),
  }, { status: 200 });
}
