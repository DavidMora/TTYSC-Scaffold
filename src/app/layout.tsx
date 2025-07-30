import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProviderWrapper } from "../components/SessionProviderWrapper";
import { SuspenseAuthProvider } from "../hooks/useAuth";
import AuthWrapper from "../components/AuthWrapper";
import ThemeProvider from "../providers/ThemeProvider";
import AppLayout from "../components/AppLayout/AppLayout";
import { SequentialNamingProvider } from "../contexts/SequentialNamingContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAPUI5 Next.js App",
  description: "A Next.js application with SAPUI5 React components",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProviderWrapper>
          <SuspenseAuthProvider>
            <AuthWrapper>
              <ThemeProvider>
                <SequentialNamingProvider>
                  <AppLayout>{children}</AppLayout>
                </SequentialNamingProvider>
              </ThemeProvider>
            </AuthWrapper>
          </SuspenseAuthProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
