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

// Mock UI5 WebComponents React completely
/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock("@ui5/webcomponents-react", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "ui5-theme-provider" }, children),
  
  Page: ({ children, ...props }: any) =>
    React.createElement("div", { "data-testid": "ui5-page", ...props }, children),
  
  FlexBox: ({
    children,
    direction,
    wrap,
    justifyContent,
    alignItems,
    style,
    ...props
  }: any) =>
    React.createElement(
      "div",
      {
        "data-testid": "ui5-flexbox",
        "data-direction": direction,
        "data-wrap": wrap,
        "data-justify": justifyContent,
        "data-align": alignItems,
        style: {
          display: "flex",
          justifyContent: justifyContent,
          alignItems: alignItems,
          ...style,
        },
        ...props,
      },
      children
    ),
  
  // Typography
  Title: ({ children, level, ...props }: any) =>
    React.createElement("h1", { "data-testid": "ui5-title", "data-level": level, ...props }, children),
  
  Text: ({ children, style, ...props }: any) =>
    React.createElement("span", { "data-testid": "ui-5text", style, ...props }, children),
  
  Label: ({ children, ...props }: any) =>
    React.createElement("label", { "data-testid": "ui5-label", ...props }, children),
  
  // Form Components
  Button: ({ children, design, icon, onClick, style, className, ...props }: any) =>
    React.createElement(
      "button",
      {
        "data-testid": "ui5-button",
        "data-design": design,
        "data-icon": icon,
        onClick,
        style,
        className,
        ...props,
      },
      children
    ),
  
  Select: ({
    value,
    onChange,
    disabled,
    children,
    style,
    ...props
  }: any) =>
    React.createElement(
      "select",
      {
        "data-testid": "ui5-select",
        value,
        onChange: (e: any) => {
          const selectedValue = e.target.value;
          onChange?.({ detail: { selectedOption: selectedValue ? { value: selectedValue } : undefined } });
        },
        disabled,
        style,
        ...props,
      },
      children
    ),
  
  Option: ({ value, children, ...props }: any) =>
    React.createElement("option", { value, ...props }, children),
  
  // Navigation
  ShellBar: ({
    children,
    primaryTitle,
    profile,
    onProfileClick,
    ...props
  }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ui5-shellbar", ...props },
      React.createElement("h1", null, primaryTitle),
      profile && React.createElement("button", { onClick: onProfileClick, "data-testid": "profile-avatar" }, profile),
      children
    ),
  
  ShellBarItem: ({ onClick, text, ...props }: any) =>
    React.createElement("button", { onClick, "data-testid": "ui5-shellbar-item", ...props }, text),
  
  SideNavigation: ({ children, ...props }: any) =>
    React.createElement("nav", { "data-testid": "ui5-side-navigation", ...props }, children),
  
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
  
  // Content Components
  Card: ({ children, ...props }: any) =>
    React.createElement("div", { "data-testid": "ui5-card", ...props }, children),
  
  CardHeader: ({ titleText, subtitleText, ...props }: any) =>
    React.createElement("div", { "data-testid": "ui5-card-header", ...props }, [
      React.createElement("h3", { key: "title" }, titleText),
      subtitleText && React.createElement("p", { key: "subtitle" }, subtitleText),
    ]),
  
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
  
  List: ({ children, ...props }: any) =>
    React.createElement("ul", { "data-testid": "ui5-list", ...props }, children),
  
  ListItemCustom: ({ children, onClick, ...props }: any) =>
    React.createElement("li", { onClick, "data-testid": "ui5-list-item", ...props }, children),
  
  // Interactive Components
  Avatar: ({ children, ...props }: any) =>
    React.createElement("div", { "data-testid": "ui5-avatar", ...props }, children),
  
  Icon: ({ name, ...props }: any) =>
    React.createElement("span", { "data-testid": `icon-${name}`, ...props }, name),
  
  Link: ({ href, children, ...props }: any) =>
    React.createElement("a", { "data-testid": "ui5-link", href, ...props }, children),
  
  Popover: ({ children, open, ...props }: any) =>
    open ? React.createElement("div", { "data-testid": "popover", ...props }, children) : null,
  
  // Enums and Constants
  FlexBoxDirection: {
    Column: "Column",
    Row: "Row",
  },
  FlexBoxWrap: {
    Wrap: "Wrap",
    NoWrap: "NoWrap",
  },
  FlexBoxJustifyContent: {
    Start: "Start",
    Center: "Center",
    End: "End",
    SpaceAround: "SpaceAround",
    SpaceBetween: "SpaceBetween",
  },
  FlexBoxAlignItems: {
    Center: "Center",
    Start: "Start",
    End: "End",
    Stretch: "Stretch",
  },
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

// Mock UI5 WebComponents base
jest.mock("@ui5/webcomponents-react-base", () => ({}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
