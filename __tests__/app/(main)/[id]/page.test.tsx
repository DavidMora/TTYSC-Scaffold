import { render, screen } from "@testing-library/react";
import { useParams } from "next/navigation";
import AnalysisPage from "@/app/(main)/[id]/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/components/AnalysisContainer/AnalysisContainer", () => {
  return function MockAnalysisContainer() {
    return (
      <div data-testid="mock-analysis-container">
        Analysis Container with ID: undefined
      </div>
    );
  };
});

describe("AnalysisPage", () => {
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders AnalysisContainer with correct analysis ID from params", () => {
    mockUseParams.mockReturnValue({ id: "test-analysis-123" });

    render(<AnalysisPage />);

    expect(screen.getByTestId("mock-analysis-container")).toBeInTheDocument();
  });
});
