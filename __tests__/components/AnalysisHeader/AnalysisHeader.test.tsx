import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AnalysisHeader from "@/components/AnalysisHeader/AnalysisHeader";
import { Analysis } from "@/lib/types/analysis";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("@/contexts/SequentialNamingContext", () => ({
  useSequentialNaming: () => ({
    generateAnalysisName: jest.fn(() => "Analysis One"),
    currentCounter: 1,
  }),
}));

jest.mock("@/components/AnalysisHeader/AnalysisRenaming", () => ({
  AnalysisRenaming: function MockAnalysisRenaming({
    analysisName,
    onNameChange,
    inputRef,
  }: {
    analysisName: string;
    onNameChange?: (name: string) => void;
    inputRef?: React.RefObject<HTMLInputElement>;
  }) {
    return (
      <div data-testid="analysis-renaming">
        <input
          data-testid="analysis-name-input"
          value={analysisName}
          onChange={(e) => onNameChange?.(e.target.value)}
          ref={inputRef}
        />
      </div>
    );
  },
}));

jest.mock("@/components/AnalysisHeader/CreateAnalysis", () => ({
  CreateAnalysis: function MockCreateAnalysis({
    onCreateAnalysis,
    isCreating,
  }: {
    onCreateAnalysis: () => void;
    isCreating?: boolean;
  }) {
    return (
      <button
        data-testid="create-analysis"
        onClick={onCreateAnalysis}
        disabled={isCreating}
      >
        {isCreating ? "Creating..." : "Create Analysis"}
      </button>
    );
  },
}));

jest.mock("@/components/Modal/ConfirmationModal", () => {
  return function MockConfirmationModal({
    isOpen,
    title,
    message,
    actions,
  }: {
    isOpen: boolean;
    title: string;
    message: string;
    actions?: Array<{ label: string; onClick: () => void }>;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="app-modal">
        <div>{title}</div>
        <div>{message}</div>
        {actions?.map((action, actionIndex) => (
          <button
            key={`${action.label}-${actionIndex}`}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };
});

const mockMutate = jest.fn();
const mockUseCreateAnalysis = jest.fn();

interface UseCreateAnalysisOptions {
  onSuccess?: (data: Analysis) => void;
}

jest.mock("@/hooks/useAnalysis", () => ({
  useCreateAnalysis: (options: UseCreateAnalysisOptions) =>
    mockUseCreateAnalysis(options),
}));

describe("Analysis Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCreateAnalysis.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: null,
      data: null,
    });
  });

  it("should render with default analysis name", () => {
    render(<AnalysisHeader />);

    expect(screen.getByDisplayValue("")).toBeInTheDocument();
  });

  it("should not call onFiltersReset when not provided", () => {
    render(<AnalysisHeader />);

    expect(() => {
      fireEvent.click(screen.getByTestId("create-analysis"));
    }).not.toThrow();
  });

  it("should call onFiltersReset and navigate on successful analysis creation", async () => {
    const mockOnFiltersReset = jest.fn();
    const mockAnalysisData: Analysis = {
      id: "test-analysis-id",
      name: "Test Analysis",
    };

    let capturedOnSuccess: ((data: Analysis) => void) | undefined;
    mockUseCreateAnalysis.mockImplementation((options) => {
      capturedOnSuccess = options.onSuccess;
      return {
        mutate: mockMutate,
        isLoading: false,
        error: null,
        data: null,
      };
    });

    render(<AnalysisHeader onFiltersReset={mockOnFiltersReset} />);

    if (capturedOnSuccess) {
      capturedOnSuccess(mockAnalysisData);
    }

    await waitFor(() => {
      expect(mockOnFiltersReset).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/test-analysis-id");
    });
  });
});
