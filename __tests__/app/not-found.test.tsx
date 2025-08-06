import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import NotFound from "@/app/(main)/not-found";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock UI5 components
jest.mock("@ui5/webcomponents-react", () => ({
  Page: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="page" {...props}>
      {children}
    </div>
  ),
  Title: ({
    children,
    level,
    ...props
  }: {
    children: React.ReactNode;
    level: string;
    [key: string]: unknown;
  }) => (
    <h1 data-testid={`title-${level}`} {...props}>
      {children}
    </h1>
  ),
  Text: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <p data-testid="text" {...props}>
      {children}
    </p>
  ),
  Card: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({
    titleText,
    ...props
  }: {
    titleText: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="card-header" {...props}>
      {titleText}
    </div>
  ),
  Button: ({
    children,
    onClick,
    icon,
    ...props
  }: {
    children: React.ReactNode;
    onClick: () => void;
    icon: string;
    [key: string]: unknown;
  }) => (
    <button data-testid="button" onClick={onClick} data-icon={icon} {...props}>
      {children}
    </button>
  ),
  FlexBox: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="flexbox" {...props}>
      {children}
    </div>
  ),
  FlexBoxDirection: {
    Column: "Column",
  },
  FlexBoxJustifyContent: {
    Center: "Center",
  },
  FlexBoxAlignItems: {
    Center: "Center",
  },
  MessageStrip: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="message-strip" {...props}>
      {children}
    </div>
  ),
  Icon: ({ name, ...props }: { name: string; [key: string]: unknown }) => (
    <span data-testid="icon" data-name={name} {...props} />
  ),
}));

describe("NotFound Component", () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
  });

  it("renders the 404 page with correct content", () => {
    render(<NotFound />);

    // Check main elements are present
    expect(screen.getByTestId("page")).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    expect(
      screen.getByText(/The page you are looking for doesn't exist/)
    ).toBeInTheDocument();
  });

  it("renders error icon", () => {
    render(<NotFound />);

    const errorIcon = screen.getByTestId("icon");
    expect(errorIcon).toBeInTheDocument();
    expect(errorIcon).toHaveAttribute("data-name", "error");
  });

  it("renders help information card", () => {
    render(<NotFound />);

    expect(screen.getByText("What can you do?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You can try the following options to get back on track:"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("• Check if the URL is spelled correctly")
    ).toBeInTheDocument();
    expect(
      screen.getByText("• Go back to the previous page")
    ).toBeInTheDocument();
    expect(screen.getByText("• Return to the home page")).toBeInTheDocument();
    expect(
      screen.getByText(
        /• Use the navigation menu to find what you're looking for/
      )
    ).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(<NotFound />);

    const goHomeButton = screen.getByText("Go to Home");
    const goBackButton = screen.getByText("Go Back");

    expect(goHomeButton).toBeInTheDocument();
    expect(goBackButton).toBeInTheDocument();

    // Check button icons
    expect(goHomeButton).toHaveAttribute("data-icon", "home");
    expect(goBackButton).toHaveAttribute("data-icon", "nav-back");
  });

  it("navigates to home when Go to Home button is clicked", () => {
    render(<NotFound />);

    const goHomeButton = screen.getByText("Go to Home");
    fireEvent.click(goHomeButton);

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("navigates back when Go Back button is clicked", () => {
    render(<NotFound />);

    const goBackButton = screen.getByText("Go Back");
    fireEvent.click(goBackButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it("applies correct styling", () => {
    render(<NotFound />);

    const page = screen.getByTestId("page");
    expect(page).toHaveStyle({ padding: "0rem" });
  });
});
