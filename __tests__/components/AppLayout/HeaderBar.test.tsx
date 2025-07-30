import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import HeaderBar from "@/components/AppLayout/HeaderBar";
import { SUPPLY_CHAIN_MENU } from "@/lib/constants/UI/HeaderBar";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock UI5 Web Components React
jest.mock("@ui5/webcomponents-react", () => ({
  FlexBox: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <div data-testid="flex-box" style={style}>
      {children}
    </div>
  ),
  FlexBoxJustifyContent: {
    SpaceBetween: "SpaceBetween",
  },
  FlexBoxAlignItems: {
    Center: "Center",
  },
  Title: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <h1 data-testid="title" style={style}>
      {children}
    </h1>
  ),
  Text: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <p data-testid="text" style={style}>
      {children}
    </p>
  ),
  Icon: ({ name, style }: { name: string; style?: React.CSSProperties }) => (
    <span data-testid={`icon-${name}`} style={style}>
      {name}
    </span>
  ),
  Popover: ({
    children,
    open,
    onClose,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onClose?: () => void;
  }) => (
    <div
      data-testid="popover"
      style={{ display: open ? "block" : "none" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  ),
  List: ({ children }: { children: React.ReactNode }) => (
    <ul data-testid="list">{children}</ul>
  ),
  Label: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="label">{children}</span>
  ),
  ListItemCustom: ({
    children,
    onClick,
    onMouseEnter,
    onMouseLeave,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
  }) => (
    <li
      data-testid="list-item"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </li>
  ),
  Button: React.forwardRef<
    HTMLButtonElement,
    { children: React.ReactNode; onClick?: () => void }
  >(function Button({ children, onClick }, ref) {
    return (
      <button ref={ref} data-testid="button" onClick={onClick}>
        {children}
      </button>
    );
  }),
  ButtonDomRef: {},
}));

Object.defineProperty(window, "print", {
  value: jest.fn(),
  writable: true,
});

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

describe("HeaderBar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe("Basic Rendering", () => {
    it("renders title and subtitle correctly", () => {
      render(<HeaderBar title="Test Title" subtitle="Test Subtitle" />);

      expect(screen.getByTestId("title")).toHaveTextContent("Test Title");
      expect(screen.getByTestId("text")).toHaveTextContent("Test Subtitle");
    });

    it("renders actions button when actions are available", () => {
      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["RETRY", "SETTINGS"]}
        />
      );

      expect(screen.getByTestId("button")).toBeInTheDocument();
      expect(screen.getByTestId("icon-overflow")).toBeInTheDocument();
    });
  });

  describe("Popover Functionality", () => {
    it("opens popover when button is clicked", async () => {
      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["RETRY", "SETTINGS"]}
        />
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("popover")).toHaveStyle({ display: "block" });
      });
    });

    it("renders correct menu items in popover", () => {
      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["RETRY", "SETTINGS"]}
        />
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      // Check if menu items are rendered
      expect(screen.getByTestId("icon-refresh")).toBeInTheDocument();
      expect(screen.getByTestId("icon-action-settings")).toBeInTheDocument();
      expect(screen.getByText("Rerun")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });
  });

  describe("Action Execution", () => {
    it("executes default PRINT action", () => {
      const printSpy = jest.spyOn(window, "print");

      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["PRINT"]}
        />
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      const listItems = screen.getAllByTestId("list-item");
      fireEvent.click(listItems[0]);

      expect(printSpy).toHaveBeenCalled();
    });

    it("executes default ABOUT action", () => {
      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["ABOUT"]}
        />
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      const listItems = screen.getAllByTestId("list-item");
      fireEvent.click(listItems[0]);

      expect(mockPush).toHaveBeenCalledWith("/about");
    });

    it("executes default RETRY action", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["RETRY"]}
        />
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      const listItems = screen.getAllByTestId("list-item");
      fireEvent.click(listItems[0]);

      expect(consoleSpy).toHaveBeenCalledWith("Default retry...");
      consoleSpy.mockRestore();
    });

    it("executes default SETTINGS action", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["SETTINGS"]}
        />
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      const listItems = screen.getAllByTestId("list-item");
      fireEvent.click(listItems[0]);

      expect(consoleSpy).toHaveBeenCalledWith("Settings...");
      consoleSpy.mockRestore();
    });

    it("executes default RECORD_SCREENCAST action", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["RECORD_SCREENCAST"]}
        />
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      const listItems = screen.getAllByTestId("list-item");
      fireEvent.click(listItems[0]);

      expect(consoleSpy).toHaveBeenCalledWith("Recording...");
      consoleSpy.mockRestore();
    });

    it("executes override actions", () => {
      const customAction = jest.fn();
      const overrides = {
        RETRY: customAction,
      };

      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["RETRY"]}
          overrides={overrides}
        />
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      const listItems = screen.getAllByTestId("list-item");
      fireEvent.click(listItems[0]);

      expect(customAction).toHaveBeenCalled();
    });
  });

  describe("Popover Behavior", () => {
    it("closes popover when onClose is triggered", async () => {
      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["RETRY"]}
        />
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("popover")).toHaveStyle({ display: "block" });
      });

      const popover = screen.getByTestId("popover");
      fireEvent.click(popover);

      await waitFor(() => {
        expect(screen.getByTestId("popover")).toHaveStyle({ display: "none" });
      });
    });
  });

  describe("Action Filtering", () => {
    it("shows specified actions when actions prop is provided", () => {
      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["RETRY", "PRINT"]}
        />
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      expect(screen.getByText("Rerun")).toBeInTheDocument();
      expect(screen.getByText("Print")).toBeInTheDocument();
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });

    it("shows all available actions when no actions prop is provided", () => {
      render(<HeaderBar title="Test Title" subtitle="Test Subtitle" />);

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      Object.values(SUPPLY_CHAIN_MENU).forEach((item) => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });
  });

  describe("Mouse Events", () => {
    it("applies hover styles on mouse enter", () => {
      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["RETRY"]}
        />
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      const listItems = screen.getAllByTestId("list-item");
      const firstItem = listItems[0];

      Object.defineProperty(firstItem, "style", {
        value: {
          backgroundColor: "",
          borderBottomColor: "",
        },
        writable: true,
        configurable: true,
      });

      fireEvent.mouseEnter(firstItem);

      expect(firstItem.style.backgroundColor).toBe(
        "var(--sapContent_Selected_Hover_Background)"
      );
      expect(firstItem.style.borderBottomColor).toBe(
        "var(--sapHighlightColor)"
      );
    });

    it("removes hover styles on mouse leave", () => {
      render(
        <HeaderBar
          title="Test Title"
          subtitle="Test Subtitle"
          actions={["RETRY"]}
        />
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      const listItems = screen.getAllByTestId("list-item");
      const firstItem = listItems[0];

      // Mock the currentTarget style property
      Object.defineProperty(firstItem, "style", {
        value: {
          backgroundColor: "var(--sapContent_Selected_Hover_Background)",
          borderBottomColor: "var(--sapHighlightColor)",
        },
        writable: true,
        configurable: true,
      });

      fireEvent.mouseLeave(firstItem);

      expect(firstItem.style.backgroundColor).toBe("");
      expect(firstItem.style.borderBottomColor).toBe("transparent");
    });
  });

  describe("Styling", () => {
    it("applies correct styles to title", () => {
      render(<HeaderBar title="Test Title" subtitle="Test Subtitle" />);

      const title = screen.getByTestId("title");
      expect(title).toHaveStyle({
        color: "var(--sapHighlightColor)",
        fontSize: "var(--sapFontHeader3Size)",
        fontWeight: "bolder",
      });
    });

    it("applies correct styles to subtitle", () => {
      render(<HeaderBar title="Test Title" subtitle="Test Subtitle" />);

      const subtitle = screen.getByTestId("text");
      expect(subtitle).toHaveStyle({
        color: "var(--sapTextColor)",
        fontSize: "var(--sapFontSmallSize)",
      });
    });
  });
});
