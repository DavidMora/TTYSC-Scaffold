import { renderHook } from "@testing-library/react";
import { useAnalysis, useCreateAnalysis, useRenameAnalysis, ANALYSIS_KEY } from "@/hooks/useAnalysis";
import { dataFetcher } from "@/lib/api";
import * as analysisService from "@/lib/services/analysisService";
import { useMutation } from "@/hooks/useMutation";

jest.mock("@/lib/api");
jest.mock("@/lib/services/analysisService");
jest.mock("@/hooks/useMutation");

const mockDataFetcher = dataFetcher as jest.Mocked<typeof dataFetcher>;
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;
const mockAnalysisService = analysisService as jest.Mocked<typeof analysisService>;

describe("useAnalysis hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      data: undefined,
      error: null,
      isLoading: false,
      reset: jest.fn(),
    });
  });

  it("should fetch analysis by id", () => {
    mockDataFetcher.fetchData.mockReturnValue({ data: undefined, error: undefined, isLoading: false });
    renderHook(() => useAnalysis("test-id"));
    
    expect(mockDataFetcher.fetchData).toHaveBeenCalledWith(ANALYSIS_KEY, expect.any(Function));
    mockDataFetcher.fetchData.mock.calls[0][1]();
    expect(mockAnalysisService.getAnalysisById).toHaveBeenCalledWith("test-id");
  });

  it("should create analysis", () => {
    renderHook(() => useCreateAnalysis({}));
    expect(mockUseMutation).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ invalidateQueries: [] }));
    
    mockUseMutation.mock.calls[0][0](undefined);
    expect(mockAnalysisService.createAnalysis).toHaveBeenCalled();
  });

  it("should rename analysis", () => {
    renderHook(() => useRenameAnalysis({}));
    expect(mockUseMutation).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ invalidateQueries: [] }));
    
    const mutationData = { id: "test-id", data: { name: "New Name" } };
    mockUseMutation.mock.calls[0][0](mutationData);
    expect(mockAnalysisService.renameAnalysis).toHaveBeenCalledWith("test-id", { name: "New Name" });
  });

  it("should handle callbacks for create and rename", () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();

    renderHook(() => useCreateAnalysis({ onSuccess, onError }));
    const createOptions = mockUseMutation.mock.calls[0][1];
    createOptions?.onSuccess?.({ data: { analysis: { id: "1" } } });
    createOptions?.onError?.(new Error("test"));
    expect(onSuccess).toHaveBeenCalledWith({ id: "1" });
    expect(onError).toHaveBeenCalledWith(new Error("test"));

    jest.clearAllMocks();
    renderHook(() => useRenameAnalysis({ onSuccess, onError }));
    const renameOptions = mockUseMutation.mock.calls[0][1];
    renameOptions?.onSuccess?.({ data: { analysis: { id: "1", name: "Renamed" } } });
    renameOptions?.onError?.(new Error("rename error"));
    expect(onSuccess).toHaveBeenCalledWith({ id: "1", name: "Renamed" });
    expect(onError).toHaveBeenCalledWith(new Error("rename error"));
  });
});
