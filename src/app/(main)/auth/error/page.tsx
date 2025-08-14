'use client';

import { useSearchParams } from 'next/navigation';
import {
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Text,
  Button,
} from '@ui5/webcomponents-react';
import { signIn } from 'next-auth/react';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleRetrySignIn = () => {
    signIn('nvlogin', { callbackUrl: '/' });
  };

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'Configuration':
        return 'There is a configuration error with the authentication provider.';
      case 'AccessDenied':
        return 'Access was denied. You may not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or is invalid.';
      case 'Default':
      default:
        return 'An authentication error occurred. Please try again.';
    }
  };

  return (
    <FlexBox
      direction={FlexBoxDirection.Column}
      justifyContent={FlexBoxJustifyContent.Center}
      alignItems={FlexBoxAlignItems.Center}
      style={{ minHeight: '100vh', padding: '2rem' }}
    >
      <Text
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#ef4444',
          marginBottom: '1rem',
        }}
      >
        Authentication Error
      </Text>
      <Text
        style={{ marginBottom: '2rem', textAlign: 'center', maxWidth: '400px' }}
      >
        {getErrorMessage(error)}
      </Text>
      <Button onClick={handleRetrySignIn}>Try Again</Button>
      {error && (
        <Text
          style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}
        >
          Error code: {error}
        </Text>
      )}
    </FlexBox>
  );
}
