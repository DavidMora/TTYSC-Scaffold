import { getChart } from "@/lib/services/charts.service";
import { apiClient } from "@/lib/api";
import { AUXILIARY_CHART } from "@/lib/constants/api/routes";
import { AIChartData } from "@/lib/types/charts";
import { BaseResponse } from "@/lib/types/http/responses";
import { HttpClientResponse } from "@/lib/types/api/http-client";

// Mock the apiClient
jest.mock("@/lib/api", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

// Mock the routes
jest.mock("@/lib/constants/api/routes", () => ({
  AUXILIARY_CHART: jest.fn(),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockAUXILIARY_CHART = AUXILIARY_CHART as jest.MockedFunction<
  typeof AUXILIARY_CHART
>;

describe("charts.service", () => {
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

  const mockResponse: HttpClientResponse<BaseResponse<AIChartData>> = {
    data: {
      success: true,
      data: mockChartData,
      message: "Chart loaded successfully",
    },
    status: 200,
    statusText: "OK",
    headers: {},
    ok: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getChart", () => {
    it("should call apiClient.get with correct parameters", async () => {
      const mockUrl = "/api/charts/test-chart-id";
      mockAUXILIARY_CHART.mockReturnValue(mockUrl);
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await getChart(mockChartId);

      expect(mockAUXILIARY_CHART).toHaveBeenCalledWith(mockChartId);
      expect(mockApiClient.get).toHaveBeenCalledWith<[string]>(mockUrl);
      expect(result).toEqual(mockResponse);
    });

    it("should handle successful response", async () => {
      const mockUrl = "/api/charts/test-chart-id";
      mockAUXILIARY_CHART.mockReturnValue(mockUrl);
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await getChart(mockChartId);

      expect(result.data.success).toBe(true);
      expect(result.data.data).toEqual(mockChartData);
      expect(result.data.message).toBe("Chart loaded successfully");
    });

    it("should handle error response", async () => {
      const mockUrl = "/api/charts/test-chart-id";
      const errorResponse: HttpClientResponse<BaseResponse<AIChartData>> = {
        data: {
          success: false,
          data: mockChartData,
          message: "Chart not found",
        },
        status: 404,
        statusText: "Not Found",
        headers: {},
        ok: false,
      };

      mockAUXILIARY_CHART.mockReturnValue(mockUrl);
      mockApiClient.get.mockResolvedValue(errorResponse);

      const result = await getChart(mockChartId);

      expect(result.data.success).toBe(false);
      expect(result.data.message).toBe("Chart not found");
    });

    it("should handle different chart IDs", async () => {
      const chartId1 = "chart-1";
      const chartId2 = "chart-2";
      const mockUrl1 = "/api/charts/chart-1";
      const mockUrl2 = "/api/charts/chart-2";

      mockAUXILIARY_CHART
        .mockReturnValueOnce(mockUrl1)
        .mockReturnValueOnce(mockUrl2);
      mockApiClient.get.mockResolvedValue(mockResponse);

      await getChart(chartId1);
      await getChart(chartId2);

      expect(mockAUXILIARY_CHART).toHaveBeenCalledWith(chartId1);
      expect(mockAUXILIARY_CHART).toHaveBeenCalledWith(chartId2);
      expect(mockApiClient.get).toHaveBeenCalledWith(mockUrl1);
      expect(mockApiClient.get).toHaveBeenCalledWith(mockUrl2);
    });

    it("should handle API errors", async () => {
      const mockUrl = "/api/charts/test-chart-id";
      const mockError = new Error("Network error");

      mockAUXILIARY_CHART.mockReturnValue(mockUrl);
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(getChart(mockChartId)).rejects.toThrow("Network error");
    });

    it("should handle empty chart data", async () => {
      const mockUrl = "/api/charts/test-chart-id";
      const emptyResponse: HttpClientResponse<BaseResponse<AIChartData>> = {
        data: {
          success: true,
          data: {
            headline: "",
            timestamp: "",
            chart: {
              type: "bar",
              labels: [],
              data: [],
            },
          },
        },
        status: 200,
        statusText: "OK",
        headers: {},
        ok: true,
      };

      mockAUXILIARY_CHART.mockReturnValue(mockUrl);
      mockApiClient.get.mockResolvedValue(emptyResponse);

      const result = await getChart(mockChartId);

      expect(result.data.success).toBe(true);
      expect(result.data.data.headline).toBe("");
      expect(result.data.data.chart.labels).toEqual([]);
      expect(result.data.data.chart.data).toEqual([]);
    });

    it("should handle chart data with optional fields", async () => {
      const mockUrl = "/api/charts/test-chart-id";
      const chartDataWithoutOptional: AIChartData = {
        headline: "Test Chart",
        timestamp: "2024-01-01T00:00:00Z",
        chart: {
          type: "line",
          labels: ["X", "Y"],
          data: [10, 20],
        },
      };

      const responseWithoutOptional: HttpClientResponse<
        BaseResponse<AIChartData>
      > = {
        data: {
          success: true,
          data: chartDataWithoutOptional,
        },
        status: 200,
        statusText: "OK",
        headers: {},
        ok: true,
      };

      mockAUXILIARY_CHART.mockReturnValue(mockUrl);
      mockApiClient.get.mockResolvedValue(responseWithoutOptional);

      const result = await getChart(mockChartId);

      expect(result.data.success).toBe(true);
      expect(result.data.data.preamble).toBeUndefined();
      expect(result.data.data.content).toBeUndefined();
      expect(result.data.data.chart.type).toBe("line");
    });

    it("should handle different chart types", async () => {
      const mockUrl = "/api/charts/test-chart-id";
      const chartTypes = [
        "bar",
        "line",
        "pie",
        "doughnut",
        "area",
        "column",
        "bullet",
        "columnWithTrend",
        "composed",
        "radar",
      ] as const;

      for (const chartType of chartTypes) {
        const chartData: AIChartData = {
          headline: `Test ${chartType} Chart`,
          timestamp: "2024-01-01T00:00:00Z",
          chart: {
            type: chartType,
            labels: ["A", "B"],
            data: [1, 2],
          },
        };

        const response: HttpClientResponse<BaseResponse<AIChartData>> = {
          data: {
            success: true,
            data: chartData,
          },
          status: 200,
          statusText: "OK",
          headers: {},
          ok: true,
        };

        mockAUXILIARY_CHART.mockReturnValue(mockUrl);
        mockApiClient.get.mockResolvedValue(response);

        const result = await getChart(mockChartId);

        expect(result.data.data.chart.type).toBe(chartType);
      }
    });

    it("appends query params when filters are provided (from, to, region)", async () => {
      const mockUrl = "/api/charts/test-chart-id";
      mockAUXILIARY_CHART.mockReturnValue(mockUrl);
      mockApiClient.get.mockResolvedValue(mockResponse);

      await getChart(mockChartId, {
        from: "2024-01-01",
        to: "2024-01-31",
        region: "north",
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `${mockUrl}?from=2024-01-01&to=2024-01-31&region=north`
      );
    });

    it("includes only provided filter params and preserves order", async () => {
      const baseUrl = "/api/charts/test-chart-id";
      mockAUXILIARY_CHART.mockReturnValue(baseUrl);
      mockApiClient.get.mockResolvedValue(mockResponse);

      // Only from
      await getChart(mockChartId, { from: "2024-02-01" });
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `${baseUrl}?from=2024-02-01`
      );

      // Only to
      await getChart(mockChartId, { to: "2024-02-28" });
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `${baseUrl}?to=2024-02-28`
      );

      // Only region
      await getChart(mockChartId, { region: "south" });
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `${baseUrl}?region=south`
      );
    });

    it("does not append a '?' when filters object is empty", async () => {
      const baseUrl = "/api/charts/test-chart-id";
      mockAUXILIARY_CHART.mockReturnValue(baseUrl);
      mockApiClient.get.mockResolvedValue(mockResponse);

      await getChart(mockChartId, {});

      expect(mockApiClient.get).toHaveBeenCalledWith(baseUrl);
    });
  });
});
