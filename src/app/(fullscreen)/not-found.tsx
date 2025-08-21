'use client';

import { FlexBox, Title, Button, Icon } from '@ui5/webcomponents-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  const goHome = () => {
    router.push('/');
  };

  return (
    <FlexBox
      direction="Column"
      alignItems="Center"
      justifyContent="Center"
      gap="2rem"
      className="h-[calc(100vh-8rem)]"
    >
      <Icon name="error" className="text-6xl text-red-500" />
      <Title level="H1">404 - Page Not Found</Title>
      <Title level="H3" className="text-gray-600 text-center max-w-md">
        The full-screen page you&apos;re looking for doesn&apos;t exist.
      </Title>
      <FlexBox gap="1rem">
        <Link href="/">
          <Button design="Emphasized">Go Home</Button>
        </Link>
        <Button design="Transparent" onClick={goHome}>
          Go Back
        </Button>
      </FlexBox>
    </FlexBox>
  );
}
