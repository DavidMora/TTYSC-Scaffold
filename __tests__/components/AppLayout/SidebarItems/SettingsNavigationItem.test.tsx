import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SettingsNavigationItem from "../../../../src/components/AppLayout/SidebarItems/SettingsNavigationItem";

describe("SettingsNavigationItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with initial state", () => {
    render(<SettingsNavigationItem />);

    // Check if main components are rendered
    expect(screen.getByTestId("ui5-side-navigation-item")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByText("Share chats for development")).toBeInTheDocument();
    expect(screen.getByText("Hide the index of tables")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("has correct initial state", () => {
    render(<SettingsNavigationItem />);

    // Switch should be checked initially (shareChatsEnabled = true)
    const switchElement = screen.getByRole("checkbox");
    expect(switchElement).toBeChecked();

    // "No" radio button should be checked initially (hideTableIndex = "No")
    const radioButtons = screen.getAllByTestId("ui5-radio-button");
    const noRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("No")
    );
    const yesRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("Yes")
    );

    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();
  });

  it("toggles switch state when clicked", () => {
    render(<SettingsNavigationItem />);

    const switchElement = screen.getByRole("checkbox");

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

    const radioButtons = screen.getAllByTestId("ui5-radio-button");
    const yesRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("Yes")
    );
    const noRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("No")
    );

    // Initially "No" should be selected
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();

    // Click "Yes" radio button
    fireEvent.click(yesRadio!);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();
  });

  it("changes radio button selection when No is clicked", () => {
    render(<SettingsNavigationItem />);

    const radioButtons = screen.getAllByTestId("ui5-radio-button");
    const yesRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("Yes")
    );
    const noRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("No")
    );

    // First click "Yes" to change state
    fireEvent.click(yesRadio!);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();

    // Then click "No" to change back
    fireEvent.click(noRadio!);
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();
  });

  it("calls handleTableIndexChange with correct value when Yes is selected", () => {
    render(<SettingsNavigationItem />);

    const radioButtons = screen.getAllByTestId("ui5-radio-button");
    const yesRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("Yes")
    );

    // Click "Yes" radio button
    fireEvent.click(yesRadio!);

    // Verify the state changed by checking if Yes is now selected
    expect(yesRadio).toBeChecked();
  });

  it("calls handleTableIndexChange with correct value when No is selected", () => {
    render(<SettingsNavigationItem />);

    const radioButtons = screen.getAllByTestId("ui5-radio-button");
    const yesRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("Yes")
    );
    const noRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("No")
    );

    // First select Yes
    fireEvent.click(yesRadio!);
    expect(yesRadio).toBeChecked();

    // Then select No
    fireEvent.click(noRadio!);
    expect(noRadio).toBeChecked();
  });

  it("has correct props on SideNavigationItem", () => {
    render(<SettingsNavigationItem />);

    const sideNavItem = screen.getByTestId("ui5-side-navigation-item");
    expect(sideNavItem).toHaveAttribute("data-text", "Settings");
    expect(sideNavItem).toHaveAttribute("data-icon", "action-settings");
  });

  it("renders all labels correctly", () => {
    render(<SettingsNavigationItem />);

    expect(screen.getByText("Share chats for development")).toBeInTheDocument();
    expect(screen.getByText("Hide the index of tables")).toBeInTheDocument();
  });

  it("renders radio buttons with correct names", () => {
    render(<SettingsNavigationItem />);

    const radioButtons = screen.getAllByTestId("ui5-radio-button");
    const yesRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("Yes")
    );
    const noRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("No")
    );

    expect(yesRadio).toHaveAttribute("name", "tableIndex");
    expect(noRadio).toHaveAttribute("name", "tableIndex");
  });

  it("maintains correct state after multiple interactions", () => {
    render(<SettingsNavigationItem />);

    const switchElement = screen.getByRole("checkbox");
    const radioButtons = screen.getAllByTestId("ui5-radio-button");
    const yesRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("Yes")
    );
    const noRadio = radioButtons.find((radio) =>
      radio.parentElement?.textContent?.includes("No")
    );

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
    fireEvent.click(yesRadio!);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();

    fireEvent.click(noRadio!);
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();

    fireEvent.click(yesRadio!);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();

    // Switch should still maintain its state
    expect(switchElement).toBeChecked();
  });
});
