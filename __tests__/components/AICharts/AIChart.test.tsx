import React from "react";
import { render, screen } from "@testing-library/react";
import { AIChart } from "@/components/AICharts/AIChart";
import { AIChartData, ChartDataInfo } from "@/lib/types/charts";

// Mock the ChartFactory component
jest.mock("@/components/Charts/ChartFactory", () => ({
  ChartFactory: ({
    chartType,
    chartDataInfo,
    title,
    chartIdForFullscreen,
  }: {
    chartType: string;
    chartDataInfo: ChartDataInfo;
    title?: string;
    chartIdForFullscreen?: string;
  }) => (
    <div
      data-testid="chart-factory-mock"
      data-chart-type={chartType}
      data-chart-data-info={JSON.stringify(chartDataInfo)}
      data-dimensions={JSON.stringify([{ accessor: "name" }])}
      data-title={title ?? ""}
      data-has-chartidforfullscreen={
        chartIdForFullscreen !== undefined ? "true" : "false"
      }
    >
      Mocked ChartFactory
    </div>
  ),
}));

// Mock the chart utilities
jest.mock("@/lib/utils/chartUtils", () => ({
  getChartDataInfo: jest.fn(() => ({
    isMulti: false,
    dataset: [
      { name: "Category 1", value: 100 },
      { name: "Category 2", value: 200 },
      { name: "Category 3", value: 150 },
    ],
    measures: [
      {
        accessor: "value",
        label: "Value",
        formatter: (v: number) => v.toString(),
        axis: "y",
      },
    ],
  })),
}));

describe("AIChart", () => {
  const baseChart: AIChartData["chart"] = {
    type: "bar",
    labels: ["Category 1", "Category 2", "Category 3"],
    data: [100, 200, 150],
  };

  const mockAIChartData: AIChartData = {
    headline: "Test Chart Headline",
    timestamp: "2024-01-01T00:00:00Z",
    preamble: "This is a test preamble",
    content: "This is test content",
    chart: baseChart,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders the headline correctly", () => {
      render(<AIChart data={mockAIChartData} chartId="cid-1" />);

      expect(screen.getByText("Test Chart Headline")).toBeInTheDocument();

      const chartFactory = screen.getByTestId("chart-factory-mock");
      expect(chartFactory.getAttribute("data-title")).toBe(
        "Test Chart Headline"
      );
      expect(chartFactory.getAttribute("data-has-chartidforfullscreen")).toBe(
        "true"
      );
    });

    it("renders the headline with correct Title level", () => {
      render(<AIChart data={mockAIChartData} />);

      const title = screen.getByText("Test Chart Headline");
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe("H2");
    });

    it("renders preamble when provided", () => {
      render(<AIChart data={mockAIChartData} />);

      expect(screen.getByText("This is a test preamble")).toBeInTheDocument();
    });

    it("renders content when provided", () => {
      render(<AIChart data={mockAIChartData} />);

      expect(screen.getByText("This is test content")).toBeInTheDocument();
    });

    it("does not render preamble/content when missing", () => {
      const dataWithoutText: AIChartData = {
        headline: "Only Headline",
        timestamp: "2024-01-01T00:00:00Z",
        chart: baseChart,
      } as AIChartData;

      render(<AIChart data={dataWithoutText} />);

      expect(screen.queryByText(/test preamble/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/test content/i)).not.toBeInTheDocument();
      // Headline should still be visible in non-fullscreen
      expect(screen.getByText("Only Headline")).toBeInTheDocument();
    });
  });

  describe("Data Processing", () => {
    it("processes chart data correctly", () => {
      const { getChartDataInfo } = jest.requireMock("@/lib/utils/chartUtils");

      render(<AIChart data={mockAIChartData} />);

      expect(getChartDataInfo).toHaveBeenCalledTimes(1);
      expect(getChartDataInfo).toHaveBeenCalledWith(mockAIChartData.chart);
    });

    it("creates dimensions with correct accessor", () => {
      render(<AIChart data={mockAIChartData} />);

      const chartFactory = screen.getByTestId("chart-factory-mock");
      const dimensions = JSON.parse(
        chartFactory.getAttribute("data-dimensions") || "[]"
      );

      expect(dimensions).toHaveLength(1);
      expect(dimensions[0]).toHaveProperty("accessor", "name");
    });
  });

  describe("Fullscreen mode", () => {
    it("hides headline, preamble and content and omits chartIdForFullscreen", () => {
      render(
        <AIChart data={mockAIChartData} chartId="chart-123" isFullscreen />
      );

      expect(screen.queryByText("Test Chart Headline")).not.toBeInTheDocument();
      expect(
        screen.queryByText("This is a test preamble")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("This is test content")
      ).not.toBeInTheDocument();

      const chartFactory = screen.getByTestId("chart-factory-mock");
      expect(chartFactory.getAttribute("data-title")).toBe(
        "Test Chart Headline"
      );
      expect(chartFactory.getAttribute("data-has-chartidforfullscreen")).toBe(
        "false"
      );
    });
  });
});
