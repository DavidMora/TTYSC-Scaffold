'use client';

import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { SessionProviderWrapper } from './SessionProviderWrapper';
import { SuspenseAuthProvider } from '../hooks/useAuth';
import AuthWrapper from './AuthWrapper';
import AppLayout from './AppLayout/AppLayout';
import { SequentialNamingProvider } from '../contexts/SequentialNamingContext';
import { usePathname } from 'next/navigation';

interface ConditionalAuthLayoutProps {
  readonly children: React.ReactNode;
}

export default function ConditionalAuthLayout({
  children,
}: ConditionalAuthLayoutProps) {
  const { flags, loading, error } = useFeatureFlags();
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith('/auth/');

  // Common provider wrapper with optional auth inclusion
  const wrapWithProviders = (
    content: React.ReactNode,
    includeAuth: boolean = false
  ) => {
    return (
      <SessionProviderWrapper>
        {includeAuth ? (
          <SuspenseAuthProvider>{content}</SuspenseAuthProvider>
        ) : (
          content
        )}
      </SessionProviderWrapper>
    );
  };

  const appContent = (
    <SequentialNamingProvider>
      {isAuthRoute ? children : <AppLayout>{children}</AppLayout>}
    </SequentialNamingProvider>
  );

  // Show loading state while feature flags are being fetched
  if (loading) {
    return wrapWithProviders(
      <SequentialNamingProvider>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Loading...
        </div>
      </SequentialNamingProvider>,
      true
    );
  }

  // Handle error state - fallback to no authentication but keep SessionProvider
  if (error || !flags) {
    console.warn(
      'Feature flags failed to load, defaulting to no authentication:',
      error
    );
    return wrapWithProviders(appContent, true);
  }

  const isAuthEnabled = flags.enableAuthentication;

  if (!isAuthEnabled) {
    // Authentication is disabled, render directly without AuthWrapper
    return wrapWithProviders(appContent, true);
  }

  // Authentication is enabled, use AuthWrapper to control rendering
  return wrapWithProviders(<AuthWrapper>{appContent}</AuthWrapper>, true);
}
