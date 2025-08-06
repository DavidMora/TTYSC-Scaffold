import { renderHook, waitFor } from "@testing-library/react";
import { useChart, CHART_KEY } from "@/hooks/charts";
import { dataFetcher } from "@/lib/api";
import { getChart } from "@/lib/services/charts.service";
import { AIChartData } from "@/lib/types/charts";
import { BaseResponse } from "@/lib/types/http/responses";

// Mock the dataFetcher
jest.mock("@/lib/api", () => ({
  dataFetcher: {
    fetchData: jest.fn(),
  },
}));

// Mock the getChart service
jest.mock("@/lib/services/charts.service", () => ({
  getChart: jest.fn(),
}));

const mockDataFetcher = dataFetcher as jest.Mocked<typeof dataFetcher>;
const mockGetChart = getChart as jest.MockedFunction<typeof getChart>;

describe("useChart", () => {
  const mockChartId = "test-chart-id";
  const mockChartData: AIChartData = {
    headline: "Test Chart",
    timestamp: "2024-01-01T00:00:00Z",
    preamble: "Test preamble",
    content: "Test content",
    chart: {
      type: "bar",
      labels: ["A", "B", "C"],
      data: [1, 2, 3],
    },
  };

  const mockResponse: BaseResponse<AIChartData> = {
    success: true,
    data: mockChartData,
    message: "Chart loaded successfully",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("CHART_KEY", () => {
    it("should generate correct chart key", () => {
      const chartId = "test-123";
      const expectedKey = "chart-test-123";
      
      expect(CHART_KEY(chartId)).toBe(expectedKey);
    });
  });

  describe("useChart hook", () => {
    it("should call dataFetcher.fetchData with correct parameters", () => {
      const mockFetchDataReturn = {
        data: mockResponse,
        isLoading: false,
        error: undefined,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockFetchDataReturn);

      const { result } = renderHook(() => useChart(mockChartId));

      expect(mockDataFetcher.fetchData).toHaveBeenCalledWith(
        CHART_KEY(mockChartId),
        expect.any(Function),
        {
          revalidateOnFocus: false,
        }
      );

      expect(result.current).toEqual(mockFetchDataReturn);
    });

    it("should pass getChart function to dataFetcher", () => {
      const mockFetchDataReturn = {
        data: mockResponse,
        isLoading: false,
        error: undefined,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockFetchDataReturn);

      renderHook(() => useChart(mockChartId));

      const fetchDataCall = mockDataFetcher.fetchData.mock.calls[0];
      const fetcherFunction = fetchDataCall[1];

      // Call the fetcher function to verify it calls getChart
      fetcherFunction();

      expect(mockGetChart).toHaveBeenCalledWith(mockChartId);
    });

    it("should return loading state when dataFetcher returns loading", () => {
      const mockFetchDataReturn = {
        data: undefined,
        isLoading: true,
        error: undefined,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockFetchDataReturn);

      const { result } = renderHook(() => useChart(mockChartId));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });

    it("should return error state when dataFetcher returns error", () => {
      const mockError = new Error("Failed to fetch chart");
      const mockFetchDataReturn = {
        data: undefined,
        isLoading: false,
        error: mockError,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockFetchDataReturn);

      const { result } = renderHook(() => useChart(mockChartId));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBe(mockError);
    });

    it("should return data when dataFetcher returns successful response", () => {
      const mockFetchDataReturn = {
        data: mockResponse,
        isLoading: false,
        error: undefined,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockFetchDataReturn);

      const { result } = renderHook(() => useChart(mockChartId));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.error).toBeUndefined();
    });

    it("should call dataFetcher with correct options", () => {
      const mockFetchDataReturn = {
        data: mockResponse,
        isLoading: false,
        error: undefined,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockFetchDataReturn);

      renderHook(() => useChart(mockChartId));

      const fetchDataCall = mockDataFetcher.fetchData.mock.calls[0];
      const options = fetchDataCall[2];

      expect(options).toEqual({
        revalidateOnFocus: false,
      });
    });

    it("should handle different chart IDs correctly", () => {
      const chartId1 = "chart-1";
      const chartId2 = "chart-2";

      const mockFetchDataReturn = {
        data: mockResponse,
        isLoading: false,
        error: undefined,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockFetchDataReturn);

      renderHook(() => useChart(chartId1));
      renderHook(() => useChart(chartId2));

      expect(mockDataFetcher.fetchData).toHaveBeenCalledTimes(2);
      expect(mockDataFetcher.fetchData).toHaveBeenCalledWith(
        CHART_KEY(chartId1),
        expect.any(Function),
        expect.any(Object)
      );
      expect(mockDataFetcher.fetchData).toHaveBeenCalledWith(
        CHART_KEY(chartId2),
        expect.any(Function),
        expect.any(Object)
      );
    });
  });
}); 