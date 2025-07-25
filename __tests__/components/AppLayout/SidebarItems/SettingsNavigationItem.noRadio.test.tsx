import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock with hideIndexTable: true to test the 'No' radio button branch
jest.mock("@/hooks/settings", () => ({
  useSettings: () => ({
    data: { shareChats: true, hideIndexTable: true },
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

describe("SettingsNavigationItem radio button No branch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the radio button handler on click (No)", () => {
    render(<SettingsNavigationItem />);
    const radioButtons = screen.getAllByTestId("ui5-radio-button");
    const noRadio = radioButtons.find(
      (r) => r.nextSibling?.textContent === "No"
    );
    fireEvent.click(noRadio!);
    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ hideIndexTable: false })
    );
  });
});
