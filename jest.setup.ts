// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import React from "react";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock NextAuth
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock UI5 WebComponents React completely
jest.mock("@ui5/webcomponents-react", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      "div",
      { "data-testid": "ui5-theme-provider" },
      children
    ),
  Page: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ui5-page", ...props },
      children
    ),
  Title: ({ children, level, ...props }: any) =>
    React.createElement(
      "h1",
      { "data-testid": "ui5-title", "data-level": level, ...props },
      children
    ),
  Text: ({ children, ...props }: any) =>
    React.createElement("p", { "data-testid": "ui5-text", ...props }, children),
  Card: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ui5-card", ...props },
      children
    ),
  CardHeader: ({ titleText, subtitleText, ...props }: any) =>
    React.createElement("div", { "data-testid": "ui5-card-header", ...props }, [
      React.createElement("h3", { key: "title" }, titleText),
      subtitleText &&
        React.createElement("p", { key: "subtitle" }, subtitleText),
    ]),
  Button: ({ children, design, icon, onClick, ...props }: any) =>
    React.createElement(
      "button",
      {
        "data-testid": "ui5-button",
        "data-design": design,
        "data-icon": icon,
        onClick,
        ...props,
      },
      children
    ),
  FlexBox: ({
    children,
    direction,
    justifyContent,
    alignItems,
    ...props
  }: any) =>
    React.createElement(
      "div",
      {
        "data-testid": "ui5-flexbox",
        "data-direction": direction,
        "data-justify": justifyContent,
        "data-align": alignItems,
        ...props,
      },
      children
    ),
  FlexBoxDirection: {
    Column: "Column",
    Row: "Row",
  },
  FlexBoxJustifyContent: {
    Center: "Center",
    SpaceAround: "SpaceAround",
  },
  FlexBoxAlignItems: {
    Center: "Center",
  },
  MessageStrip: ({ children, design, ...props }: any) =>
    React.createElement(
      "div",
      {
        "data-testid": "ui5-messagestrip",
        "data-design": design,
        ...props,
      },
      children
    ),
  Icon: ({ name, slot, ...props }: any) =>
    React.createElement("span", {
      "data-testid": "ui5-icon",
      "data-name": name,
      "data-slot": slot,
      ...props,
    }),
  ShellBar: ({
    primaryTitle,
    secondaryTitle,
    profile,
    children,
    onProfileClick,
    ...props
  }: React.ComponentProps<"div"> & {
    primaryTitle?: string;
    secondaryTitle?: string;
    profile?: React.ReactNode;
    children?: React.ReactNode;
    onProfileClick?: () => void;
  }) => {
    const childArray = React.Children.toArray([profile, children]).filter(
      Boolean
    );

    return React.createElement(
      "div",
      {
        "data-testid": "ui5-shellbar",
        "data-primary-title": primaryTitle,
        "data-secondary-title": secondaryTitle,
        ...props,
      },
      ...childArray
    );
  },
  ShellBarItem: ({
    icon,
    children,
    onClick,
    text,
    ...props
  }: React.ComponentProps<"div"> & {
    icon?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    text?: string;
  }) => {
    return React.createElement(
      "div",
      {
        "data-testid": "ui5-shellbar-item",
        "data-icon": icon,
        "data-text": text,
        ...props,
      },
      children
    );
  },
  Avatar: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      {
        "data-testid": "ui5-avatar",
        ...props,
      },
      children
    ),
  SideNavigation: ({ children, ...props }: any) =>
    React.createElement(
      "nav",
      {
        "data-testid": "ui5-side-navigation",
        ...props,
      },
      children
    ),
  SideNavigationItem: ({ text, icon, selected, children, ...props }: any) =>
    React.createElement(
      "div",
      {
        "data-testid": "ui5-side-navigation-item",
        "data-text": text,
        "data-icon": icon,
        "data-selected": selected,
        ...props,
      },
      children
    ),
  SideNavigationSubItem: ({ text, ...props }: any) =>
    React.createElement("div", {
      "data-testid": "ui5-side-navigation-sub-item",
      "data-text": text,
      ...props,
    }),
  Panel: ({ headerText, children, collapsed, ...props }: any) =>
    React.createElement(
      "div",
      {
        "data-testid": "ui5-panel",
        "data-header-text": headerText,
        "data-collapsed": collapsed ? "true" : "false",
        ...props,
      },
      children
    ),
  Link: ({ href, children, ...props }: any) =>
    React.createElement(
      "a",
      {
        "data-testid": "ui5-link",
        href,
        ...props,
      },
      children
    ),
}));

// Mock UI5 WebComponents base
jest.mock("@ui5/webcomponents-react-base", () => ({}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch for Node.js environment
global.fetch = jest.fn((url) => {
  // Mock auth config API
  if (url.toString().includes('/api/auth/config')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        authProcess: 'test',
        isAuthDisabled: false,
        autoLogin: false,
      }),
    });
  }
  
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
}) as jest.Mock;
