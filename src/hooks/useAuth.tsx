"use client";

import { Suspense, createContext, useContext, useEffect, useState } from "react";
import type { Session } from "next-auth";
import { useSession, signIn, signOut } from "next-auth/react";
import { logoutState } from "@/lib/utils/logout-state";
import { performCompleteLogoutCleanup } from "@/lib/utils/token-cleanup";

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
  logout: () => Promise<void>;
  login: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useAuthInternal(): AuthContextType {
  const { data: session, status } = useSession();
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);
  const [hasTriedAutoLogin, setHasTriedAutoLogin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isManuallyLoggedOut, setIsManuallyLoggedOut] = useState(() => {
    // Initialize from logout state utility
    return logoutState.isManuallyLoggedOut();
  });
  const maxRetries = 3;
  
  // Cast session to ExtendedSession for error handling
  const extendedSession = session as ExtendedSession | null;
  
  const isSessionLoading = status === "loading";
  const isConfigLoading = authConfig === null;
  
  // Enhanced loading logic: 
  // - Always loading if config is not loaded
  // - If auto-login is enabled, wait for session or auto-login attempt
  // - If auto-login is disabled, only wait for config (not session)
  const isLoading = isConfigLoading || (
    authConfig?.autoLogin === true && 
    isSessionLoading && 
    !hasTriedAutoLogin && 
    !authError
  );

  // Reset error when session changes successfully
  useEffect(() => {
    if (extendedSession && !extendedSession.error) {
      setAuthError(null);
      setRetryCount(0);
      setHasTriedAutoLogin(false);
      
      // Clear logout flags when user successfully logs in
      logoutState.clearLogoutState();
      setIsManuallyLoggedOut(false);
      
      // Clean up URL parameters if present
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('logged_out') || url.searchParams.has('prompt')) {
          url.searchParams.delete('logged_out');
          url.searchParams.delete('prompt');
          window.history.replaceState({}, document.title, url.toString());
        }
      }
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
      .then(res => {
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
      .catch(err => {
        if (!controller.signal.aborted) {
          setAuthError(`Configuration error: ${err.message}`);
          // Fallback to default values
          setAuthConfig({
            authProcess: 'azure',
            isAuthDisabled: false,
            autoLogin: false
          });
        }
      });
      
    return () => {
      controller.abort();
    };
  }, []);

  // Auto-login logic with error handling and retry limits
  useEffect(() => {
    // Use centralized logout state management
    const isLoggedOutFromState = logoutState.isManuallyLoggedOut();
    const hasLoggedOutParam = logoutState.hasLogoutUrlParams();
    
    // Update local state if needed
    if (isLoggedOutFromState !== isManuallyLoggedOut) {
      setIsManuallyLoggedOut(isLoggedOutFromState);
    }
    
    // Log the current state for debugging
    console.log('[Auth] Auto-login check:', {
      hasAuthConfig: !!authConfig,
      isAuthDisabled: authConfig?.isAuthDisabled,
      autoLogin: authConfig?.autoLogin,
      hasSession: !!extendedSession,
      isSessionLoading,
      hasTriedAutoLogin,
      hasAuthError: !!authError,
      retryCount,
      maxRetries,
      isManuallyLoggedOut,
      isLoggedOutFromState,
      hasLoggedOutParam,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    });

    // Extra protection: never auto-login if on logout page
    const isOnLogoutPage = typeof window !== 'undefined' && window.location.pathname === '/auth/logged-out';
    if (isOnLogoutPage) {
      console.log('[Auth] Blocking auto-login: on logout page');
      return;
    }
    
    if (
      authConfig &&
      !authConfig.isAuthDisabled && 
      authConfig.autoLogin && 
      !extendedSession && 
      !isSessionLoading && 
      !hasTriedAutoLogin &&
      !authError &&
      retryCount < maxRetries &&
      !isManuallyLoggedOut && // Don't auto-login if user manually logged out (local state)
      !isLoggedOutFromState && // Don't auto-login if logged out (utility state)
      !hasLoggedOutParam // Don't auto-login if coming from logout redirect (URL)
    ) {
      setHasTriedAutoLogin(true);
      setRetryCount(prev => prev + 1);
      
      // Map auth process to provider ID - 'azure' maps to 'nvlogin' provider
      const providerId = authConfig.authProcess === 'azure' ? 'nvlogin' : authConfig.authProcess;
      
      signIn(providerId, { 
        callbackUrl: "/",
        redirect: true
      }).catch(error => {
        setAuthError(`Auto-login failed: ${error.message || 'Unknown error'}`);
      });
    }

    // If we've exceeded max retries, stop trying
    if (retryCount >= maxRetries && !extendedSession && authConfig?.autoLogin) {
      setAuthError('Maximum login attempts exceeded. Please try manually.');
      setHasTriedAutoLogin(true);
    }
  }, [authConfig, extendedSession, isSessionLoading, hasTriedAutoLogin, authError, retryCount, isManuallyLoggedOut]);

  // Debug logging for troubleshooting
  useEffect(() => {
    if (authConfig) {
      console.log('[Auth] Current state:', {
        autoLogin: authConfig.autoLogin,
        isAuthDisabled: authConfig.isAuthDisabled,
        hasSession: !!extendedSession,
        sessionStatus: status,
        isLoading,
        hasTriedAutoLogin,
        authError
      });
    }
  }, [authConfig, extendedSession, status, isLoading, hasTriedAutoLogin, authError]);

  // Custom federated sign-out handler
  const logout = async () => {
    try {
      console.log('[Auth] Starting comprehensive sign-out process');
      
      // Store ID token before clearing session - this is critical!
      const idToken = (extendedSession as { idToken?: string })?.idToken;
      console.log('[Auth] ID Token available for logout:', !!idToken);
      
      if (typeof window !== 'undefined') {
        // Set logout flag FIRST and ensure it's persistent
        console.log('[Auth] Setting persistent logout state');
        logoutState.setManuallyLoggedOut();
        setIsManuallyLoggedOut(true);
        
        // Store logout state in multiple places for redundancy
        localStorage.setItem('user_manually_logged_out', 'true');
        localStorage.setItem('logout_timestamp', Date.now().toString());
        sessionStorage.setItem('logout_in_progress', 'true');
        
        // Perform comprehensive token and session cleanup
        console.log('[Auth] Starting comprehensive cleanup (preserving logout state)');
        await performCompleteLogoutCleanup();
        
        // Verify logout state is still set after cleanup
        if (localStorage.getItem('user_manually_logged_out') !== 'true') {
          console.warn('[Auth] Logout state was cleared during cleanup, restoring...');
          logoutState.setManuallyLoggedOut();
        }
        
        // Clear the NextAuth session explicitly
        console.log('[Auth] Clearing NextAuth session');
        await signOut({ redirect: false });
        
        // Ensure logout state persists after signOut
        logoutState.setManuallyLoggedOut();
        
        // Perform background federated logout (no redirect)
        if (idToken) {
          console.log('[Auth] Performing background federated logout');
          try {
            await fetch(`/api/auth/provider-sign-out?idToken=${encodeURIComponent(idToken)}&background=true`);
          } catch (error) {
            console.warn('[Auth] Background federated logout failed:', error);
          }
        }
        
        // Final verification of logout state before redirect
        console.log('[Auth] Final logout state verification');
        logoutState.setManuallyLoggedOut();
        console.log('[Auth] Logout state before redirect:', localStorage.getItem('user_manually_logged_out'));
        
        // Redirect to logged out page
        console.log('[Auth] Redirecting to logged out page');
        window.location.href = '/auth/logged-out';
      }
    } catch (error) {
      console.error('[Auth] Error during federated sign-out:', error);
      // Fallback: comprehensive cleanup and redirect
      if (typeof window !== 'undefined') {
        // Force comprehensive cleanup on error
        logoutState.setManuallyLoggedOut();
        setIsManuallyLoggedOut(true);
        
        try {
          await performCompleteLogoutCleanup();
        } catch (cleanupError) {
          console.error('[Auth] Fallback cleanup failed:', cleanupError);
        }
        
        window.location.href = '/auth/logged-out';
      }
    }
  };

  // Manual login function to clear logout state and initiate login
  const login = async () => {
    try {
      console.log('[Auth] Manual login initiated');
      
      // Clear logout flags
      logoutState.clearLogoutState();
      
      // Reset auth state
      setAuthError(null);
      setRetryCount(0);
      setHasTriedAutoLogin(false);
      setIsManuallyLoggedOut(false);
      
      // Initiate sign in with prompt to ensure account selection
      const providerId = authConfig?.authProcess === 'azure' ? 'nvlogin' : (authConfig?.authProcess || 'nvlogin');
      
      // Force account selection to prevent auto-login with previous credentials
      await signIn(providerId, { 
        callbackUrl: "/",
        redirect: true,
        // Add prompt parameter to force account selection
        prompt: 'select_account'
      });
    } catch (error) {
      console.error('[Auth] Manual login failed:', error);
      setAuthError(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return { 
    session: extendedSession, 
    authProcess: 'azure', // Simplified to always return azure
    autoLogin: authConfig?.autoLogin || false, 
    isAuthDisabled: authConfig?.isAuthDisabled || false,
    isLoading,
    authError,
    retryCount,
    logout,
    login
  };
}

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
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
      "useAuth must be used within an AuthProvider component. Please wrap your component with SuspenseAuthProvider."
    );
  }
  return context;
}
