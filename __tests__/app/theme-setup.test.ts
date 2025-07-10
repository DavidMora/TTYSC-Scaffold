// Mock setTheme before any imports
jest.mock("@ui5/webcomponents-base/dist/config/Theme.js", () => ({
  setTheme: jest.fn(),
}));

// Mock all the asset imports to avoid side effects
jest.mock("@ui5/webcomponents/dist/Assets.js", () => ({}));
jest.mock("@ui5/webcomponents-icons/dist/AllIcons.js", () => ({}));

import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";

describe("theme-setup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls setTheme with sap_horizon", async () => {
    // Import theme-setup module which should trigger setTheme call
    await import("@/app/theme-setup");

    expect(setTheme).toHaveBeenCalledWith("sap_horizon");
    expect(setTheme).toHaveBeenCalledTimes(1);
  });
});
