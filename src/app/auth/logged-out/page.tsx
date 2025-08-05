"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { logoutState } from "@/lib/utils/logout-state";
import { performCompleteLogoutCleanup } from "@/lib/utils/token-cleanup";
import { 
  FlexBox, 
  FlexBoxDirection, 
  FlexBoxJustifyContent, 
  FlexBoxAlignItems,
  Title,
  Text,
  Button,
  Card,
  CardHeader
} from "@ui5/webcomponents-react";

export default function LoggedOutPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [logoutStateVerified, setLogoutStateVerified] = useState(false);

  // Immediately set logout state and ensure we're ready to render
  useEffect(() => {
    const performCleanup = async () => {
      console.log('[LoggedOut] Enforcing logout state on page load');
      
      // Set logout state immediately and persistently
      logoutState.setManuallyLoggedOut();
      localStorage.setItem('user_manually_logged_out', 'true');
      localStorage.setItem('logout_timestamp', Date.now().toString());
      
      // Perform comprehensive cleanup to ensure all tokens are removed
      // but preserve logout state
      console.log('[LoggedOut] Starting token cleanup while preserving logout state');
      await performCompleteLogoutCleanup();
      
      // Verify logout state is still preserved after cleanup
      if (localStorage.getItem('user_manually_logged_out') !== 'true') {
        console.warn('[LoggedOut] Logout state was cleared, restoring...');
        logoutState.setManuallyLoggedOut();
      }
      
      console.log('[LoggedOut] Final logout state:', localStorage.getItem('user_manually_logged_out'));
      setLogoutStateVerified(true);
      setIsReady(true);
    };
    
    performCleanup();
  }, []);

  // Continuously monitor and maintain logout state
  useEffect(() => {
    if (!logoutStateVerified) return;
    
    const monitorLogoutState = () => {
      if (localStorage.getItem('user_manually_logged_out') !== 'true') {
        console.warn('[LoggedOut] Logout state was lost, restoring...');
        logoutState.setManuallyLoggedOut();
      }
    };
    
    // Check every 100ms to ensure logout state persists
    const interval = setInterval(monitorLogoutState, 100);
    
    return () => clearInterval(interval);
  }, [logoutStateVerified]);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      console.log('[LoggedOut] Manual login initiated');
      
      // Clear logout state
      logoutState.clearLogoutState();
      
      // Force account selection to prevent auto-login with previous credentials
      await signIn('nvlogin', { 
        callbackUrl: "/",
        redirect: true,
        prompt: 'select_account'
      });
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoggingIn(false);
    }
  };

  if (!isReady) {
    return (
      <FlexBox
        direction={FlexBoxDirection.Column}
        justifyContent={FlexBoxJustifyContent.Center}
        alignItems={FlexBoxAlignItems.Center}
        style={{ 
          minHeight: '100vh',
          backgroundColor: 'var(--sapBackgroundColor)'
        }}
      >
        <Text>Loading...</Text>
      </FlexBox>
    );
  }

  return (
    <FlexBox
      direction={FlexBoxDirection.Column}
      justifyContent={FlexBoxJustifyContent.Center}
      alignItems={FlexBoxAlignItems.Center}
      style={{ 
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: 'var(--sapBackgroundColor)'
      }}
    >
      <Card style={{ maxWidth: '500px', width: '100%' }}>
        <CardHeader
          titleText="You have been logged out"
          style={{ textAlign: 'center' }}
        />
        <FlexBox
          direction={FlexBoxDirection.Column}
          alignItems={FlexBoxAlignItems.Center}
          style={{ padding: '2rem', gap: '1.5rem' }}
        >
          <Title level="H3" style={{ textAlign: 'center', color: 'var(--sapSuccessColor)' }}>
            ✓ Logout Successful
          </Title>
          
          <Text style={{ textAlign: 'center', color: 'var(--sapNeutralTextColor)' }}>
            You have been successfully logged out of your account. Your session has been terminated 
            and all authentication tokens have been cleared.
          </Text>

          <Text style={{ textAlign: 'center', color: 'var(--sapInformationColor)', fontSize: '0.875rem' }}>
            To maintain security, you will need to re-authenticate when you sign in again.
          </Text>

          <Button
            design="Emphasized"
            onClick={handleLogin}
            disabled={isLoggingIn}
            style={{ width: '100%' }}
          >
            {isLoggingIn ? 'Signing In...' : 'Sign In Again'}
          </Button>

          <Text 
            style={{ 
              fontSize: '0.875rem', 
              color: 'var(--sapNeutralTextColor)', 
              textAlign: 'center',
              marginTop: '1rem'
            }}
          >
            For security reasons, please close your browser if you&apos;re on a shared computer.
          </Text>
        </FlexBox>
      </Card>
    </FlexBox>
  );
}