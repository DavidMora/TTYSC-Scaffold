import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  redirectUri: string;
  nextAuthSecret: string;
  tenantId: string;
  issuerEndpoint: string;
  jwksEndpoint: string;
}

function getOAuthConfig(): OAuthConfig {
  return {
    clientId: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    authorizationEndpoint: process.env.AZURE_AUTHORIZATION_ENDPOINT!,
    tokenEndpoint: process.env.AZURE_TOKEN_ENDPOINT!,
    issuerEndpoint: process.env.AZURE_ISSUER_ENDPOINT!,
    jwksEndpoint: process.env.AZURE_JWKS_ENDPOINT!,
    redirectUri: process.env.AZURE_REDIRECT_URI!,
    nextAuthSecret: process.env.NEXTAUTH_SECRET!,
    tenantId: process.env.AZURE_TENANT_ID!,
  };
}

interface ExtendedJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpires?: number;
  error?: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface ExtendedSession {
  accessToken?: string;
  idToken?: string;
  error?: string;
  expires: string;
  accessTokenExpires?: number;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// Helper function to refresh the access token
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const refreshToken = token.refreshToken as string;

    if (!refreshToken) {
      return { ...token, error: 'RefreshAccessTokenError' };
    }

    const tokenEndpoint = process.env.AZURE_TOKEN_ENDPOINT;
    if (!tokenEndpoint) {
      return { ...token, error: 'RefreshAccessTokenError' };
    }

    const refreshParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: oauthConfig.clientId,
      client_secret: oauthConfig.clientSecret,
      scope: 'openid profile email offline_access User.Read',
    });

    const response = await fetch(tokenEndpoint, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      body: refreshParams,
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.id_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in ?? 0) * 1000,
      error: undefined, // Clear any previous errors
      user: token.user,
    };
  } catch {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
      // Clear tokens when refresh fails to force re-authentication
      accessToken: undefined,
      idToken: undefined,
      refreshToken: undefined,
    };
  }
}

// Get OAuth configuration
const oauthConfig = getOAuthConfig();

// Debug logging
console.log('[Auth Config] Environment variables:');
console.log('[Auth Config] AUTH_PROCESS:', process.env.AUTH_PROCESS);
console.log('[Auth Config] Client ID:', oauthConfig.clientId);
console.log(
  '[Auth Config] Client Secret:',
  oauthConfig.clientSecret ? 'Configured' : 'Not configured'
);
console.log(
  '[Auth Config] Authorization endpoint:',
  oauthConfig.authorizationEndpoint
);
console.log('[Auth Config] Token endpoint:', oauthConfig.tokenEndpoint);
console.log('[Auth Config] Redirect URI:', oauthConfig.redirectUri);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const providerConfig: any = {
  id: 'nvlogin',
  name: 'nvlogin-azure',
  type: 'oauth',
  version: '2.0',
  authorization: {
    url: oauthConfig.authorizationEndpoint,
    params: {
      scope: 'openid profile email offline_access User.Read',
      response_type: 'code',
    },
  },
  token: {
    url: oauthConfig.tokenEndpoint,
    params: {
      grant_type: 'authorization_code',
    },
  },
  userinfo: {
    url: 'https://graph.microsoft.com/v1.0/me',
    params: {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: async ({ tokens }: any) => {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    },
  },
  idToken: true,
  httpOptions: {
    timeout: 30000,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: (profile: any) => {
    try {
      // Azure profile format
      const userId = profile.id || profile.sub || profile.oid;
      const userName = profile.displayName || profile.name || profile.givenName;
      const userEmail =
        profile.mail || profile.userPrincipalName || profile.email;

      return {
        id: userId,
        name: userName,
        email: userEmail,
      };
    } catch (error) {
      console.error('Error in profile mapping:', error);
      throw error;
    }
  },
  clientId: oauthConfig.clientId,
  clientSecret: oauthConfig.clientSecret,
  checks: ['state'],
  issuer: oauthConfig.issuerEndpoint,
  client: {
    token_endpoint_auth_method: 'client_secret_post',
  },
  jwks_endpoint: oauthConfig.jwksEndpoint,
};

export const authOptions: NextAuthOptions = {
  providers: [providerConfig],
  callbacks: {
    async jwt({ token, account, user }) {
      const extendedToken = token as ExtendedJWT;

      // Initial sign in
      if (account && user) {
        console.log(
          `[Auth] Initial sign in for user at ${new Date().toISOString()}`
        );
        console.log('[Auth] User data:', user);
        return {
          accessToken: account.access_token,
          idToken: account.id_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : undefined,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      // Add 5 minutes buffer before expiry to refresh the token
      const shouldRefresh = extendedToken.accessTokenExpires
        ? Date.now() > extendedToken.accessTokenExpires - 5 * 60 * 1000 // Refresh if less than 5 mins left
        : false;

      if (extendedToken.accessTokenExpires && !shouldRefresh) {
        // Ensure all token properties including user data are preserved
        return {
          ...token,
          accessToken: extendedToken.accessToken,
          idToken: extendedToken.idToken,
          refreshToken: extendedToken.refreshToken,
          accessTokenExpires: extendedToken.accessTokenExpires,
          user: extendedToken.user,
        };
      }

      console.log(`[Auth] Token refresh needed at ${new Date().toISOString()}`);
      console.log(
        `[Auth] Current token expires at: ${new Date(extendedToken.accessTokenExpires || 0).toISOString()}`
      );

      // Access token has expired or will expire soon, try to refresh it
      return refreshAccessToken(extendedToken);
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedJWT;
      const extendedSession = session as ExtendedSession;

      console.log('[Auth] Building session, token contains:', {
        hasUser: !!extendedToken.user,
        hasAccessToken: !!extendedToken.accessToken,
        tokenKeys: Object.keys(extendedToken),
      });

      extendedSession.accessToken = extendedToken.accessToken;
      extendedSession.idToken = extendedToken.idToken;
      extendedSession.error = extendedToken.error;
      extendedSession.accessTokenExpires = extendedToken.accessTokenExpires;

      // Use user data from the token if available, fallback to token properties
      if (extendedToken.user) {
        extendedSession.user = extendedToken.user;
      } else {
        // Fallback for backwards compatibility
        extendedSession.user = {
          id: extendedToken.sub || '',
          name: extendedToken.name,
          email: extendedToken.email,
          image: extendedToken.picture,
        };
      }

      // If there was a refresh token error, the session is invalid and user needs to sign in again
      if (extendedToken.error === 'RefreshAccessTokenError') {
        console.error(
          '[Auth] Refresh token error detected, session is invalid'
        );
        // The error will be handled by the client to redirect to sign in
      }

      return extendedSession;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || oauthConfig.nextAuthSecret,
  debug: true,
};
