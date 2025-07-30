"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Text, FlexBox, FlexBoxDirection, FlexBoxJustifyContent, FlexBoxAlignItems } from "@ui5/webcomponents-react";
import type { Session } from "next-auth";

interface ExtendedSession extends Session {
  error?: string;
}

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      // If already authenticated and no session errors, redirect to callbackUrl
      if (status === "authenticated" && session && !(session as ExtendedSession).error) {
        router.push(callbackUrl);
        return;
      }

      // If session has refresh error, force sign out and re-authenticate
      if (
        status === "authenticated" &&
        (session as ExtendedSession)?.error === "RefreshAccessTokenError"
      ) {
        signIn("nvlogin", { callbackUrl });
        return;
      }

      // If not authenticated, redirect to SSO provider
      if (status === "unauthenticated") {
        signIn("nvlogin", { callbackUrl });
      }
    };

    checkSessionAndRedirect();
  }, [callbackUrl, session, status, router, error]);

  return (
    <FlexBox
      direction={FlexBoxDirection.Column}
      justifyContent={FlexBoxJustifyContent.Center}
      alignItems={FlexBoxAlignItems.Center}
      style={{ minHeight: "100vh" }}
    >
      <Text>Authenticating...</Text>
      {session?.user?.name && (
        <Text style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
          Signing in as {session.user.name}
        </Text>
      )}
      {error === "SessionExpired" && (
        <Text style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#ef4444" }}>
          Your session has expired. Attempting to re-authenticate... If this
          persists, please open a new tab and sign in again.
        </Text>
      )}
    </FlexBox>
  );
}
