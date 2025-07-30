import { render, screen } from "@testing-library/react";
import RootLayout, { metadata } from "@/app/layout";
import "@testing-library/jest-dom";
import React from "react";

jest.mock("@/components/AppLayout/AppLayout", () => {
  const MockAppLayout = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-app-layout">{children}</div>;
  };
  MockAppLayout.displayName = "MockAppLayout";
  return MockAppLayout;
});

jest.mock("@/providers/ThemeProvider", () => {
  const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-theme-provider">{children}</div>;
  };
  MockThemeProvider.displayName = "MockThemeProvider";
  return MockThemeProvider;
});

jest.mock("@/components/SessionProviderWrapper", () => {
  const MockSessionProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-session-provider">{children}</div>;
  };
  MockSessionProviderWrapper.displayName = "MockSessionProviderWrapper";
  return { SessionProviderWrapper: MockSessionProviderWrapper };
});

jest.mock("@/components/AuthWrapper", () => {
  const MockAuthWrapper = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-auth-wrapper">{children}</div>;
  };
  MockAuthWrapper.displayName = "MockAuthWrapper";
  return MockAuthWrapper;
});

jest.mock("@/hooks/useAuth", () => ({
  SuspenseAuthProvider: ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-auth-provider">{children}</div>;
  },
}));

// Mock Google Fonts
jest.mock("next/font/google", () => ({
  Geist: jest.fn(() => ({
    variable: "--font-geist-sans",
  })),
  Geist_Mono: jest.fn(() => ({
    variable: "--font-geist-mono",
  })),
}));

describe("RootLayout", () => {
  it("renders children", () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    
    expect(screen.getByText("Test Child")).toBeInTheDocument();
    expect(screen.getByTestId("mock-session-provider")).toBeInTheDocument();
    expect(screen.getByTestId("mock-auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("mock-auth-wrapper")).toBeInTheDocument();
  });

  it("renders with correct structure", () => {
    const { container } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    // Test that the component renders without errors
    expect(container).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("exports correct metadata", () => {
    expect(metadata).toEqual({
      title: "SAPUI5 Next.js App",
      description: "A Next.js application with SAPUI5 React components",
    });
  });
});
