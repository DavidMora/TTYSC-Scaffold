import { LogoutPageWrapper } from "@/components/auth/LogoutPageWrapper";

export default function LoggedOutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LogoutPageWrapper>
      {children}
    </LogoutPageWrapper>
  );
}