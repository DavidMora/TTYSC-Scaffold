import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authProcess = process.env.AUTH_PROCESS || 'azure';
  const isAuthDisabled = authProcess === 'none';
  let autoLogin = process.env.AUTO_LOGIN === 'true';

  // Check for logout state indicators to disable auto-login
  const url = new URL(request.url);
  const hasLoggedOutParam = url.searchParams.get('logged_out') === 'true';
  const referer = request.headers.get('referer');
  const isFromLogout = referer && (referer.includes('logged_out=true') || referer.includes('provider-sign-out'));
  const isOnLogoutPage = referer && referer.includes('/auth/logged-out');

  // Disable auto-login if user was recently logged out or is on logout page
  if (hasLoggedOutParam || isFromLogout || isOnLogoutPage) {
    console.log('[Auth Config] Disabling auto-login due to logout context:', {
      hasLoggedOutParam,
      isFromLogout,
      isOnLogoutPage,
      referer
    });
    autoLogin = false;
  }

  return NextResponse.json({
    authProcess,
    isAuthDisabled,
    autoLogin,
  });
}
