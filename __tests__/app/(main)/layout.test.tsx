import { render, screen } from "@testing-library/react";
import MainLayout from "@/app/(main)/layout";
import "@testing-library/jest-dom";
import React from "react";

// Mock ConditionalAuthLayout
jest.mock("@/components/ConditionalAuthLayout", () => {
  const MockConditionalAuthLayout = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    return <div data-testid="mock-conditional-auth-layout">{children}</div>;
  };
  MockConditionalAuthLayout.displayName = "MockConditionalAuthLayout";
  return MockConditionalAuthLayout;
});

describe("MainLayout", () => {
  it("renders children wrapped in ConditionalAuthLayout", () => {
    render(
      <MainLayout>
        <div>Test Child</div>
      </MainLayout>
    );

    expect(screen.getByText("Test Child")).toBeInTheDocument();
    expect(
      screen.getByTestId("mock-conditional-auth-layout")
    ).toBeInTheDocument();
  });

  it("renders with correct structure", () => {
    const { container } = render(
      <MainLayout>
        <div>Test content</div>
      </MainLayout>
    );

    // Test that the component renders without errors
    expect(container).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });
});
