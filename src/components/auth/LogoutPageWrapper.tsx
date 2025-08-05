"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { logoutState } from "@/lib/utils/logout-state";

interface LogoutPageWrapperProps {
  children: React.ReactNode;
}

/**
 * Special wrapper for the logout page that prevents any auto-login behavior
 * and ensures the user stays on the logout page regardless of session state
 */
export function LogoutPageWrapper({ children }: Readonly<LogoutPageWrapperProps>) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Immediately set logout state to prevent any auto-login
    console.log('[LogoutPageWrapper] Enforcing logout state');
    logoutState.setManuallyLoggedOut();
    
    // Clear any existing session storage that might trigger auto-login
    if (typeof window !== 'undefined') {
      // Remove any session tokens that might exist
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
        if (name.includes('next-auth') || name.includes('session')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
    }
    
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: 'var(--sapBackgroundColor)'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <SessionProvider
      // Use a custom session configuration that prevents auto-refresh
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}