import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExportMenu } from "@/components/ExportMenu";
import { useExportTable } from "@/hooks/useExport";
import "@testing-library/jest-dom";

// Mock the hooks
jest.mock("@/hooks/useExport");
jest.mock("@/lib/constants/UI/export", () => ({
  EXPORT_CONFIG: {
    formats: [
      {
        id: "csv",
        name: "CSV",
        icon: "add-document",
        mimeType: "text/csv",
        fileExtension: ".csv",
      },
      {
        id: "excel",
        name: "Excel",
        icon: "excel-attachment",
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileExtension: ".xlsx",
      },
    ],
    defaultFormat: "csv",
    maxFileSize: 50 * 1024 * 1024,
  },
}));

const mockUseExportTable = useExportTable as jest.MockedFunction<
  typeof useExportTable
>;

describe("ExportMenu", () => {
  const defaultProps = {
    tableId: "1",
  };

  const mockExportToFormat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExportTable.mockReturnValue({
      exportToFormat: mockExportToFormat,
      isExporting: false,
      error: null,
    });
  });

  it("renders with default props", () => {
    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByTestId("ui5-toolbar-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Export");
    expect(button).toHaveAttribute("data-icon", "excel-attachment");
    expect(button).toHaveAttribute("endIcon", "slim-arrow-down");
  });

  it("renders with custom props", () => {
    render(
      <ExportMenu
        {...defaultProps}
        buttonText="Custom Export"
        buttonIcon="custom-icon"
        className="custom-class"
      />
    );

    const button = screen.getByTestId("ui5-toolbar-button");
    expect(button).toHaveTextContent("Custom Export");
    expect(button).toHaveAttribute("data-icon", "custom-icon");
    expect(button).toHaveClass("custom-class");
  });

  it("opens menu when button is clicked", () => {
    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByTestId("ui5-toolbar-button");
    fireEvent.click(button);

    expect(screen.getByTestId("ui5-menu")).toBeInTheDocument();
    expect(button).toHaveAttribute("endIcon", "slim-arrow-up");
  });

  it("closes menu when menu is clicked", () => {
    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByTestId("ui5-toolbar-button");
    fireEvent.click(button);

    const menu = screen.getByTestId("ui5-menu");
    expect(menu).toBeInTheDocument();

    fireEvent.click(menu);

    expect(screen.queryByTestId("ui5-menu")).not.toBeInTheDocument();
    expect(button).toHaveAttribute("endIcon", "slim-arrow-down");
  });

  it("renders menu items for each format", () => {
    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByTestId("ui5-toolbar-button");
    fireEvent.click(button);

    expect(screen.getAllByTestId("ui5-menu-item")).toHaveLength(2);
    expect(screen.getByText("Export to CSV")).toBeInTheDocument();
    expect(screen.getByText("Export to Excel")).toBeInTheDocument();
  });

  it("handles export when menu item is clicked", async () => {
    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByTestId("ui5-toolbar-button");
    fireEvent.click(button);

    const csvMenuItem = screen.getByText("Export to CSV");
    fireEvent.click(csvMenuItem);

    await waitFor(() => {
      expect(mockExportToFormat).toHaveBeenCalledWith({
        id: "csv",
        name: "CSV",
        icon: "add-document",
        mimeType: "text/csv",
        fileExtension: ".csv",
      });
    });

    expect(screen.queryByTestId("ui5-menu")).not.toBeInTheDocument();
  });

  it("handles export error and logs to console", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const exportError = new Error("Export failed");

    mockExportToFormat.mockRejectedValueOnce(exportError);

    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByTestId("ui5-toolbar-button");
    fireEvent.click(button);

    const csvMenuItem = screen.getByText("Export to CSV");
    fireEvent.click(csvMenuItem);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(exportError);
    });

    expect(screen.queryByTestId("ui5-menu")).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
