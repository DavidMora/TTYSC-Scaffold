"use client";

import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { SessionProviderWrapper } from "./SessionProviderWrapper";
import { SuspenseAuthProvider } from "../hooks/useAuth";
import AuthWrapper from "./AuthWrapper";
import ThemeProvider from "../providers/ThemeProvider";
import AppLayout from "./AppLayout/AppLayout";
import { SequentialNamingProvider } from "../contexts/SequentialNamingContext";
import { usePathname } from "next/navigation";

interface ConditionalAuthLayoutProps {
  readonly children: React.ReactNode;
}

export default function ConditionalAuthLayout({ children }: ConditionalAuthLayoutProps) {
  const { flags, loading, error } = useFeatureFlags();
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith('/auth/');

  // Show loading state while feature flags are being fetched
  if (loading) {
    return (
      <SessionProviderWrapper>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontFamily: 'system-ui, sans-serif'
        }}>
          Loading...
        </div>
      </SessionProviderWrapper>
    );
  }

  // Handle error state - fallback to no authentication but keep SessionProvider
  if (error || !flags) {
    console.warn('Feature flags failed to load, defaulting to no authentication:', error);
    return (
      <SessionProviderWrapper>
        <ThemeProvider>
          <SequentialNamingProvider>
            {isAuthRoute ? children : <AppLayout>{children}</AppLayout>}
          </SequentialNamingProvider>
        </ThemeProvider>
      </SessionProviderWrapper>
    );
  }

  const isAuthEnabled = flags.enableAuthentication;

  if (!isAuthEnabled) {
    // Authentication is disabled, render directly without AuthWrapper
    return (
      <SessionProviderWrapper>
        <SuspenseAuthProvider>
          <ThemeProvider>
            <SequentialNamingProvider>
              {isAuthRoute ? children : <AppLayout>{children}</AppLayout>}
            </SequentialNamingProvider>
          </ThemeProvider>
        </SuspenseAuthProvider>
      </SessionProviderWrapper>
    );
  }

  // Authentication is enabled, use AuthWrapper to control rendering
  return (
    <SessionProviderWrapper>
      <SuspenseAuthProvider>
        <ThemeProvider>
          <AuthWrapper>
            <SequentialNamingProvider>
              {isAuthRoute ? children : <AppLayout>{children}</AppLayout>}
            </SequentialNamingProvider>
          </AuthWrapper>
        </ThemeProvider>
      </SuspenseAuthProvider>
    </SessionProviderWrapper>
  );
}
