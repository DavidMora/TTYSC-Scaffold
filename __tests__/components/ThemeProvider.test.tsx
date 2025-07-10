import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock UI5 webcomponents before importing anything else
jest.mock("@ui5/webcomponents-base/dist/config/Theme.js", () => ({
  setTheme: jest.fn(),
}));

jest.mock("@ui5/webcomponents-react", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="ui5-theme-provider">{children}</div>
  ),
}));

// Mock the theme setup imports to avoid side effects
jest.mock("@ui5/webcomponents/dist/Assets.js", () => ({}));
jest.mock("@ui5/webcomponents-fiori/dist/Assets.js", () => ({}));
jest.mock("@ui5/webcomponents-react/dist/Assets.js", () => ({}));
jest.mock("@ui5/webcomponents-icons/dist/AllIcons.js", () => ({}));
jest.mock("@ui5/webcomponents-icons/dist/Assets.js", () => ({}));

// Import ThemeProvider after mocks are set up
import ThemeProvider from "@/components/ThemeProvider";

describe("ThemeProvider", () => {
  it("renders children correctly", () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );

    expect(screen.getByText("Test Child")).toBeInTheDocument();
    expect(screen.getByTestId("ui5-theme-provider")).toBeInTheDocument();
  });

  it("wraps children in UI5 ThemeProvider", () => {
    const { container } = render(
      <ThemeProvider>
        <span>Another child</span>
      </ThemeProvider>
    );

    // Check that the UI5 ThemeProvider wrapper is present
    expect(
      container.querySelector('[data-testid="ui5-theme-provider"]')
    ).toBeInTheDocument();
    expect(screen.getByText("Another child")).toBeInTheDocument();
  });
});
