import { LogoutPageWrapper } from '@/components/auth/LogoutPageWrapper';

export default function LoggedOutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LogoutPageWrapper>{children}</LogoutPageWrapper>;
}
