import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnalysisRenaming } from "@/components/AnalysisHeader/AnalysisRenaming";
import type { InputDomRef } from "@ui5/webcomponents-react";
import { useRenameChat } from "@/hooks/chats";
import { Chat } from "@/lib/types/chats";

const mockMutate = jest.fn();

jest.mock("@/hooks/chats", () => ({
  useRenameChat: jest.fn(() => ({
    mutate: mockMutate,
    isLoading: false,
  })),
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
  });

  it("should save changes and call onNameChange when Enter is pressed", () => {
    const mockUseRenameAnalysis = jest.mocked(useRenameChat);
    let onSuccessCallback: ((data: { title: string; }) => void) | undefined;

    mockUseRenameAnalysis.mockImplementation((options: { onSuccess?: (data: { title: string; }) => void }) => {
      onSuccessCallback = options?.onSuccess;
      return {
        mutate: jest.fn(({ data }: { data: Chat }) => {
          if (onSuccessCallback) {
            onSuccessCallback({ title: data.title });
          }
        }),
        isLoading: false,
        data: undefined,
        error: null,
        reset: jest.fn(),
      };
    });

    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("ui5-icon"));
    const input = screen.getByTestId("ui5-input");

    fireEvent.input(input, { target: { value: "New Analysis Name" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(defaultProps.onNameChange).toHaveBeenCalledWith("New Analysis Name");
    expect(screen.queryByTestId("ui5-input")).not.toBeInTheDocument();
    expect(screen.getByTestId("ui5-text")).toBeInTheDocument();
  });

  it("should cancel editing when Escape is pressed", () => {
    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("ui5-icon"));
    const input = screen.getByTestId("ui5-input");

    fireEvent.input(input, { target: { value: "New Analysis Name" } });
    fireEvent.keyDown(input, { key: "Escape", code: "Escape" });

    expect(defaultProps.onNameChange).not.toHaveBeenCalled();
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
    expect(defaultProps.onNameChange).not.toHaveBeenCalled();
  });

  it("should handle rename analysis error and exit editing mode", () => {
    const mockUseRenameAnalysis = jest.mocked(useRenameChat);
    let onErrorCallback: ((error: Error) => void) | undefined;

    mockUseRenameAnalysis.mockImplementation((options: { onError?: (error: Error) => void }) => {
      onErrorCallback = options?.onError;
      return {
        mutate: jest.fn(() => {
          if (onErrorCallback) {
            onErrorCallback(new Error("Test error"));
          }
        }),
        isLoading: false,
      };
    });

    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("ui5-icon"));
    const input = screen.getByTestId("ui5-input");

    fireEvent.input(input, { target: { value: "New Analysis Name" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.queryByTestId("ui5-input")).not.toBeInTheDocument();
    expect(screen.getByTestId("ui5-text")).toBeInTheDocument();
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

  it("should show loading state with placeholder and opacity", () => {
    const mockUseRenameAnalysis = jest.mocked(useRenameChat);
    mockUseRenameAnalysis.mockImplementation(() => ({
      mutate: mockMutate,
      isLoading: true,
      data: undefined,
      error: null,
      reset: jest.fn(),
    }));

    render(<AnalysisRenaming {...defaultProps} />);

    fireEvent.click(screen.getByTestId("ui5-icon"));
    const input = screen.getByTestId("ui5-input");

    expect(input).toHaveAttribute("placeholder", "Saving...");
    expect(input).toHaveAttribute("disabled", "");

    expect(input.style.opacity).toBe("0.7");
  });
});
