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

jest.mock("@ui5/webcomponents-react", () => {
  return {
    SideNavigation: ({
      children,
      onSelectionChange,
      collapsed = false,
    }: {
      children: React.ReactNode;
      onSelectionChange: (event: {
        detail: { item: { dataset: { path: string } } };
      }) => void;
      collapsed?: boolean;
    }) => (
      <div data-testid="side-navigation" data-collapsed={collapsed}>
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
    }: {
      "data-path"?: string;
      text: string;
      children?: React.ReactNode;
      selected?: boolean;
      __onSelectionChange?: (event: {
        detail: { item: { dataset: { path: string } } };
      }) => void;
    }) => (
      <div>
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
    }: {
      text: string;
      selected?: boolean;
    }) => (
      <li
        data-testid={`sub-item-${text.toLowerCase().replace(/\s+/g, "-")}`}
        data-selected={selected}
      >
        {text}
      </li>
    ),
  };
});

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
    text: "Settings",
    path: "/settings",
    icon: "settings",
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
    expect(screen.getByTestId("nav-item-settings")).toBeInTheDocument();
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
    expect(sideNav.children).toHaveLength(0);
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
});
