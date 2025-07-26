import React from "react";
import { render, screen } from "@testing-library/react";
import ChatLayout from "@/app/[id]/layout";
import "@testing-library/jest-dom";

// Mock the AutosaveUIProvider
jest.mock("@/contexts/AutosaveUIProvider", () => ({
  AutosaveUIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="autosave-ui-provider">{children}</div>
  ),
}));

describe("ChatLayout", () => {
  it("renders children wrapped in AutosaveUIProvider", () => {
    render(
      <ChatLayout>
        <div data-testid="test-child">Test Child Content</div>
      </ChatLayout>
    );

    expect(screen.getByTestId("autosave-ui-provider")).toBeInTheDocument();
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Child Content")).toBeInTheDocument();
  });

  it("renders multiple children correctly", () => {
    render(
      <ChatLayout>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
        <div data-testid="child-3">Third Child</div>
      </ChatLayout>
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
    expect(screen.getByText("First Child")).toBeInTheDocument();
    expect(screen.getByText("Second Child")).toBeInTheDocument();
    expect(screen.getByText("Third Child")).toBeInTheDocument();
  });

  it("renders with complex nested children", () => {
    render(
      <ChatLayout>
        <div data-testid="parent">
          <span data-testid="nested-child">Nested Content</span>
        </div>
      </ChatLayout>
    );

    expect(screen.getByTestId("parent")).toBeInTheDocument();
    expect(screen.getByTestId("nested-child")).toBeInTheDocument();
    expect(screen.getByText("Nested Content")).toBeInTheDocument();
  });
}); 