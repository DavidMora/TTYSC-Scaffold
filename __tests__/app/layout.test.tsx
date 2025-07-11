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
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(screen.getByText("Test Child")).toBeInTheDocument();
    expect(screen.getByTestId("mock-app-layout")).toBeInTheDocument();
    expect(screen.getByTestId("mock-theme-provider")).toBeInTheDocument();

    const themeProvider = screen.getByTestId("mock-theme-provider");
    const appLayout = screen.getByTestId("mock-app-layout");
    expect(themeProvider).toContainElement(appLayout);
    expect(appLayout).toContainElement(screen.getByText("Test Child"));

    if (consoleError.mock.calls.length > 0) {
      const message = consoleError.mock.calls[0][0] as string;
      expect(message).toContain("cannot be a child of");
    }

    consoleError.mockRestore();
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
