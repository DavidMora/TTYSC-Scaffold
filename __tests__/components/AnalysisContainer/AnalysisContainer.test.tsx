import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AnalysisContainer from "@/components/AnalysisContainer/AnalysisContainer";
import { SequentialNamingProvider } from "@/contexts/SequentialNamingContext";
import { useParams } from "next/navigation";

jest.mock("@/components/AnalysisChat/AnalysisChat", () =>
  jest.fn(() => <div data-testid="analysis-chat" />)
);

jest.mock("@/components/AnalysisFilters/AnalysisFilters", () => {
  const Mock = () => <div data-testid="analysis-filters" />;
  Mock.displayName = "MockAnalysisFilters";
  return Mock;
});

jest.mock("@/components/AnalysisHeader/AnalysisHeader", () => {
  const Mock = () => <div data-testid="analysis-header" />;
  Mock.displayName = "MockAnalysisHeader";
  return Mock;
});

const mockUseAnalysisFilters = jest.fn(() => ({
  filters: {},
  availableOptions: {},
  isDisabled: false,
  handleFilterChange: jest.fn(),
  resetFilters: jest.fn(),
}));
jest.mock("@/hooks/useAnalysisFilters", () => ({
  useAnalysisFilters: () => mockUseAnalysisFilters(),
}));

const mockUseChat = jest.fn();
jest.mock("@/hooks/chats", () => ({
  useChat: () => mockUseChat(),
}));

const mockGenerateAnalysisName = jest.fn(() => "Generated Analysis Name");
const mockUseSequentialNaming = jest.fn(() => ({
  generateAnalysisName: mockGenerateAnalysisName,
}));
jest.mock("@/contexts/SequentialNamingContext", () => ({
  SequentialNamingProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sequential-naming-provider">{children}</div>
  ),
  useSequentialNaming: () => mockUseSequentialNaming(),
}));

// Get the mocked component
import AnalysisChat from "@/components/AnalysisChat/AnalysisChat";
const mockAnalysisChat = jest.mocked(AnalysisChat);

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <SequentialNamingProvider>{component}</SequentialNamingProvider>
  );
};

describe("AnalysisContainer", () => {
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: "test-analysis-id" });
    mockUseAnalysisFilters.mockReturnValue({
      filters: {},
      availableOptions: {},
      isDisabled: false,
      handleFilterChange: jest.fn(),
      resetFilters: jest.fn(),
    });
  });

  it("renders loading state", () => {
    mockUseChat.mockReturnValue({ isLoading: true, isValidating: false });
    renderWithProviders(<AnalysisContainer />);
    expect(screen.getByTestId("ui5-busy-indicator")).toBeInTheDocument();
  });

  it("renders error state with fallback message if error.message is falsy", () => {
    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: {},
      mutate: undefined,
    });
    renderWithProviders(<AnalysisContainer />);
    expect(screen.getByText("Unable to Load Analysis")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Something went wrong while fetching the analysis data. Please try again."
      )
    ).toBeInTheDocument();
  });

  it("renders successful state with analysis data", () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      name: "Test Analysis Name",
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    expect(screen.getByTestId("analysis-filters")).toBeInTheDocument();
    expect(screen.getByTestId("analysis-header")).toBeInTheDocument();
    expect(screen.getByTestId("analysis-chat")).toBeInTheDocument();
  });

  it("generates analysis name when data name is empty and no name is set", async () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      title: "",
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    await waitFor(() => {
      expect(mockGenerateAnalysisName).toHaveBeenCalled();
      expect(screen.getByTestId("analysis-header")).toBeInTheDocument();
    });
  });

  it("passes empty values to AnalysisChat when data is not available", () => {
    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: null },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "",
        previousMessages: [],
      },
      undefined
    );
  });
});
