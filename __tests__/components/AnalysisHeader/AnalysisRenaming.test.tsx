import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnalysisRenaming } from "@/components/AnalysisHeader/AnalysisRenaming";
import type { InputDomRef } from "@ui5/webcomponents-react";

jest.mock("@/components/Modal/ConfirmationModal", () => ({
  ConfirmationModal: function MockConfirmationModal({
    isOpen,
    title,
    message,
    actions,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    actions: Array<{ label: string; design?: string; onClick: () => void }>;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="validation-modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-message">{message}</div>
        <div data-testid="modal-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              data-testid={`modal-action-${action.label.toLowerCase()}`}
              data-design={action.design}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    );
  },
}));

const mockFocus = jest.fn();
const createMockRef = (): React.RefObject<{
  focus: jest.Mock;
  offsetWidth: number;
}> => ({
  current: {
    focus: mockFocus,
    offsetWidth: 100,
  },
});

describe("AnalysisRenaming", () => {
  const defaultProps = {
    analysisName: "Test Analysis",
    onNameChange: jest.fn(),
    inputRef: createMockRef() as unknown as React.RefObject<InputDomRef | null>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFocus.mockClear();
  });

  it("should save changes and call onNameChange when Enter is pressed", () => {
    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("icon"));
    const input = screen.getByTestId("input");

    fireEvent.change(input, { target: { value: "New Analysis Name" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(defaultProps.onNameChange).toHaveBeenCalledWith("New Analysis Name");
    expect(screen.queryByTestId("input")).not.toBeInTheDocument();
    expect(screen.getByTestId("text")).toBeInTheDocument();
  });

  it("should cancel editing when Escape is pressed", () => {
    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("icon"));
    const input = screen.getByTestId("input");

    fireEvent.change(input, { target: { value: "New Analysis Name" } });
    fireEvent.keyDown(input, { key: "Escape", code: "Escape" });

    expect(defaultProps.onNameChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId("input")).not.toBeInTheDocument();
    expect(screen.getByTestId("text")).toHaveTextContent("Test Analysis");
  });

  it("should close validation modal when OK is clicked", () => {
    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("icon"));
    const input = screen.getByTestId("input");

    fireEvent.change(input, { target: { value: "" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByTestId("validation-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("modal-action-ok"));

    expect(screen.queryByTestId("validation-modal")).not.toBeInTheDocument();
  });

  it("should handle key events that are not Enter or Escape", () => {
    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("icon"));
    const input = screen.getByTestId("input");

    fireEvent.change(input, { target: { value: "New Name" } });
    fireEvent.keyDown(input, { key: "Tab", code: "Tab" });

    expect(screen.getByTestId("input")).toBeInTheDocument();
    expect(defaultProps.onNameChange).not.toHaveBeenCalled();
  });
});
