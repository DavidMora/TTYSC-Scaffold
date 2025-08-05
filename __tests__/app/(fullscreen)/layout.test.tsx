import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import FullscreenLayout from "@/app/(fullscreen)/layout";
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock UI5 components
jest.mock("@ui5/webcomponents-react", () => ({
  FlexBox: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="flexbox" {...props}>
      {children}
    </div>
  ),
  Icon: ({
    name,
    onClick,
    ...props
  }: { name?: string; onClick?: () => void } & Record<string, unknown>) => (
    <button data-testid="icon" data-name={name} onClick={onClick} {...props} />
  ),
  Label: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <span data-testid="label" {...props}>
      {children}
    </span>
  ),
  Page: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="page" {...props}>
      {children}
    </div>
  ),
}));

// Mock ThemeProvider
jest.mock("@/providers/ThemeProvider", () => {
  return function MockThemeProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="theme-provider">{children}</div>;
  };
});

const mockBack = jest.fn();
const mockRouter = {
  back: mockBack,
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

describe("FullscreenLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe("Rendering", () => {
    it("should render the layout with all required components", () => {
      render(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
      expect(screen.getByTestId("page")).toBeInTheDocument();
      expect(screen.getByTestId("flexbox")).toBeInTheDocument();
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByTestId("label")).toBeInTheDocument();
      expect(screen.getByTestId("test-child")).toBeInTheDocument();
    });

    it("should render the back arrow icon with correct name", () => {
      render(
        <FullscreenLayout>
          <div>Test Content</div>
        </FullscreenLayout>
      );

      const icon = screen.getByTestId("icon");
      expect(icon).toHaveAttribute("data-name", "arrow-left");
    });

    it("should render the return label with correct text", () => {
      render(
        <FullscreenLayout>
          <div>Test Content</div>
        </FullscreenLayout>
      );

      expect(screen.getByTestId("label")).toHaveTextContent(
        "Return to Talk to your Supply Chain"
      );
    });

    it("should render children content correctly", () => {
      const childContent = "This is child content";
      render(
        <FullscreenLayout>
          <div data-testid="child-content">{childContent}</div>
        </FullscreenLayout>
      );

      expect(screen.getByTestId("child-content")).toHaveTextContent(
        childContent
      );
    });

    it("should apply correct CSS classes to page component", () => {
      render(
        <FullscreenLayout>
          <div>Test Content</div>
        </FullscreenLayout>
      );

      const page = screen.getByTestId("page");
      expect(page).toHaveClass("w-screen", "h-screen", "overflow-hidden");
    });
  });

  describe("Navigation", () => {
    it("should call router.back() when back icon is clicked", () => {
      render(
        <FullscreenLayout>
          <div>Test Content</div>
        </FullscreenLayout>
      );

      const backIcon = screen.getByTestId("icon");
      fireEvent.click(backIcon);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple clicks on back icon", () => {
      render(
        <FullscreenLayout>
          <div>Test Content</div>
        </FullscreenLayout>
      );

      const backIcon = screen.getByTestId("icon");
      fireEvent.click(backIcon);
      fireEvent.click(backIcon);

      expect(mockBack).toHaveBeenCalledTimes(2);
    });
  });

  describe("Component Structure", () => {
    it("should have proper component hierarchy", () => {
      render(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      // Check if ThemeProvider wraps everything
      const themeProvider = screen.getByTestId("theme-provider");
      expect(themeProvider).toContainElement(screen.getByTestId("page"));

      // Check if Page contains FlexBox
      const page = screen.getByTestId("page");
      expect(page).toContainElement(screen.getByTestId("flexbox"));

      // Check if children are rendered
      expect(themeProvider).toContainElement(screen.getByTestId("test-child"));
    });

    it("should render with backgroundDesign='List' on Page component", () => {
      render(
        <FullscreenLayout>
          <div>Test Content</div>
        </FullscreenLayout>
      );

      const page = screen.getByTestId("page");
      expect(page).toHaveAttribute("backgroundDesign", "List");
    });

    it("should apply cursor-pointer class to icon", () => {
      render(
        <FullscreenLayout>
          <div>Test Content</div>
        </FullscreenLayout>
      );

      const icon = screen.getByTestId("icon");
      expect(icon).toHaveClass("cursor-pointer");
    });
  });

  describe("Accessibility", () => {
    it("should have clickable back navigation", () => {
      render(
        <FullscreenLayout>
          <div>Test Content</div>
        </FullscreenLayout>
      );

      const backIcon = screen.getByTestId("icon");
      expect(backIcon).toBeInTheDocument();
      expect(backIcon).toHaveAttribute("data-name", "arrow-left");
    });

    it("should provide clear navigation context with label", () => {
      render(
        <FullscreenLayout>
          <div>Test Content</div>
        </FullscreenLayout>
      );

      const label = screen.getByTestId("label");
      expect(label).toHaveTextContent("Return to Talk to your Supply Chain");
    });
  });
});
