import { render, screen, fireEvent } from "@testing-library/react";
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

// Mock specific behavior for SideNavigation components in tests
jest.mock("@ui5/webcomponents-react", () => {
  const actualModule = jest.requireActual("@ui5/webcomponents-react");
  return {
    ...actualModule,
    SideNavigation: ({
      children,
      onSelectionChange,
      collapsed = false,
      ...props
    }: {
      children: React.ReactNode;
      onSelectionChange: (event: {
        detail: { item: { dataset: { path: string } } };
      }) => void;
      collapsed?: boolean;
    }) => (
      <div data-testid="side-navigation" data-collapsed={collapsed} {...props}>
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
      text,
      children,
      selected,
      __onSelectionChange,
      ...props
    }: {
      "data-path"?: string;
      text: string;
      children?: React.ReactNode;
      selected?: boolean;
      __onSelectionChange?: (event: {
        detail: { item: { dataset: { path: string } } };
      }) => void;
    }) => (
      <div {...props}>
        <button
          data-testid={`nav-item-${text.toLowerCase().replace(/\s+/g, "-")}`}
          data-selected={selected}
          onClick={() =>
            __onSelectionChange?.({
              detail: { item: { dataset: { path: dataPath || "" } } },
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
      onChatItemSelect?: (chatId: number, itemId: number) => void;
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
            onClick={() => onChatItemSelect?.(123, 456)}
          >
            Select Chat Item
          </button>
        </div>
      );
    };
  }
);

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

    expect(consoleSpy).toHaveBeenCalledWith("Chat item selected:", 123, 456);
    consoleSpy.mockRestore();
  });
});
