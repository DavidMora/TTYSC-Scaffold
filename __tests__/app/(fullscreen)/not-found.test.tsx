import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import NotFound from "@/app/(fullscreen)/not-found";
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return (
      <a href={href} data-testid="next-link" {...props}>
        {children}
      </a>
    );
  };
});

// Mock UI5 components
jest.mock("@ui5/webcomponents-react", () => ({
  FlexBox: ({
    children,
    gap,
    direction,
    alignItems,
    justifyContent,
    className,
    ...props
  }: React.PropsWithChildren<
    {
      gap?: string;
      direction?: string;
      alignItems?: string;
      justifyContent?: string;
      className?: string;
    } & Record<string, unknown>
  >) => (
    <div
      data-testid="flexbox"
      data-direction={direction}
      data-align-items={alignItems}
      data-justify-content={justifyContent}
      data-gap={gap}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Title: ({
    children,
    level,
    className,
    ...props
  }: React.PropsWithChildren<
    {
      level?: string;
      className?: string;
    } & Record<string, unknown>
  >) => (
    <h1 data-testid="title" data-level={level} className={className} {...props}>
      {children}
    </h1>
  ),
  Button: ({
    children,
    design,
    onClick,
    ...props
  }: React.PropsWithChildren<
    {
      design?: string;
      onClick?: () => void;
    } & Record<string, unknown>
  >) => (
    <button
      data-testid="button"
      data-design={design}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
  Icon: ({
    name,
    className,
    ...props
  }: { name?: string; className?: string } & Record<string, unknown>) => (
    <span
      data-testid="icon"
      data-name={name}
      className={className}
      {...props}
    />
  ),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

describe("NotFound", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe("Rendering", () => {
    it("should render the 404 error page with all required components", () => {
      render(<NotFound />);

      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getAllByTestId("title")).toHaveLength(2);
      expect(screen.getAllByTestId("button")).toHaveLength(2);
      expect(screen.getByTestId("next-link")).toBeInTheDocument();
    });

    it("should render the error icon with correct name and styling", () => {
      render(<NotFound />);

      const icon = screen.getByTestId("icon");
      expect(icon).toHaveAttribute("data-name", "error");
      expect(icon).toHaveClass("text-6xl", "text-red-500");
    });

    it("should render the main title with correct text", () => {
      render(<NotFound />);

      const titles = screen.getAllByTestId("title");
      const mainTitle = titles.find(
        (title) => title.getAttribute("data-level") === "H1"
      );
      expect(mainTitle).toHaveTextContent("404 - Page Not Found");
    });

    it("should render the subtitle with correct text and styling", () => {
      render(<NotFound />);

      const titles = screen.getAllByTestId("title");
      const subtitle = titles.find(
        (title) => title.getAttribute("data-level") === "H3"
      );
      expect(subtitle).toHaveTextContent(
        "The full-screen page you're looking for doesn't exist."
      );
      expect(subtitle).toHaveClass("text-gray-600", "text-center", "max-w-md");
    });

    it("should render the Go Home button with correct design", () => {
      render(<NotFound />);

      const buttons = screen.getAllByTestId("button");
      const goHomeButton = buttons.find(
        (button) => button.textContent === "Go Home"
      );
      expect(goHomeButton).toBeInTheDocument();
      expect(goHomeButton).toHaveAttribute("data-design", "Emphasized");
    });

    it("should render the Go Back button with correct design", () => {
      render(<NotFound />);

      const buttons = screen.getAllByTestId("button");
      const goBackButton = buttons.find(
        (button) => button.textContent === "Go Back"
      );
      expect(goBackButton).toBeInTheDocument();
      expect(goBackButton).toHaveAttribute("data-design", "Transparent");
    });

    it("should render the Next.js Link with correct href", () => {
      render(<NotFound />);

      const link = screen.getByTestId("next-link");
      expect(link).toHaveAttribute("href", "/");
    });
  });

  describe("Layout and Styling", () => {
    it("should apply correct layout styles to main container", () => {
      render(<NotFound />);

      const mainContainer = screen.getAllByTestId("flexbox")[0];
      expect(mainContainer).toHaveAttribute("data-direction", "Column");
      expect(mainContainer).toHaveAttribute("data-align-items", "Center");
      expect(mainContainer).toHaveAttribute("data-justify-content", "Center");
      expect(mainContainer).toHaveAttribute("data-gap", "2rem");
      expect(mainContainer).toHaveClass("h-[calc(100vh-8rem)]");
    });

    it("should apply correct gap to buttons container", () => {
      render(<NotFound />);

      const flexBoxes = screen.getAllByTestId("flexbox");
      const buttonsContainer = flexBoxes[1]; // Second FlexBox is for buttons
      expect(buttonsContainer).toHaveAttribute("data-gap", "1rem");
    });
  });

  describe("Navigation", () => {
    it("should call router.push('/') when Go Back button is clicked", () => {
      render(<NotFound />);

      const buttons = screen.getAllByTestId("button");
      const goBackButton = buttons.find(
        (button) => button.textContent === "Go Back"
      );

      expect(goBackButton).toBeInTheDocument();
      fireEvent.click(goBackButton!);

      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("should handle multiple clicks on Go Back button", () => {
      render(<NotFound />);

      const buttons = screen.getAllByTestId("button");
      const goBackButton = buttons.find(
        (button) => button.textContent === "Go Back"
      );

      expect(goBackButton).toBeInTheDocument();
      fireEvent.click(goBackButton!);
      fireEvent.click(goBackButton!);

      expect(mockPush).toHaveBeenCalledTimes(2);
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("should provide navigation through Next.js Link", () => {
      render(<NotFound />);

      const link = screen.getByTestId("next-link");
      expect(link).toHaveAttribute("href", "/");

      const buttons = screen.getAllByTestId("button");
      const goHomeButton = buttons.find(
        (button) => button.textContent === "Go Home"
      );
      expect(link).toContainElement(goHomeButton!);
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<NotFound />);

      const titles = screen.getAllByTestId("title");
      const h1 = titles.find(
        (title) => title.getAttribute("data-level") === "H1"
      );
      const h3 = titles.find(
        (title) => title.getAttribute("data-level") === "H3"
      );

      expect(h1).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });

    it("should provide clear error messaging", () => {
      render(<NotFound />);

      expect(screen.getByText("404 - Page Not Found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "The full-screen page you're looking for doesn't exist."
        )
      ).toBeInTheDocument();
    });

    it("should provide multiple navigation options", () => {
      render(<NotFound />);

      expect(screen.getByText("Go Home")).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should have proper component hierarchy", () => {
      render(<NotFound />);

      const flexBoxes = screen.getAllByTestId("flexbox");
      expect(flexBoxes).toHaveLength(2); // Main container and buttons container

      const mainContainer = flexBoxes[0];
      const icon = screen.getByTestId("icon");
      const titles = screen.getAllByTestId("title");
      const buttonsContainer = flexBoxes[1];

      expect(mainContainer).toContainElement(icon);
      expect(mainContainer).toContainElement(titles[0]);
      expect(mainContainer).toContainElement(titles[1]);
      expect(mainContainer).toContainElement(buttonsContainer);
    });

    it("should contain both buttons in the buttons container", () => {
      render(<NotFound />);

      const flexBoxes = screen.getAllByTestId("flexbox");
      const buttonsContainer = flexBoxes[1];
      const buttons = screen.getAllByTestId("button");

      buttons.forEach((button) => {
        expect(buttonsContainer).toContainElement(button);
      });
    });
  });
});
