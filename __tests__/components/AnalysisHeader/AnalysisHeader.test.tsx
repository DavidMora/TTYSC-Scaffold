import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AnalysisHeader from "@/components/AnalysisHeader/AnalysisHeader";

jest.mock("@/hooks/useSequentialNaming", () => ({
  useSequentialNaming: () => ({
    currentName: "Analysis One",
    generateNextName: jest.fn(),
    setCustomName: jest.fn(),
  }),
}));

jest.mock("@/components/AnalysisHeader/AnalysisRenaming", () => ({
  AnalysisRenaming: function MockAnalysisRenaming({
    analysisName,
  }: {
    analysisName: string;
  }) {
    return <div data-testid="analysis-renaming">{analysisName}</div>;
  },
}));

jest.mock("@/components/AnalysisHeader/CreateAnalysis", () => ({
  CreateAnalysis: function MockCreateAnalysis({
    onCreateAnalysis,
  }: {
    onCreateAnalysis: () => void;
  }) {
    return (
      <button data-testid="create-analysis" onClick={onCreateAnalysis}>
        Create Analysis
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
        {actions?.map((action, index) => (
          <button key={index} onClick={action.onClick}>
            {action.label}
          </button>
        ))}
      </div>
    );
  };
});

describe("Analysis Header", () => {
  it("should render with default analysis name", () => {
    render(<AnalysisHeader />);

    expect(screen.getByTestId("analysis-renaming")).toHaveTextContent(
      "Analysis One"
    );
  });

  it("should not call onFiltersReset when not provided", () => {
    render(<AnalysisHeader />);

    expect(() => {
      fireEvent.click(screen.getByTestId("create-analysis"));
    }).not.toThrow();
  });
});
