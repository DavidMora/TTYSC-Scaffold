import React from "react";
import { render, screen } from "@testing-library/react";
import ThemeProvider from "@/components/ThemeProvider";
import "@testing-library/jest-dom";
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";

jest.mock("@ui5/webcomponents-base/dist/config/Theme.js", () => ({
  setTheme: jest.fn(),
}));

describe("ThemeProvider", () => {
  beforeEach(() => {
    (setTheme as jest.Mock).mockClear();
  });

  it("renders children and sets the theme", () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );

    expect(screen.getByText("Test Child")).toBeInTheDocument();
    expect(setTheme).toHaveBeenCalledWith("sap_horizon");
  });
});
