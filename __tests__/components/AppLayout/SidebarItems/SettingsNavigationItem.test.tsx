import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SettingsNavigationItem from "../../../../src/components/AppLayout/SidebarItems/SettingsNavigationItem";

// Mock UI5 components
jest.mock("@ui5/webcomponents-react", () => ({
  SideNavigationItem: ({
    children,
    unselectable,
    ...props
  }: {
    children?: React.ReactNode;
    unselectable?: boolean;
    [key: string]: unknown;
  }) => (
    <div
      data-testid="side-navigation-item"
      data-unselectable={unselectable}
      {...props}
    >
      {children}
    </div>
  ),
  FlexBox: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="flex-box" {...props}>
      {children}
    </div>
  ),
  FlexBoxDirection: {
    Column: "Column",
  },
  Switch: ({
    checked,
    onChange,
    ...props
  }: {
    checked?: boolean;
    onChange?: () => void;
    [key: string]: unknown;
  }) => (
    <input
      type="checkbox"
      data-testid="switch"
      checked={checked}
      onChange={onChange}
      {...props}
    />
  ),
  Label: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <label data-testid="label" {...props}>
      {children}
    </label>
  ),
  RadioButton: ({
    name,
    text,
    checked,
    onChange,
    ...props
  }: {
    name?: string;
    text?: string;
    checked?: boolean;
    onChange?: () => void;
    [key: string]: unknown;
  }) => (
    <div data-testid="radio-button" {...props}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        data-testid={`radio-${text?.toLowerCase()}`}
      />
      <span>{text}</span>
    </div>
  ),
}));

describe("SettingsNavigationItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with initial state", () => {
    render(<SettingsNavigationItem />);

    // Check if main components are rendered
    expect(screen.getByTestId("side-navigation-item")).toBeInTheDocument();
    expect(screen.getByTestId("switch")).toBeInTheDocument();
    expect(screen.getByText("Share chats for development")).toBeInTheDocument();
    expect(screen.getByText("Hide the index of tables")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("has correct initial state", () => {
    render(<SettingsNavigationItem />);

    // Switch should be checked initially (shareChatsEnabled = true)
    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toBeChecked();

    // "No" radio button should be checked initially (hideTableIndex = "No")
    const noRadio = screen.getByTestId("radio-no");
    const yesRadio = screen.getByTestId("radio-yes");
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();
  });

  it("toggles switch state when clicked", () => {
    render(<SettingsNavigationItem />);

    const switchElement = screen.getByTestId("switch");

    // Initially checked
    expect(switchElement).toBeChecked();

    // Click to uncheck
    fireEvent.click(switchElement);
    expect(switchElement).not.toBeChecked();

    // Click again to check
    fireEvent.click(switchElement);
    expect(switchElement).toBeChecked();
  });

  it("changes radio button selection when Yes is clicked", () => {
    render(<SettingsNavigationItem />);

    const yesRadio = screen.getByTestId("radio-yes");
    const noRadio = screen.getByTestId("radio-no");

    // Initially "No" should be selected
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();

    // Click "Yes" radio button
    fireEvent.click(yesRadio);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();
  });

  it("changes radio button selection when No is clicked", () => {
    render(<SettingsNavigationItem />);

    const yesRadio = screen.getByTestId("radio-yes");
    const noRadio = screen.getByTestId("radio-no");

    // First click "Yes" to change state
    fireEvent.click(yesRadio);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();

    // Then click "No" to change back
    fireEvent.click(noRadio);
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();
  });

  it("calls handleTableIndexChange with correct value when Yes is selected", () => {
    render(<SettingsNavigationItem />);

    const yesRadio = screen.getByTestId("radio-yes");

    // Click "Yes" radio button
    fireEvent.click(yesRadio);

    // Verify the state changed by checking if Yes is now selected
    expect(yesRadio).toBeChecked();
  });

  it("calls handleTableIndexChange with correct value when No is selected", () => {
    render(<SettingsNavigationItem />);

    const yesRadio = screen.getByTestId("radio-yes");
    const noRadio = screen.getByTestId("radio-no");

    // First select Yes
    fireEvent.click(yesRadio);
    expect(yesRadio).toBeChecked();

    // Then select No
    fireEvent.click(noRadio);
    expect(noRadio).toBeChecked();
  });

  it("has correct props on SideNavigationItem", () => {
    render(<SettingsNavigationItem />);

    const sideNavItem = screen.getByTestId("side-navigation-item");
    expect(sideNavItem).toHaveAttribute("text", "Settings");
    expect(sideNavItem).toHaveAttribute("icon", "action-settings");
    expect(sideNavItem).toHaveAttribute("data-unselectable", "true");
  });

  it("renders all labels correctly", () => {
    render(<SettingsNavigationItem />);

    expect(screen.getByText("Share chats for development")).toBeInTheDocument();
    expect(screen.getByText("Hide the index of tables")).toBeInTheDocument();
  });

  it("renders radio buttons with correct names", () => {
    render(<SettingsNavigationItem />);

    const yesRadio = screen.getByTestId("radio-yes");
    const noRadio = screen.getByTestId("radio-no");

    expect(yesRadio).toHaveAttribute("name", "tableIndex");
    expect(noRadio).toHaveAttribute("name", "tableIndex");
  });

  it("maintains correct state after multiple interactions", () => {
    render(<SettingsNavigationItem />);

    const switchElement = screen.getByTestId("switch");
    const yesRadio = screen.getByTestId("radio-yes");
    const noRadio = screen.getByTestId("radio-no");

    // Initial state
    expect(switchElement).toBeChecked();
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();

    // Toggle switch multiple times
    fireEvent.click(switchElement);
    expect(switchElement).not.toBeChecked();
    fireEvent.click(switchElement);
    expect(switchElement).toBeChecked();

    // Change radio selection multiple times
    fireEvent.click(yesRadio);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();

    fireEvent.click(noRadio);
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();

    fireEvent.click(yesRadio);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();

    // Switch should still maintain its state
    expect(switchElement).toBeChecked();
  });
});
