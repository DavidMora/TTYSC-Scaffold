import { NextResponse } from 'next/server';

export async function GET() {
  const authProcess = process.env.AUTH_PROCESS || 'azure';
  const isAuthDisabled = authProcess === 'none';
  const autoLogin = process.env.AUTO_LOGIN === 'true';

  return NextResponse.json({
    authProcess,
    isAuthDisabled,
    autoLogin,
  });
}
