import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/hooks/settings", () => ({
  useSettings: () => ({
    data: { shareChats: true, hideIndexTable: false },
    isLoading: false,
    error: null,
    mutate: jest.fn(),
  }),
}));

const mockUpdateSettings = jest.fn((settings: object = {}) =>
  Promise.resolve({ ok: true, statusText: "OK", ...settings })
);

jest.mock("@/lib/services/settings.service", () => ({
  updateSettings: (settings: object) => mockUpdateSettings(settings),
}));

import SettingsNavigationItem from "@/components/AppLayout/SidebarItems/SettingsNavigationItem";

describe("SettingsNavigationItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders main elements correctly", () => {
    render(<SettingsNavigationItem />);
    expect(screen.getByText("Share chats for development")).toBeInTheDocument();
    expect(screen.getByText("Hide the index of tables")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls the switch handler on click", () => {
    render(<SettingsNavigationItem />);
    const switchElement = screen.getByRole("checkbox");
    fireEvent.click(switchElement);
    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ shareChats: false })
    );
  });

  it("calls the radio button handler on click (Yes)", () => {
    render(<SettingsNavigationItem />);
    const yesRadio = screen.getByRole("radio", { name: "Yes" });
    fireEvent.click(yesRadio);
    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ hideIndexTable: true })
    );
  });

  it("shows the updating label when isUpdating is true", async () => {
    render(<SettingsNavigationItem />);
    const switchElement = screen.getByRole("checkbox");
    fireEvent.click(switchElement);
    await waitFor(() => {
      expect(screen.getByText("Updating settings...")).toBeInTheDocument();
    });
  });

  it("SideNavigationItem has correct props", () => {
    render(<SettingsNavigationItem />);
    const sideNavItem = screen.getByTestId("ui5-side-navigation-item");
    expect(sideNavItem).toHaveAttribute("data-text", "Settings");
    expect(sideNavItem).toHaveAttribute("data-icon", "action-settings");
  });

  // Test de error movido a SettingsNavigationItem.error.test.tsx

  it("calls console.error when updateSettings fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockUpdateSettings.mockResolvedValueOnce({
      ok: false,
      statusText: "fail",
    });
    render(<SettingsNavigationItem />);
    const switchElement = screen.getByRole("checkbox");
    fireEvent.click(switchElement);
    // Wait for async update
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Failed to update settings:",
        "fail"
      );
    });
    (console.error as jest.Mock).mockRestore();
  });
});
