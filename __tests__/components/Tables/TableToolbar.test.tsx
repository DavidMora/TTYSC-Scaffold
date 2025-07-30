import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TableToolbar from "@/components/Tables/TableToolbar";
import "@testing-library/jest-dom";

const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

describe("TableToolbar", () => {
  afterEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("Rendering", () => {
    it("should render with proper visual structure", () => {
      render(<TableToolbar />);

      const separators = screen.getAllByTestId("ui5-toolbar-separator");
      expect(separators).toHaveLength(3);
      const toolbar = screen.getByTestId("ui5-toolbar");
      expect(toolbar).toBeInTheDocument();
    });

    it("should apply custom className when provided", () => {
      const customClass = "custom-toolbar-class";
      render(<TableToolbar className={customClass} />);

      const toolbar = screen.getByTestId("ui5-toolbar");
      expect(toolbar).toHaveClass(customClass);
    });

    it("should have appropriate styling applied", () => {
      render(<TableToolbar />);

      const toolbar = screen.getByTestId("ui5-toolbar");
      expect(toolbar).toHaveStyle({
        borderBottom: "1px solid var(--sapList_HeaderBorderColor)",
        paddingInline: "0.75rem",
      });
    });

    it("should render with default title when not provided", () => {
      render(<TableToolbar />);

      expect(screen.getByText("Final Summary")).toBeInTheDocument();
    });

    it("should render with custom title when provided", () => {
      const customTitle = "Custom Table Title";
      render(<TableToolbar title={customTitle} />);

      expect(screen.getByText(customTitle)).toBeInTheDocument();
    });
  });

  describe("Event Handlers", () => {
    it("should handle search input changes", () => {
      render(<TableToolbar />);

      const searchInput = screen.getByTestId("ui5-input");
      fireEvent.change(searchInput, { target: { value: "test search" } });

      expect(searchInput).toHaveValue("test search");
    });

    it("should handle share button click", () => {
      render(<TableToolbar />);

      const buttons = screen.getAllByTestId("ui5-toolbar-button");
      const shareButton = buttons[0]; // First button is share
      fireEvent.click(shareButton);

      expect(consoleSpy).toHaveBeenCalledWith("share");
    });

    it("should handle settings button click", () => {
      render(<TableToolbar />);

      const buttons = screen.getAllByTestId("ui5-toolbar-button");
      const settingsButton = buttons[1]; // Second button is settings
      fireEvent.click(settingsButton);

      expect(consoleSpy).toHaveBeenCalledWith("settings");
    });

    it("should handle export button click", () => {
      render(<TableToolbar />);

      const buttons = screen.getAllByTestId("ui5-toolbar-button");
      const exportButton = buttons[2]; // Third button is export
      fireEvent.click(exportButton);

      expect(consoleSpy).toHaveBeenCalledWith("export");
    });

    it("should handle full screen button click", () => {
      render(<TableToolbar />);

      const buttons = screen.getAllByTestId("ui5-toolbar-button");
      const fullScreenButton = buttons[3]; // Fourth button is full screen
      fireEvent.click(fullScreenButton);

      expect(consoleSpy).toHaveBeenCalledWith("full screen");
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic structure", () => {
      render(<TableToolbar />);

      expect(screen.getByTestId("ui5-toolbar")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
      expect(screen.getByTestId("ui5-input")).toBeInTheDocument();
    });

    it("should have search input with proper attributes", () => {
      render(<TableToolbar />);

      const searchInput = screen.getByTestId("ui5-input");
      expect(searchInput).toHaveAttribute("placeholder", "Search...");
      expect(searchInput).toHaveAttribute("type", "Text");
    });

    it("should have toolbar buttons with proper icons", () => {
      render(<TableToolbar />);

      const buttons = screen.getAllByTestId("ui5-toolbar-button");
      expect(buttons).toHaveLength(4);
    });
  });
});
