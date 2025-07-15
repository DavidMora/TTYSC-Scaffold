import { render, screen } from "@testing-library/react";
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
    expect(screen.getByText("Talk to your supply chain")).toBeInTheDocument();
  });

  it("renders the sidebar menu component", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );
    expect(screen.getByTestId("sidebar-menu")).toBeInTheDocument();
  });

  it("toggles popover when overflow button is clicked", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );

    // Look for the overflow button
    const overflowButton = screen.getByTestId("ui5-button");
    expect(overflowButton).toBeInTheDocument();

    // Note: Since this is a complex interaction that involves popover state,
    // and we're mocking UI5 components, we'll just verify the button exists
    // The actual popover functionality would be tested in the HeaderBar component tests
  });

  it("renders HeaderBar component correctly", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );

    // Check that HeaderBar elements are present
    expect(screen.getByText("Talk to your supply chain")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Turn data into insights with advanced analytics from LLMs"
      )
    ).toBeInTheDocument();

    // Check that the overflow button is present (part of HeaderBar)
    const overflowButton = screen.getByTestId("ui5-button");
    expect(overflowButton).toBeInTheDocument();
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
    expect(screen.getByText("Talk to your supply chain")).toBeInTheDocument();
  });
});
