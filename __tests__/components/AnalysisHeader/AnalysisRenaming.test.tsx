import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnalysisRenaming } from "@/components/AnalysisHeader/AnalysisRenaming";
import type { InputDomRef } from "@ui5/webcomponents-react";

const mockMutate = jest.fn();
const mockActivateAutosaveUI = jest.fn();

// Mock the hooks
jest.mock("@/hooks/chats", () => ({
  useUpdateChat: jest.fn(() => ({
    mutate: mockMutate,
    isLoading: false,
  })),
}));

jest.mock("@/contexts/AutosaveUIProvider", () => ({
  useAutosaveUI: () => ({
    activateAutosaveUI: mockActivateAutosaveUI,
  }),
}));

jest.mock("@/components/Modal/ConfirmationModal", () => ({
  ConfirmationModal: function MockConfirmationModal({
    isOpen,
    title,
    message,
    actions,
  }: {
    isOpen: boolean;
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
              key={`${action.label}-${index}`}
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
    analysisId: "test-analysis-id",
    onNameChange: jest.fn(),
    inputRef: createMockRef() as unknown as React.RefObject<InputDomRef | null>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFocus.mockClear();
    mockMutate.mockClear();
    mockActivateAutosaveUI.mockClear();
  });

  it("should save changes and call onNameChange when Enter is pressed", () => {
    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("ui5-icon"));
    const input = screen.getByTestId("ui5-input");

    fireEvent.input(input, { target: { value: "New Analysis Name" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockMutate).toHaveBeenCalledWith({
      id: "test-analysis-id",
      title: "New Analysis Name",
    });
  });

  it("should cancel editing when Escape is pressed", () => {
    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("ui5-icon"));
    const input = screen.getByTestId("ui5-input");

    fireEvent.input(input, { target: { value: "New Analysis Name" } });
    fireEvent.keyDown(input, { key: "Escape", code: "Escape" });

    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.queryByTestId("ui5-input")).not.toBeInTheDocument();
    expect(screen.getByTestId("ui5-text")).toHaveTextContent("Test Analysis");
  });

  it("should close validation modal when OK is clicked", () => {
    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("ui5-icon"));
    const input = screen.getByTestId("ui5-input");

    fireEvent.input(input, { target: { value: "" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByTestId("validation-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("modal-action-ok"));

    expect(screen.queryByTestId("validation-modal")).not.toBeInTheDocument();
  });

  it("should handle key events that are not Enter or Escape", () => {
    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("ui5-icon"));
    const input = screen.getByTestId("ui5-input");

    fireEvent.input(input, { target: { value: "New Name" } });
    fireEvent.keyDown(input, { key: "Tab", code: "Tab" });

    expect(screen.getByTestId("ui5-input")).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("should handle save edit when analysisId is not provided", () => {
    const propsWithoutId = {
      ...defaultProps,
      analysisId: undefined,
    };

    render(<AnalysisRenaming {...propsWithoutId} />);

    fireEvent.click(screen.getByTestId("ui5-icon"));
    const input = screen.getByTestId("ui5-input");

    fireEvent.input(input, { target: { value: "New Analysis Name" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("should handle successful rename by calling onNameChange and activateAutosaveUI", () => {
    const mockOnNameChange = jest.fn();

    // Mock the useUpdateChat hook to simulate success callback
    const { useUpdateChat } = jest.requireMock("@/hooks/chats");
    useUpdateChat.mockImplementation(
      ({ onSuccess }: { onSuccess: (data: { title: string }) => void }) => ({
        mutate: () => {
          // Simulate successful mutation
          onSuccess({ title: "Updated Analysis Name" });
        },
        isLoading: false,
      })
    );

    render(
      <AnalysisRenaming {...defaultProps} onNameChange={mockOnNameChange} />
    );

    fireEvent.click(screen.getByTestId("ui5-icon"));
    const input = screen.getByTestId("ui5-input");

    fireEvent.input(input, { target: { value: "Updated Analysis Name" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Verify that success callbacks are called
    expect(mockOnNameChange).toHaveBeenCalledWith("Updated Analysis Name");
    expect(mockActivateAutosaveUI).toHaveBeenCalled();
  });

  it("should handle rename error by resetting editing state", () => {
    // Mock the useUpdateChat hook to simulate error callback
    const { useUpdateChat } = jest.requireMock("@/hooks/chats");
    useUpdateChat.mockImplementation(
      ({ onError }: { onError: (error: Error) => void }) => ({
        mutate: () => {
          // Simulate error
          onError(new Error("Rename failed"));
        },
        isLoading: false,
      })
    );

    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("ui5-icon"));
    const input = screen.getByTestId("ui5-input");

    fireEvent.input(input, { target: { value: "New Analysis Name" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Verify that editing state is reset on error
    expect(screen.queryByTestId("ui5-input")).not.toBeInTheDocument();
    expect(screen.getByTestId("ui5-text")).toHaveTextContent("Test Analysis");
  });
});
