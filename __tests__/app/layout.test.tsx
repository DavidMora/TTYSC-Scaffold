import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";
import "@testing-library/jest-dom";
import React from "react";

jest.mock("@/components/AppLayout", () => {
  const MockAppLayout = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-app-layout">{children}</div>;
  };
  MockAppLayout.displayName = "MockAppLayout";
  return MockAppLayout;
});

jest.mock("@/components/ThemeProvider", () => {
  const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-theme-provider">{children}</div>;
  };
  MockThemeProvider.displayName = "MockThemeProvider";
  return MockThemeProvider;
});

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
});
