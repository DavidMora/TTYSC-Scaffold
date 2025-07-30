import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/hooks/settings", () => ({
  useSettings: () => ({
    data: undefined,
    isLoading: true,
    error: null,
    mutate: jest.fn(),
  }),
}));

import SettingsNavigationItem from "@/components/AppLayout/SidebarItems/SettingsNavigationItem";

describe("SettingsNavigationItem loading state", () => {
  it("shows loading label when isLoadingSettings is true", () => {
    render(<SettingsNavigationItem />);
    expect(screen.getByText("Loading settings...")).toBeInTheDocument();
  });
});
