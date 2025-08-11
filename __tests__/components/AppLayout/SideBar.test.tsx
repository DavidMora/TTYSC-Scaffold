import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SideBarMenu from "@/components/AppLayout/SideBar";
import { NavBarItem } from "@/lib/types/NavBarItems";
import "@testing-library/jest-dom";
import React from "react";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/",
}));

// Ensure sidebar feature flag is enabled for these tests
// Configurable mock for useFeatureFlags
let mockFeatureFlagState = { flag: true, loading: false, error: null } as {
  flag: boolean;
  loading: boolean;
  error: null | Error;
};
jest.mock("@/hooks/useFeatureFlags", () => ({
  useFeatureFlag: () => mockFeatureFlagState,
}));

// Mock specific behavior for SideNavigation components in tests
jest.mock("@ui5/webcomponents-react", () => {
  const actualModule = jest.requireActual("@ui5/webcomponents-react");
  return {
    ...actualModule,
    SideNavigation: ({
      children,
      onSelectionChange,
      collapsed = false,
      fixedItems,
      ...props
    }: {
      children: React.ReactNode;
      onSelectionChange: (event: {
        detail: { item: { dataset: { path: string } } };
      }) => void;
      collapsed?: boolean;
      fixedItems?: React.ReactNode;
    }) => (
      <div data-testid="side-navigation" data-collapsed={collapsed} {...props}>
        {/* Render fixed items first with the selection handler */}
        {React.Children.map(fixedItems, (child: React.ReactNode) => {
          if (React.isValidElement(child)) {
            // Handle fragments by mapping over their children
            if (child.type === React.Fragment) {
              const fragmentElement = child as React.ReactElement<{
                children: React.ReactNode;
              }>;
              return React.Children.map(
                fragmentElement.props.children,
                (fragmentChild: React.ReactNode) => {
                  if (React.isValidElement(fragmentChild)) {
                    return React.cloneElement(
                      fragmentChild as React.ReactElement<{
                        __onSelectionChange?: typeof onSelectionChange;
                      }>,
                      {
                        __onSelectionChange: onSelectionChange,
                      }
                    );
                  }
                  return fragmentChild;
                }
              );
            }

            // Handle regular elements
            return React.cloneElement(
              child as React.ReactElement<{
                __onSelectionChange?: typeof onSelectionChange;
              }>,
              {
                __onSelectionChange: onSelectionChange,
              }
            );
          }
          return child;
        })}
        {React.Children.map(children, (child: React.ReactNode) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(
              child as React.ReactElement<{
                __onSelectionChange?: typeof onSelectionChange;
              }>,
              {
                __onSelectionChange: onSelectionChange,
              }
            );
          }
          return child;
        })}
      </div>
    ),
    SideNavigationItem: ({
      "data-path": dataPath,
      "data-action": dataAction,
      text,
      children,
      selected,
      __onSelectionChange,
      // absorb unselectable from component props so it is not forwarded to DOM
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      unselectable: _ignoredUnselectable,
      ...props
    }: {
      "data-path"?: string;
      "data-action"?: string;
      text: string;
      children?: React.ReactNode;
      selected?: boolean;
      unselectable?: boolean;
      __onSelectionChange?: (event: {
        detail: { item: { dataset: { path: string; action?: string } } };
      }) => void;
    }) => (
      <div {...props}>
        <button
          data-testid={`nav-item-${text.toLowerCase().replace(/\s+/g, "-")}`}
          data-selected={selected}
          data-action={dataAction}
          onClick={() =>
            __onSelectionChange?.({
              detail: {
                item: {
                  dataset: {
                    path: dataPath || "",
                    action: dataAction,
                  },
                },
              },
            })
          }
        >
          {text}
        </button>
        {children}
      </div>
    ),
    SideNavigationSubItem: ({
      text,
      selected,
      ...props
    }: {
      text: string;
      selected?: boolean;
    }) => (
      <li
        data-testid={`sub-item-${text.toLowerCase().replace(/\s+/g, "-")}`}
        data-selected={selected}
        {...props}
      >
        {text}
      </li>
    ),
  };
});

// Mock the custom navigation item components to make them testable
jest.mock("@/components/AppLayout/SidebarItems/SettingsNavigationItem", () => {
  return function MockSettingsNavigationItem() {
    return <div data-testid="nav-item-settings">Settings</div>;
  };
});

jest.mock(
  "@/components/AppLayout/SidebarItems/DefinitionsNavigationItem",
  () => {
    return function MockDefinitionsNavigationItem() {
      return <div data-testid="nav-item-definitions">Definitions</div>;
    };
  }
);

jest.mock("@/components/AppLayout/SidebarItems/FeedbackNavigationItem", () => {
  return function MockFeedbackNavigationItem({
    onSubmitFeedback,
  }: {
    onSubmitFeedback?: (feedback: string) => void;
  }) {
    return (
      <div data-testid="nav-item-feedback">
        <button
          data-testid="feedback-submit-button"
          onClick={() => onSubmitFeedback?.("Test feedback")}
        >
          Submit Feedback
        </button>
      </div>
    );
  };
});

jest.mock("@/components/AppLayout/SidebarItems/RawDataNavigationItem", () => {
  return function MockRawDataNavigationItem({
    onDataSelection,
  }: {
    onDataSelection?: (data: unknown, filters: Record<number, string>) => void;
  }) {
    return (
      <div data-testid="nav-item-raw-data">
        <button
          data-testid="raw-data-select-button"
          onClick={() =>
            onDataSelection?.({ id: 1, name: "test data" }, { 1: "filter1" })
          }
        >
          Select Raw Data
        </button>
      </div>
    );
  };
});

jest.mock(
  "@/components/AppLayout/SidebarItems/ChatHistoryNavigationItem",
  () => {
    return function MockChatHistoryNavigationItem({
      onChatSelect,
      onChatItemSelect,
    }: {
      onChatSelect?: (chatId: number) => void;
      onChatItemSelect?: (chatId: number) => void;
    }) {
      return (
        <div data-testid="nav-item-chat-history">
          <button
            data-testid="chat-select-button"
            onClick={() => onChatSelect?.(123)}
          >
            Select Chat
          </button>
          <button
            data-testid="chat-item-select-button"
            onClick={() => onChatItemSelect?.(123)}
          >
            Select Chat Item
          </button>
        </div>
      );
    };
  }
);

// Mock useAuth hook - moved here to be properly hoisted
const mockLogout = jest.fn();
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    logout: mockLogout,
    session: null,
    isLoading: false,
    authError: null,
  }),
}));

const mockNavItems: NavBarItem[] = [
  {
    text: "Home",
    path: "/",
    icon: "home",
  },
  {
    text: "About",
    path: "/about",
    icon: "information",
  },
  {
    text: "Profile",
    path: "/profile",
    icon: "user-settings",
  },
  {
    text: "More",
    icon: "overflow",
    subItems: [
      {
        text: "Sub Item 1",
        path: "/more/sub-item-1",
      },
      {
        text: "Sub Item 2",
        path: "/more/sub-item-2",
      },
    ],
  },
];

describe("SideBarMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout.mockReset();
    // reset feature flag mock state per test
    mockFeatureFlagState = { flag: true, loading: false, error: null };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders all navigation items", () => {
    render(<SideBarMenu navItems={mockNavItems} />);

    expect(screen.getByTestId("nav-item-home")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-about")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-profile")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-settings")).toBeInTheDocument(); // This comes from SettingsNavigationItem
    expect(screen.getByTestId("nav-item-more")).toBeInTheDocument();
  });

  it("renders sub items correctly", () => {
    render(<SideBarMenu navItems={mockNavItems} />);

    expect(screen.getByTestId("sub-item-sub-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("sub-item-sub-item-2")).toBeInTheDocument();
  });

  it("navigates to the correct path when a navigation item is clicked", () => {
    render(<SideBarMenu navItems={mockNavItems} />);

    const aboutButton = screen.getByTestId("nav-item-about");
    fireEvent.click(aboutButton);

    expect(mockPush).toHaveBeenCalledWith("/about");
  });

  it("navigates to the home page when Home item is clicked", () => {
    render(<SideBarMenu navItems={mockNavItems} />);

    const homeButton = screen.getByTestId("nav-item-home");
    fireEvent.click(homeButton);

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("does not navigate when clicking an item without a path", () => {
    render(<SideBarMenu navItems={mockNavItems} />);

    const moreButton = screen.getByTestId("nav-item-more");
    fireEvent.click(moreButton);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("sets collapsed state correctly", () => {
    render(<SideBarMenu navItems={mockNavItems} sideNavCollapsed={true} />);

    const sideNav = screen.getByTestId("side-navigation");
    expect(sideNav).toHaveAttribute("data-collapsed", "true");
  });

  it("sets expanded state correctly", () => {
    render(<SideBarMenu navItems={mockNavItems} sideNavCollapsed={false} />);

    const sideNav = screen.getByTestId("side-navigation");
    expect(sideNav).toHaveAttribute("data-collapsed", "false");
  });

  it("defaults to expanded state when collapsed prop is not provided", () => {
    render(<SideBarMenu navItems={mockNavItems} />);

    const sideNav = screen.getByTestId("side-navigation");
    expect(sideNav).toHaveAttribute("data-collapsed", "false");
  });

  it("marks the current page as selected", () => {
    render(<SideBarMenu navItems={mockNavItems} />);

    const homeButton = screen.getByTestId("nav-item-home");
    expect(homeButton).toHaveAttribute("data-selected", "true");

    const aboutButton = screen.getByTestId("nav-item-about");
    expect(aboutButton).toHaveAttribute("data-selected", "false");
  });

  it("handles empty navigation items", () => {
    render(<SideBarMenu navItems={[]} />);

    const sideNav = screen.getByTestId("side-navigation");
    expect(sideNav).toBeInTheDocument();

    // Even with empty navItems, custom components should still be present
    expect(screen.getByTestId("nav-item-settings")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-definitions")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-feedback")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-raw-data")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-chat-history")).toBeInTheDocument();

    // But none of the mockNavItems should be present
    expect(screen.queryByTestId("nav-item-home")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav-item-about")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav-item-profile")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav-item-more")).not.toBeInTheDocument();
  });

  it("handles navigation items without sub items", () => {
    const simpleNavItems = [
      {
        text: "Simple",
        path: "/simple",
        icon: "home",
      },
    ];

    render(<SideBarMenu navItems={simpleNavItems} />);

    expect(screen.getByTestId("nav-item-simple")).toBeInTheDocument();
    expect(screen.queryByTestId("sub-item-sub-item-1")).not.toBeInTheDocument();
  });

  it("calls handleFeedbackSubmit when feedback is submitted", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    render(<SideBarMenu navItems={mockNavItems} />);

    // Click the feedback submit button to trigger the handler
    const feedbackButton = screen.getByTestId("feedback-submit-button");
    fireEvent.click(feedbackButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Feedback submitted:",
      "Test feedback"
    );
    consoleSpy.mockRestore();
  });

  it("calls handleRawDataSelection when raw data is selected", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    render(<SideBarMenu navItems={mockNavItems} />);

    // Click the raw data select button to trigger the handler
    const rawDataButton = screen.getByTestId("raw-data-select-button");
    fireEvent.click(rawDataButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Raw data selected:",
      { id: 1, name: "test data" },
      { 1: "filter1" }
    );
    consoleSpy.mockRestore();
  });

  it("calls handleChatSelect when chat is selected", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    render(<SideBarMenu navItems={mockNavItems} />);

    // Click the chat select button to trigger the handler
    const chatButton = screen.getByTestId("chat-select-button");
    fireEvent.click(chatButton);

    expect(consoleSpy).toHaveBeenCalledWith("Chat selected:", 123);
    consoleSpy.mockRestore();
  });

  it("calls handleChatItemSelect when chat item is selected", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    render(<SideBarMenu navItems={mockNavItems} />);

    // Click the chat item select button to trigger the handler
    const chatItemButton = screen.getByTestId("chat-item-select-button");
    fireEvent.click(chatItemButton);

    expect(consoleSpy).toHaveBeenCalledWith("Chat item selected:", 123);
    consoleSpy.mockRestore();
  });

  it("covers handleLogout success path", async () => {
    mockLogout.mockResolvedValue(undefined);

    render(<SideBarMenu navItems={mockNavItems} />);

    const logoutButton = screen.getByTestId("nav-item-log-out");
    expect(logoutButton).toBeInTheDocument();

    // Check if data-action is set correctly
    expect(logoutButton).toHaveAttribute("data-action", "logout");

    // Click the button which should trigger the mock onClick
    fireEvent.click(logoutButton);

    // Wait for async execution
    await waitFor(
      () => {
        expect(mockLogout).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it("covers handleLogout error path", async () => {
    mockLogout.mockRejectedValue(new Error("Logout failed"));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    render(<SideBarMenu navItems={mockNavItems} />);

    const logoutButton = screen.getByTestId("nav-item-log-out");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it("handles restart session action when restart item is triggered", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    // Mock fetch for successful restart session API call
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
    });

    // Mock localStorage and sessionStorage
    const mockLocalStorageClear = jest.fn();
    const mockSessionStorageClear = jest.fn();

    Object.defineProperty(window, "localStorage", {
      value: { clear: mockLocalStorageClear },
      writable: true,
    });

    Object.defineProperty(window, "sessionStorage", {
      value: { clear: mockSessionStorageClear },
      writable: true,
    });

    render(<SideBarMenu navItems={mockNavItems} />);

    // Find and click the restart session item
    const restartItem = screen.getByTestId("nav-item-restart-session");
    fireEvent.click(restartItem);

    // Wait for the API call
    await waitFor(() => {
      expect(mockLocalStorageClear).toHaveBeenCalled();
      expect(mockSessionStorageClear).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/restart-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Session restarted successfully"
      );
    });

    consoleLogSpy.mockRestore();
  });

  it("handles restart session API error gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Mock fetch for the restart session API call to return error
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve("Server Error"),
    });

    // Mock localStorage and sessionStorage
    const mockLocalStorageClear = jest.fn();
    const mockSessionStorageClear = jest.fn();

    Object.defineProperty(window, "localStorage", {
      value: { clear: mockLocalStorageClear },
      writable: true,
    });

    Object.defineProperty(window, "sessionStorage", {
      value: { clear: mockSessionStorageClear },
      writable: true,
    });

    render(<SideBarMenu navItems={mockNavItems} />);

    // Find and click the restart session item
    const restartItem = screen.getByTestId("nav-item-restart-session");
    fireEvent.click(restartItem);

    // Wait for the API call and error handling
    await waitFor(() => {
      expect(mockLocalStorageClear).toHaveBeenCalled();
      expect(mockSessionStorageClear).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to restart session:",
        "Server Error"
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("handles restart session network error gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Mock fetch to throw an error
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    // Mock localStorage and sessionStorage
    const mockLocalStorageClear = jest.fn();
    const mockSessionStorageClear = jest.fn();

    Object.defineProperty(window, "localStorage", {
      value: { clear: mockLocalStorageClear },
      writable: true,
    });

    Object.defineProperty(window, "sessionStorage", {
      value: { clear: mockSessionStorageClear },
      writable: true,
    });

    render(<SideBarMenu navItems={mockNavItems} />);

    // Find and click the restart session item
    const restartItem = screen.getByTestId("nav-item-restart-session");
    fireEvent.click(restartItem);

    // Wait for the error handling
    await waitFor(() => {
      expect(mockLocalStorageClear).toHaveBeenCalled();
      expect(mockSessionStorageClear).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error during session restart:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("handles normal navigation when path is provided", async () => {
    render(<SideBarMenu navItems={mockNavItems} />);

    // Simulate selecting a navigation item with a path
    const navItem = screen.getByTestId("nav-item-about");
    fireEvent.click(navItem);

    expect(mockPush).toHaveBeenCalledWith("/about");
  });

  it("handles navigation selection when no action or path is provided", async () => {
    render(<SideBarMenu navItems={mockNavItems} />);

    // Simulate a selection event with no path or action
    const sideNavigation = screen.getByTestId("side-navigation");
    const event = {
      detail: {
        item: {
          dataset: {},
        },
      },
    };

    // This should not crash or throw errors
    expect(() => {
      // Manually trigger the handler with empty dataset
      fireEvent(
        sideNavigation,
        new CustomEvent("selectionChange", { detail: event.detail })
      );
    }).not.toThrow();
  });

  it("returns null while feature flag is loading", () => {
    mockFeatureFlagState = { flag: true, loading: true, error: null };
    const { container } = render(<SideBarMenu navItems={mockNavItems} />);
    // Expect nothing rendered
    expect(container.firstChild).toBeNull();
  });

  it("renders FeatureNotAvailable when side nav feature is disabled", () => {
    mockFeatureFlagState = { flag: false, loading: false, error: null };
    render(<SideBarMenu navItems={mockNavItems} />);
    expect(screen.getByText("Navigation Not Available")).toBeInTheDocument();
    expect(
      screen.getByText("The side navigation is currently disabled.")
    ).toBeInTheDocument();
  });
});
