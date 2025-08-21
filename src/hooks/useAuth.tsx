'use client';

import {
  Suspense,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Session } from 'next-auth';
import { useSession, signIn } from 'next-auth/react';

interface AuthConfig {
  authProcess: string;
  isAuthDisabled: boolean;
  autoLogin: boolean;
}

interface ExtendedSession extends Session {
  error?: string;
  accessToken?: string;
  idToken?: string;
  accessTokenExpires?: number;
}

interface AuthContextType {
  session: ExtendedSession | null;
  authProcess: string;
  autoLogin: boolean;
  isAuthDisabled: boolean;
  isLoading: boolean;
  authError: string | null;
  retryCount: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useAuthInternal(): AuthContextType {
  const { data: session, status } = useSession();
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);
  const [hasTriedAutoLogin, setHasTriedAutoLogin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Cast session to ExtendedSession for error handling
  const extendedSession = session as ExtendedSession | null;

  const isSessionLoading = status === 'loading';
  const isConfigLoading = authConfig === null;

  // Enhanced loading logic:
  // - Always loading if config is not loaded
  // - If auto-login is enabled, wait for session or auto-login attempt
  // - If auto-login is disabled, only wait for config (not session)
  const isLoading =
    isConfigLoading ||
    (authConfig?.autoLogin === true &&
      isSessionLoading &&
      !hasTriedAutoLogin &&
      !authError);

  // Reset error when session changes successfully
  useEffect(() => {
    if (extendedSession && !extendedSession.error) {
      setAuthError(null);
      setRetryCount(0);
      setHasTriedAutoLogin(false);
    }

    // Handle session errors
    if (extendedSession?.error) {
      setAuthError(extendedSession.error);

      // If we have a refresh token error, prevent infinite loops
      if (extendedSession.error === 'RefreshAccessTokenError') {
        setHasTriedAutoLogin(true);
      }
    }
  }, [extendedSession]);

  // Fetch auth configuration from API
  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/auth/config', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((config: AuthConfig) => {
        if (!controller.signal.aborted) {
          setAuthConfig(config);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setAuthError(`Configuration error: ${err.message}`);
          // Fallback to default values
          setAuthConfig({
            authProcess: 'azure',
            isAuthDisabled: false,
            autoLogin: false,
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  // Auto-login logic with error handling and retry limits
  useEffect(() => {
    if (
      authConfig &&
      !authConfig.isAuthDisabled &&
      authConfig.autoLogin &&
      !extendedSession &&
      !isSessionLoading &&
      !hasTriedAutoLogin &&
      !authError &&
      retryCount < maxRetries
    ) {
      setHasTriedAutoLogin(true);
      setRetryCount((prev) => prev + 1);

      // Map auth process to provider ID - 'azure' maps to 'nvlogin' provider
      const providerId =
        authConfig.authProcess === 'azure' ? 'nvlogin' : authConfig.authProcess;

      signIn(providerId, {
        callbackUrl: '/',
        redirect: true,
      }).catch((error) => {
        setAuthError(`Auto-login failed: ${error.message || 'Unknown error'}`);
      });
    }

    // If we've exceeded max retries, stop trying
    if (retryCount >= maxRetries && !extendedSession && authConfig?.autoLogin) {
      setAuthError('Maximum login attempts exceeded. Please try manually.');
      setHasTriedAutoLogin(true);
    }
  }, [
    authConfig,
    extendedSession,
    isSessionLoading,
    hasTriedAutoLogin,
    authError,
    retryCount,
  ]); // Debug logging for troubleshooting
  useEffect(() => {
    if (authConfig) {
      console.log('[Auth] Current state:', {
        autoLogin: authConfig.autoLogin,
        isAuthDisabled: authConfig.isAuthDisabled,
        hasSession: !!extendedSession,
        sessionStatus: status,
        isLoading,
        hasTriedAutoLogin,
        authError,
      });
    }
  }, [
    authConfig,
    extendedSession,
    status,
    isLoading,
    hasTriedAutoLogin,
    authError,
  ]);

  return {
    session: extendedSession,
    authProcess: 'azure', // Simplified to always return azure
    autoLogin: authConfig?.autoLogin || false,
    isAuthDisabled: authConfig?.isAuthDisabled || false,
    isLoading,
    authError,
    retryCount,
  };
}

export function AuthProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const auth = useAuthInternal();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function SuspenseAuthProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider component. Please wrap your component with SuspenseAuthProvider.'
    );
  }
  return context;
}
