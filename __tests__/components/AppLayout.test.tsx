import { render, screen, fireEvent } from "@testing-library/react";
import AppLayout from "@/components/AppLayout";
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
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

jest.mock("@ui5/webcomponents-react", () => {
  const React = require("react");
  return {
    ShellBar: ({ children, primaryTitle, profile, onProfileClick }: any) => (
      <div>
        <h1>{primaryTitle}</h1>
        <button onClick={onProfileClick} data-testid="profile-avatar">
          {profile}
        </button>
        {children}
      </div>
    ),
    ShellBarItem: ({ onClick, text }: any) => (
      <button onClick={onClick}>{text}</button>
    ),
    Avatar: ({ children }: any) => <div>{children}</div>,
    SideNavigation: ({ children, onSelectionChange, collapsed }: any) => (
      <div data-testid="side-navigation" data-collapsed={collapsed}>
        {React.Children.map(children, (child: React.ReactNode) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              // Pass the handler down to items
              __onSelectionChange: onSelectionChange,
            });
          }
          return child;
        })}
      </div>
    ),
    SideNavigationItem: ({
      "data-path": dataPath,
      text,
      children,
      __onSelectionChange,
    }: any) => (
      <div>
        <button
          onClick={() =>
            __onSelectionChange({
              detail: { item: { dataset: { path: dataPath } } },
            })
          }
        >
          {text}
        </button>
        {children}
      </div>
    ),
    SideNavigationSubItem: ({ text }: any) => <li>{text}</li>,
    FlexBox: ({ children }: any) => <div>{children}</div>,
    FlexBoxDirection: { Column: "column", Row: "row" },
  };
});

describe("AppLayout", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders children", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("navigates to the about page when 'About' item is clicked", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );

    const aboutButton = screen.getByText("About");
    fireEvent.click(aboutButton);

    expect(mockPush).toHaveBeenCalledWith("/about");
  });

  it("toggles side navigation", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );

    const sideNav = screen.getByTestId("side-navigation");
    expect(sideNav).toHaveAttribute("data-collapsed", "false");

    const menuButton = screen.getByText("Menu");
    fireEvent.click(menuButton);

    expect(sideNav).toHaveAttribute("data-collapsed", "true");
  });

  it("does not navigate if path is not defined", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );

    const moreButton = screen.getByText("More");
    fireEvent.click(moreButton);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("handles profile click", () => {
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
});
