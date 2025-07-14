import { render, screen, fireEvent } from "@testing-library/react";
import AppLayout from "@/components/AppLayout/AppLayout";
import "@testing-library/jest-dom";
import React from "react";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/",
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & { alt: string }
  ) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

jest.mock("@ui5/webcomponents-react", () => {
  return {
    ShellBar: ({
      children,
      primaryTitle,
      profile,
      onProfileClick,
    }: {
      children: React.ReactNode;
      primaryTitle: string;
      profile: React.ReactNode;
      onProfileClick: () => void;
    }) => (
      <div>
        <h1>{primaryTitle}</h1>
        <button onClick={onProfileClick} data-testid="profile-avatar">
          {profile}
        </button>
        {children}
      </div>
    ),
    ShellBarItem: ({
      onClick,
      text,
    }: {
      onClick: () => void;
      text: string;
    }) => <button onClick={onClick}>{text}</button>,
    Avatar: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    FlexBox: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    FlexBoxDirection: { Column: "column", Row: "row" },
  };
});

// Mock the SideBarMenu component since it will be tested separately
jest.mock("@/components/AppLayout/SideBar", () => {
  return function MockSideBarMenu({
    sideNavCollapsed,
  }: {
    sideNavCollapsed: boolean;
  }) {
    return (
      <div data-testid="sidebar-menu" data-collapsed={sideNavCollapsed}>
        Mock SideBar
      </div>
    );
  };
});

describe("AppLayout", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders children correctly", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("renders the ShellBar with correct title", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );
    expect(screen.getByText("SAPUI5 Next.js App")).toBeInTheDocument();
  });

  it("renders the sidebar menu component", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );
    expect(screen.getByTestId("sidebar-menu")).toBeInTheDocument();
  });

  it("toggles sidebar collapsed state when menu button is clicked", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );

    const sidebarMenu = screen.getByTestId("sidebar-menu");
    expect(sidebarMenu).toHaveAttribute("data-collapsed", "false");

    const menuButton = screen.getByText("Menu");
    fireEvent.click(menuButton);

    expect(sidebarMenu).toHaveAttribute("data-collapsed", "true");
  });

  it("handles profile click correctly", () => {
    const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );

    const profileButton = screen.getByTestId("profile-avatar");
    fireEvent.click(profileButton);

    expect(consoleLog).toHaveBeenCalledWith("Profile clicked");
    consoleLog.mockRestore();
  });

  it("applies correct layout styles", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );

    // Check that the layout structure is present
    expect(screen.getByText("Test Child")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-menu")).toBeInTheDocument();
    expect(screen.getByText("SAPUI5 Next.js App")).toBeInTheDocument();
  });
});
