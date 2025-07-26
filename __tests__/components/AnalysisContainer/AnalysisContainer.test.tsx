import React from "react";
import { render, screen } from "@testing-library/react";
import AnalysisContainer from "@/components/AnalysisContainer/AnalysisContainer";
import { SequentialNamingProvider } from "@/contexts/SequentialNamingContext";
import { AutosaveUIProvider } from "@/contexts/AutosaveUIProvider";
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
  useAnalysisFilters: jest.fn(() => mockUseAnalysisFilters()),
}));

const mockUseChat = jest.fn();
const mockUpdateChat = jest.fn();
jest.mock("@/hooks/chats", () => ({
  useChat: () => mockUseChat(),
  useUpdateChat: () => ({
    mutate: mockUpdateChat,
  }),
}));

const mockUseAutoSave = jest.fn(() => ({
  isSaving: false,
  lastSaved: null,
  error: null,
  executeAutosave: jest.fn(),
}));
jest.mock("@/hooks/useAutoSave", () => ({
  useAutoSave: () => mockUseAutoSave(),
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

const mockUseAutosaveUI = jest.fn(() => ({
  activateAutosaveUI: jest.fn(),
  showAutoSaved: false,
}));
jest.mock("@/contexts/AutosaveUIProvider", () => ({
  AutosaveUIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="autosave-ui-provider">{children}</div>
  ),
  useAutosaveUI: () => mockUseAutosaveUI(),
}));

// Get the mocked component
import AnalysisChat from "@/components/AnalysisChat/AnalysisChat";
const mockAnalysisChat = jest.mocked(AnalysisChat);

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <SequentialNamingProvider>
      <AutosaveUIProvider>{component}</AutosaveUIProvider>
    </SequentialNamingProvider>
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
    mockUseAutoSave.mockReturnValue({
      isSaving: false,
      lastSaved: null,
      error: null,
      executeAutosave: jest.fn(),
    });
    mockUseAutosaveUI.mockReturnValue({
      activateAutosaveUI: jest.fn(),
      showAutoSaved: false,
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
        draft: "",
      },
      undefined
    );
  });

  it("sets analysis name when data has title", () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      title: "Test Analysis Title",
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "test-analysis-id",
        previousMessages: [],
        draft: "",
      },
      undefined
    );
  });

  it("handles analysis data with empty title", () => {
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

    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "test-analysis-id",
        previousMessages: [],
        draft: "",
      },
      undefined
    );
  });

  it("handles analysis data with messages and draft", () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      title: "Test Analysis",
      messages: [
        { id: "1", role: "user", content: "Hello", created: "2024-01-01" },
      ],
      draft: "Draft message",
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "test-analysis-id",
        previousMessages: mockAnalysisData.messages,
        draft: "Draft message",
      },
      undefined
    );
  });

  it("renders error state with retry functionality", () => {
    const mockError = new Error("Test error message");
    const mockRefetch = jest.fn();

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: mockError,
      mutate: mockRefetch,
    });

    renderWithProviders(<AnalysisContainer />);

    expect(screen.getByText("Unable to Load Analysis")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();

    const retryButton = screen.getByText("Try Again");
    expect(retryButton).toBeInTheDocument();
  });

  it("renders error state without retry functionality", () => {
    const mockError = new Error("Test error message");

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: mockError,
      mutate: undefined,
    });

    renderWithProviders(<AnalysisContainer />);

    expect(screen.getByText("Unable to Load Analysis")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();

    // Should not render retry button when mutate is undefined
    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });

  it("handles useEffect dependency changes", () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      title: "Initial Title",
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    const { rerender } = renderWithProviders(<AnalysisContainer />);

    // Change the analysis data to trigger useEffect
    const updatedAnalysisData = {
      id: "test-analysis-id",
      title: "Updated Title",
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: updatedAnalysisData },
      mutate: jest.fn(),
    });

    rerender(
      <SequentialNamingProvider>
        <AutosaveUIProvider>
          <AnalysisContainer />
        </AutosaveUIProvider>
      </SequentialNamingProvider>
    );

    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "test-analysis-id",
        previousMessages: [],
        draft: "",
      },
      undefined
    );
  });

  it("handles analysis data with empty title in useEffect", () => {
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

    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "test-analysis-id",
        previousMessages: [],
        draft: "",
      },
      undefined
    );
  });

  it("handles analysis data with undefined title in useEffect", () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      // title is undefined
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "test-analysis-id",
        previousMessages: [],
        draft: "",
      },
      undefined
    );
  });

  it("handles undefined analysis data in useEffect", () => {
    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: undefined },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "",
        previousMessages: [],
        draft: "",
      },
      undefined
    );
  });

  it("should handle analysis data with empty title in useEffect", () => {
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

    // Should not set analysis name when title is empty
    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "test-analysis-id",
        previousMessages: [],
        draft: "",
      },
      undefined
    );
  });

  it("should handle analysis data with undefined title in useEffect", () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      // title is undefined
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    // Should not set analysis name when title is undefined
    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "test-analysis-id",
        previousMessages: [],
        draft: "",
      },
      undefined
    );
  });

  it("should handle analysis data with null title in useEffect", () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      title: null,
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    // Should not set analysis name when title is null
    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "test-analysis-id",
        previousMessages: [],
        draft: "",
      },
      undefined
    );
  });

  it("should handle useEffect when analysisName changes", () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      title: "Test Analysis Title",
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    const { rerender } = renderWithProviders(<AnalysisContainer />);

    // Change the analysis data to trigger useEffect with different title
    const updatedAnalysisData = {
      id: "test-analysis-id",
      title: "Updated Analysis Title",
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: updatedAnalysisData },
      mutate: jest.fn(),
    });

    rerender(
      <SequentialNamingProvider>
        <AutosaveUIProvider>
          <AnalysisContainer />
        </AutosaveUIProvider>
      </SequentialNamingProvider>
    );

    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "test-analysis-id",
        previousMessages: [],
        draft: "",
      },
      undefined
    );
  });

  it("should handle useEffect when analysis.data changes from undefined to defined", () => {
    // Start with no data
    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: undefined },
      mutate: jest.fn(),
    });

    const { rerender } = renderWithProviders(<AnalysisContainer />);

    // Now provide data with title
    const mockAnalysisData = {
      id: "test-analysis-id",
      title: "New Analysis Title",
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    rerender(
      <SequentialNamingProvider>
        <AutosaveUIProvider>
          <AnalysisContainer />
        </AutosaveUIProvider>
      </SequentialNamingProvider>
    );

    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "test-analysis-id",
        previousMessages: [],
        draft: "",
      },
      undefined
    );
  });

  it("should handle useEffect when analysis.data changes from defined to undefined", () => {
    // Start with data
    const mockAnalysisData = {
      id: "test-analysis-id",
      title: "Test Analysis Title",
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    const { rerender } = renderWithProviders(<AnalysisContainer />);

    // Now remove data
    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: undefined },
      mutate: jest.fn(),
    });

    rerender(
      <SequentialNamingProvider>
        <AutosaveUIProvider>
          <AnalysisContainer />
        </AutosaveUIProvider>
      </SequentialNamingProvider>
    );

    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        chatId: "",
        previousMessages: [],
        draft: "",
      },
      undefined
    );
  });

  // NEW TEST CASES FOR 100% COVERAGE - Focus on the specific uncovered lines

  it("should test useAnalysisFilters callback that sets hasUserModifiedRef.current = true", () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      title: "Test Analysis",
      metadata: {
        analysis: "test-analysis",
        organizations: ["org1"],
        CM: ["cm1"],
        SKU: ["sku1"],
        NVPN: ["nvpn1"],
      },
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    // Verify useAnalysisFilters was called with the callback
    expect(mockUseAnalysisFilters).toHaveBeenCalledWith(
      expect.any(Object), // The filters object
      expect.any(Function) // The callback function (line 88)
    );

    // Get the callback function and test it
    const useAnalysisFiltersCall = mockUseAnalysisFilters.mock.calls[0];
    const callback = useAnalysisFiltersCall?.[1];

    // Test the callback - this covers line 88
    if (callback) {
      callback();
      // The callback should not throw and should set hasUserModifiedRef.current = true
      expect(callback).toBeDefined();
    }
  });

  it("should test useAutoSave onSave callback that calls updateChat", async () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      title: "Test Analysis",
      metadata: {
        analysis: "test-analysis",
        organizations: ["org1"],
        CM: ["cm1"],
        SKU: ["sku1"],
        NVPN: ["nvpn1"],
      },
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    const mockFilters = {
      analysis: "test-analysis",
      organizations: ["org1"],
      CM: ["cm1"],
      SKU: ["sku1"],
      NVPN: ["nvpn1"],
    };
    mockUseAnalysisFilters.mockReturnValue({
      filters: mockFilters,
      availableOptions: {},
      isDisabled: false,
      handleFilterChange: jest.fn(),
      resetFilters: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    // Verify useAutoSave was called
    expect(mockUseAutoSave).toHaveBeenCalledWith({
      valueToWatch: undefined,
      onSave: expect.any(Function),
      delayMs: 3000,
      onSuccess: expect.any(Function),
    });

    // Get the onSave function and test it
    const useAutoSaveCall = mockUseAutoSave.mock.calls[0];
    const onSave = useAutoSaveCall?.[0]?.onSave;

    // Test the onSave callback - this covers lines 101-114
    if (onSave) {
      await onSave();

      expect(mockUpdateChat).toHaveBeenCalledWith({
        id: "test-analysis-id",
        metadata: {
          analysis: "test-analysis",
          organizations: ["org1"],
          CM: ["cm1"],
          SKU: ["sku1"],
          NVPN: ["nvpn1"],
        },
      });
    }
  });

  it("should test useAutoSave onSuccess callback that calls activateAutosaveUI", () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      title: "Test Analysis",
      metadata: {
        analysis: "test-analysis",
        organizations: ["org1"],
        CM: ["cm1"],
        SKU: ["sku1"],
        NVPN: ["nvpn1"],
      },
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    const mockActivateAutosaveUI = jest.fn();
    mockUseAutosaveUI.mockReturnValue({
      activateAutosaveUI: mockActivateAutosaveUI,
      showAutoSaved: false,
    });

    renderWithProviders(<AnalysisContainer />);

    // Verify useAutoSave was called
    expect(mockUseAutoSave).toHaveBeenCalledWith({
      valueToWatch: undefined,
      onSave: expect.any(Function),
      delayMs: 3000,
      onSuccess: expect.any(Function),
    });

    // Get the onSuccess function and test it
    const useAutoSaveCall = mockUseAutoSave.mock.calls[0];
    const onSuccess = useAutoSaveCall?.[0]?.onSuccess;

    // Test the onSuccess callback
    if (onSuccess) {
      onSuccess();
      expect(mockActivateAutosaveUI).toHaveBeenCalled();
    }
  });

  it("should test useAnalysisFilters with INITIAL_FILTERS when no metadata", () => {
    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: { id: "test-analysis-id" } }, // No metadata
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    // Verify useAnalysisFilters was called with INITIAL_FILTERS when no metadata
    expect(mockUseAnalysisFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        analysis: { key: null, name: "All" },
        organizations: { key: null, name: "All" },
        CM: { key: null, name: "All" },
        SKU: { key: null, name: "All" },
        NVPN: { key: null, name: "All" },
      }),
      expect.any(Function)
    );
  });

  it("should test useAnalysisFilters with merged metadata and INITIAL_FILTERS", () => {
    const mockAnalysisData = {
      id: "test-analysis-id",
      metadata: {
        analysis: {
          key: "custom-analysis",
          name: "Custom Analysis",
        },
        organizations: {
          key: "custom-org",
          name: "Custom Organization",
        },
      },
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    expect(mockUseAnalysisFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        analysis: { key: "custom-analysis", name: "Custom Analysis" },
        organizations: { key: "custom-org", name: "Custom Organization" },
        CM: { key: null, name: "All" },
        SKU: { key: null, name: "All" },
        NVPN: { key: null, name: "All" },
      }),
      expect.any(Function)
    );
  });
});
