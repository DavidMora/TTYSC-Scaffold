import React from "react";
import { render, screen } from "@testing-library/react";
import TableToolbar from "@/components/Tables/TableToolbar";
import "@testing-library/jest-dom";

describe("TableToolbar", () => {
  describe("Rendering", () => {
    it("should render with proper visual structure", () => {
      render(<TableToolbar />);

      const separators = screen.getAllByTestId("ui5-toolbar-separator");
      expect(separators).toHaveLength(3);
      const toolbar = screen.getByTestId("ui5-toolbar");
      expect(toolbar).toBeInTheDocument();
      expect(
        screen.getAllByTestId("ui5-toolbar-separator").length
      ).toBeGreaterThan(0);
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
  });

  describe("Accessibility", () => {
    it("should have proper semantic structure", () => {
      render(<TableToolbar />);

      expect(screen.getByTestId("ui5-toolbar")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });
});
