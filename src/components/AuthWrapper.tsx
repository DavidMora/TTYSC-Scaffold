"use client";

import { useAuth } from "../hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthWrapperProps {
  readonly children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { session, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const isAuthRoute = pathname.startsWith('/auth/');

  useEffect(() => {
    if (!isLoading) {
      if (!session && !isAuthRoute) {
        // No session and not on auth route - redirect immediately without setting hasCheckedAuth
        const callbackUrl = encodeURIComponent(window.location.href);
        router.replace(`/auth/signin?callbackUrl=${callbackUrl}`);
        return; // Don't set hasCheckedAuth, keep returning loading screen
      } else {
        // We have a session or we're on auth route - safe to render
        setHasCheckedAuth(true);
      }
    }
  }, [isLoading, session, isAuthRoute, router]);

  // Return null (nothing) until we're absolutely sure what to render
  if (isLoading || !hasCheckedAuth) {
    // Return null to prevent ANY rendering of child components
    return null;
  }

  // If we're on auth routes, render children directly WITHOUT AppLayout
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Only render AppLayout if we have a valid session (user is authenticated)
  if (session) {
    return <>{children}</>;
  }

  // Fallback: return null if somehow we get here without session
  return null;
}
