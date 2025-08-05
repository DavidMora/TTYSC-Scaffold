import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  wellKnownUrl?: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  redirectUri: string;
  nextAuthSecret: string;
  ssaEndpoint?: string;
  tenantId?: string;
  issuerEndpoint?: string;
  jwksEndpoint?: string;
  endSessionEndpoint?: string;
}

function getOAuthConfig(): OAuthConfig {
  const authProcess =
    process.env.AUTH_PROCESS || process.env.NEXT_PUBLIC_AUTH_PROCESS;

  if (authProcess === 'starfleet') {
    return {
      clientId: process.env.STARFLEET_CLIENT_ID!,
      wellKnownUrl: process.env.STARFLEET_WELL_KNOWN_URL,
      authorizationEndpoint: process.env.STARFLEET_AUTHORIZATION_ENDPOINT!,
      tokenEndpoint: process.env.STARFLEET_TOKEN_ENDPOINT!,
      redirectUri: process.env.STARFLEET_REDIRECT_URI!,
      nextAuthSecret: process.env.STARFLEET_NEXTAUTH_SECRET!,
      endSessionEndpoint: process.env.STARFLEET_END_SESSION_ENDPOINT,
    };
  } else {
    // Default to Azure
    return {
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      wellKnownUrl: process.env.AZURE_WELL_KNOWN_URL,
      authorizationEndpoint: process.env.AZURE_AUTHORIZATION_ENDPOINT!,
      tokenEndpoint: process.env.AZURE_TOKEN_ENDPOINT!,
      issuerEndpoint: process.env.AZURE_ISSUER_ENDPOINT!,
      jwksEndpoint: process.env.AZURE_JWKS_ENDPOINT!,
      redirectUri: process.env.AZURE_REDIRECT_URI!,
      nextAuthSecret: process.env.AZURE_NEXTAUTH_SECRET!,
      tenantId: process.env.AZURE_TENANT_ID,
      endSessionEndpoint: process.env.AZURE_END_SESSION_ENDPOINT,
    };
  }
}

function getAuthProcess(): 'azure' | 'starfleet' {
  const authProcess =
    process.env.AUTH_PROCESS || process.env.NEXT_PUBLIC_AUTH_PROCESS;
  return authProcess === 'starfleet' ? 'starfleet' : 'azure';
}

async function getLogoutUrl(): Promise<string | null> {
  const oauthConfig = getOAuthConfig();
  const authProcess = getAuthProcess();

  // If explicitly configured, use the configured endpoint
  if (oauthConfig.endSessionEndpoint) {
    return oauthConfig.endSessionEndpoint;
  }

  // Try to fetch from well-known endpoint
  if (oauthConfig.wellKnownUrl) {
    try {
      console.log('[Auth] Fetching logout URL from well-known endpoint:', oauthConfig.wellKnownUrl);
      const response = await fetch(oauthConfig.wellKnownUrl);
      const wellKnown = await response.json();
      
      if (wellKnown.end_session_endpoint) {
        console.log('[Auth] Found end_session_endpoint:', wellKnown.end_session_endpoint);
        return wellKnown.end_session_endpoint;
      }
    } catch (error) {
      console.error('[Auth] Error fetching well-known configuration:', error);
    }
  }

  // Fallback to constructed URLs based on auth process
  if (authProcess === 'azure' && oauthConfig.tenantId) {
    // Use the standard Azure AD logout endpoint
    return `https://login.microsoftonline.com/${oauthConfig.tenantId}/oauth2/v2.0/logout`;
  } else if (authProcess === 'azure') {
    // Fallback for common tenant
    return 'https://login.microsoftonline.com/common/oauth2/v2.0/logout';
  }

  console.warn('[Auth] Could not determine logout URL for provider');
  return null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    console.log('[Auth] Starting federated sign-out process');
    
    const { searchParams } = new URL(req.url);
    const isBackground = searchParams.get('background') === 'true';
    
    // Try to get session first, then fallback to query parameter
    const session = await getServerSession(authOptions) as { 
      idToken?: string; 
      accessToken?: string;
      refreshToken?: string;
    } | null;
    
    const idToken = session?.idToken ?? searchParams.get('idToken');
    const accessToken = session?.accessToken;
    const refreshToken = session?.refreshToken;

    console.log('[Auth] Session available:', !!session);
    console.log('[Auth] ID Token available:', !!idToken);
    console.log('[Auth] Access Token available:', !!accessToken);
    console.log('[Auth] Refresh Token available:', !!refreshToken);
    console.log('[Auth] Background logout:', isBackground);

    // Note: Azure AD doesn't support OAuth 2.0 token revocation endpoint
    // The federated logout will invalidate all tokens at the provider level

    if (!idToken) {
      console.warn('[Auth] No ID token available for federated logout');
      if (isBackground) {
        return NextResponse.json({ success: false, message: 'No ID token available' });
      }
      return NextResponse.redirect(`${baseUrl}/auth/logged-out`, 302);
    }

    const logoutUrl = await getLogoutUrl();
    if (!logoutUrl) {
      console.error('[Auth] Unable to determine logout URL');
      if (isBackground) {
        return NextResponse.json({ success: false, message: 'Unable to determine logout URL' });
      }
      return NextResponse.redirect(`${baseUrl}/auth/logged-out`, 302);
    }

    console.log('[Auth] Using logout URL:', logoutUrl);

    // For background requests, perform the logout without redirect
    if (isBackground) {
      try {
        // Construct the federated logout URL
        const federatedLogoutUrl = new URL(logoutUrl);
        federatedLogoutUrl.searchParams.set('id_token_hint', idToken);
        federatedLogoutUrl.searchParams.set('post_logout_redirect_uri', baseUrl);
        federatedLogoutUrl.searchParams.set('logout_hint', 'user_logout');

        console.log('[Auth] Performing background federated logout');
        
        // Make a fetch request to Azure to invalidate the session
        const logoutResponse = await fetch(federatedLogoutUrl.toString(), {
          method: 'GET',
          redirect: 'manual' // Don't follow redirects
        });

        console.log('[Auth] Background logout response status:', logoutResponse.status);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Background federated logout completed',
          status: logoutResponse.status
        });
      } catch (error) {
        console.error('[Auth] Background federated logout failed:', error);
        return NextResponse.json({ 
          success: false, 
          message: 'Background federated logout failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Regular logout with redirect (legacy behavior)
    const federatedLogoutUrl = new URL(logoutUrl);
    federatedLogoutUrl.searchParams.set('id_token_hint', idToken);
    
    // Redirect to logged out page instead of home
    const logoutRedirectUrl = new URL(`${baseUrl}/auth/logged-out`);
    federatedLogoutUrl.searchParams.set('post_logout_redirect_uri', logoutRedirectUrl.toString());
    federatedLogoutUrl.searchParams.set('logout_hint', 'user_logout');

    console.log('[Auth] Federated logout URL constructed:', federatedLogoutUrl.toString());
    console.log('[Auth] Redirect URL:', logoutRedirectUrl.toString());
    console.log('[Auth] ID token length:', idToken.length);
    
    // Create response with headers to clear cookies
    const response = NextResponse.redirect(federatedLogoutUrl.toString(), 302);
    
    // Clear NextAuth cookies explicitly
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token'
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });
    
    return response;
  } catch (error) {
    console.error('[Auth] Error during federated sign-out:', error);
    
    const { searchParams } = new URL(req.url);
    if (searchParams.get('background') === 'true') {
      return NextResponse.json({ 
        success: false, 
        message: 'Federated logout failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    const response = NextResponse.redirect(`${baseUrl}/auth/logged-out`, 302);
    
    // Clear cookies even on error
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token'
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });
    
    return response;
  }
} 
