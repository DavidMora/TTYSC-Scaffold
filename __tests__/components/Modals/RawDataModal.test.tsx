import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RawDataModal } from "@/components/Modals/RawDataModal";

// Mock the BaseDataTable component
jest.mock("@/components/Tables/BaseDataTable", () => {
  return function MockBaseDataTable(props: Record<string, unknown>) {
    return (
      <div data-testid="base-data-table" {...props}>
        Mock BaseDataTable
      </div>
    );
  };
});

// Mock the constants
jest.mock("@/lib/constants/mocks/dataTable", () => ({
  tableData: [
    { text: "Row 1", additionalText: "Additional 1" },
    { text: "Row 2", additionalText: "Additional 2" },
  ],
}));

describe("RawDataModal", () => {
  const defaultProps = {
    data: [
      { text: "Test row 1", additionalText: "Additional test 1" },
      { text: "Test row 2", additionalText: "Additional test 2" },
    ],
    open: true,
  };

  it("should render the modal with correct header", () => {
    render(<RawDataModal {...defaultProps} />);

    expect(screen.getByText("Raw Data")).toBeInTheDocument();
    expect(screen.getByTestId("ui5-dialog")).toBeInTheDocument();
  });

  it("should render the BaseDataTable component", () => {
    render(<RawDataModal {...defaultProps} />);

    const baseDataTable = screen.getByTestId("base-data-table");
    expect(baseDataTable).toBeInTheDocument();
  });

  it("should render the download button", () => {
    render(<RawDataModal {...defaultProps} />);

    const downloadButton = screen.getByText("Download full data");
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute("design", "Emphasized");
  });

  it("should render the close button in header", () => {
    render(<RawDataModal {...defaultProps} />);

    const closeButton = screen.getByRole("button", { name: "decline" });
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute("design", "Transparent");
  });

  it("should call onClose when close button is clicked", () => {
    const mockOnClose = jest.fn();
    render(<RawDataModal {...defaultProps} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: "decline" });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledWith({});
  });

  it("should not call onClose when onClose is not provided", () => {
    render(<RawDataModal {...defaultProps} />);

    const closeButton = screen.getByRole("button", { name: "decline" });
    // Should not throw an error
    expect(() => fireEvent.click(closeButton)).not.toThrow();
  });

  it("should apply custom className when provided", () => {
    const customClassName = "custom-modal-class";
    render(<RawDataModal {...defaultProps} className={customClassName} />);

    const dialog = screen.getByTestId("ui5-dialog");
    expect(dialog).toHaveClass(customClassName);
  });

  it("should have correct data-component attribute", () => {
    render(<RawDataModal {...defaultProps} />);

    const dialog = screen.getByTestId("ui5-dialog");
    // The Dialog component should render with our className
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass("paddingless-content");
  });

  it("should pass correct props to BaseDataTable", () => {
    render(<RawDataModal {...defaultProps} />);

    const baseDataTable = screen.getByTestId("base-data-table");
    expect(baseDataTable).toBeInTheDocument();
    expect(baseDataTable).toHaveAttribute(
      "data",
      "[object Object],[object Object]"
    );
  });

  it("should render with provided data prop", () => {
    render(<RawDataModal {...defaultProps} />);

    // Should render without errors
    expect(screen.getByText("Raw Data")).toBeInTheDocument();
    expect(screen.getByTestId("base-data-table")).toBeInTheDocument();
  });

  it("should pass through other Dialog props", () => {
    const additionalProps = {
      ...defaultProps,
      role: "dialog",
    };

    render(<RawDataModal {...additionalProps} />);

    const dialog = screen.getByTestId("ui5-dialog");
    expect(dialog).toHaveAttribute("role", "dialog");
  });

  it("should have correct structure and styling", () => {
    render(<RawDataModal {...defaultProps} />);

    // Check that modal renders with expected elements
    expect(screen.getByText("Raw Data")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "decline" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download full data" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("base-data-table")).toBeInTheDocument();
  });
});
