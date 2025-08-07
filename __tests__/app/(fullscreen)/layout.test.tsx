import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import FullscreenLayout from "@/app/(fullscreen)/layout";
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock useFeatureFlags hook
jest.mock("@/hooks/useFeatureFlags", () => ({
  useFeatureFlag: jest.fn(),
}));

// Mock UI5 components
jest.mock("@ui5/webcomponents-react", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: React.PropsWithChildren<
    { onClick?: () => void } & Record<string, unknown>
  >) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
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
    <span data-testid="icon" data-name={name} onClick={onClick} {...props} />
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

// Mock FeatureNotAvailable component
jest.mock("@/components/FeatureNotAvailable", () => ({
  FeatureNotAvailable: ({
    title,
    message,
  }: {
    title?: string;
    message?: string;
  }) => (
    <div data-testid="feature-not-available">
      <div data-testid="feature-not-available-title">{title}</div>
      <div data-testid="feature-not-available-message">{message}</div>
    </div>
  ),
}));

const mockBack = jest.fn();
const mockRouter = {
  back: mockBack,
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

const mockUseFeatureFlag = jest.fn();

describe("FullscreenLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockUseFeatureFlag.mockReturnValue({ flag: true, loading: false });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@/hooks/useFeatureFlags").useFeatureFlag = mockUseFeatureFlag;
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
      expect(screen.getByTestId("button")).toBeInTheDocument();
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

      const backButton = screen.getByTestId("button");
      fireEvent.click(backButton);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple clicks on back icon", () => {
      render(
        <FullscreenLayout>
          <div>Test Content</div>
        </FullscreenLayout>
      );

      const backButton = screen.getByTestId("button");
      fireEvent.click(backButton);
      fireEvent.click(backButton);

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

      const backButton = screen.getByTestId("button");
      const backIcon = screen.getByTestId("icon");
      expect(backButton).toBeInTheDocument();
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

  describe("Feature Flag Disabled", () => {
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue({ flag: false, loading: false });
      import("@/hooks/useFeatureFlags").then((module) => {
        module.useFeatureFlag = mockUseFeatureFlag;
      });
    });

    it("should render FeatureNotAvailable component when feature flag is disabled", () => {
      render(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      expect(screen.getByTestId("feature-not-available")).toBeInTheDocument();
      expect(
        screen.getByTestId("feature-not-available-title")
      ).toHaveTextContent("Full Screen View Not Available");
      expect(
        screen.getByTestId("feature-not-available-message")
      ).toHaveTextContent(
        "The full screen functionality is currently disabled. Please contact your administrator for more information."
      );
    });

    it("should not render navigation or children when feature flag is disabled", () => {
      render(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      expect(screen.queryByTestId("flexbox")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("test-child")).not.toBeInTheDocument();
    });

    it("should maintain ThemeProvider wrapper when feature flag is disabled", () => {
      render(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
      expect(screen.getByTestId("page")).toBeInTheDocument();
      expect(screen.getByTestId("theme-provider")).toContainElement(
        screen.getByTestId("feature-not-available")
      );
    });
  });

  describe("Feature Flag Loading", () => {
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue({ flag: true, loading: true });
      import("@/hooks/useFeatureFlags").then((module) => {
        module.useFeatureFlag = mockUseFeatureFlag;
      });
    });

    it("should show loading placeholder when loading", () => {
      render(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      expect(screen.queryByTestId("flexbox")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("feature-not-available")
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("test-child")).not.toBeInTheDocument();

      // The loading div should be present
      const loadingDiv = screen
        .getByTestId("page")
        .querySelector('div[class="py-4 h-12"]');
      expect(loadingDiv).toBeInTheDocument();
    });

    it("should maintain ThemeProvider wrapper when loading", () => {
      render(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
      expect(screen.getByTestId("page")).toBeInTheDocument();
    });
  });

  describe("FeatureNotAvailable Integration", () => {
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue({ flag: false, loading: false });
      import("@/hooks/useFeatureFlags").then((module) => {
        module.useFeatureFlag = mockUseFeatureFlag;
      });
    });

    it("should render FeatureNotAvailable with correct props", () => {
      render(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      const featureNotAvailable = screen.getByTestId("feature-not-available");
      const title = screen.getByTestId("feature-not-available-title");
      const message = screen.getByTestId("feature-not-available-message");

      expect(featureNotAvailable).toBeInTheDocument();
      expect(title).toHaveTextContent("Full Screen View Not Available");
      expect(message).toHaveTextContent(
        "The full screen functionality is currently disabled. Please contact your administrator for more information."
      );
    });

    it("should maintain ThemeProvider wrapper with FeatureNotAvailable", () => {
      render(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      const themeProvider = screen.getByTestId("theme-provider");
      const page = screen.getByTestId("page");
      const featureNotAvailable = screen.getByTestId("feature-not-available");

      expect(themeProvider).toContainElement(page);
      expect(page).toContainElement(featureNotAvailable);
      expect(themeProvider).toContainElement(featureNotAvailable);
    });

    it("should handle smooth transitions between enabled/disabled states", () => {
      const { rerender } = render(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      // Initially disabled - should show FeatureNotAvailable
      expect(screen.getByTestId("feature-not-available")).toBeInTheDocument();
      expect(screen.queryByTestId("test-child")).not.toBeInTheDocument();

      // Enable the feature flag
      mockUseFeatureFlag.mockReturnValue({ flag: true, loading: false });
      rerender(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      // Should now show normal content
      expect(
        screen.queryByTestId("feature-not-available")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("test-child")).toBeInTheDocument();
      expect(screen.getByTestId("flexbox")).toBeInTheDocument();

      // Disable again
      mockUseFeatureFlag.mockReturnValue({ flag: false, loading: false });
      rerender(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      // Should show FeatureNotAvailable again
      expect(screen.getByTestId("feature-not-available")).toBeInTheDocument();
      expect(screen.queryByTestId("test-child")).not.toBeInTheDocument();
    });

    it("should maintain consistent Page component styling in all states", () => {
      const { rerender } = render(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      // Check styling when disabled
      let page = screen.getByTestId("page");
      expect(page).toHaveAttribute("backgroundDesign", "List");
      expect(page).toHaveClass("w-screen", "h-screen", "overflow-hidden");

      // Enable and check styling
      mockUseFeatureFlag.mockReturnValue({ flag: true, loading: false });
      rerender(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      page = screen.getByTestId("page");
      expect(page).toHaveAttribute("backgroundDesign", "List");
      expect(page).toHaveClass("w-screen", "h-screen", "overflow-hidden");

      // Loading state
      mockUseFeatureFlag.mockReturnValue({ flag: true, loading: true });
      rerender(
        <FullscreenLayout>
          <div data-testid="test-child">Test Child</div>
        </FullscreenLayout>
      );

      page = screen.getByTestId("page");
      expect(page).toHaveAttribute("backgroundDesign", "List");
      expect(page).toHaveClass("w-screen", "h-screen", "overflow-hidden");
    });
  });
});
