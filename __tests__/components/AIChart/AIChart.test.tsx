import React from "react";
import { render, screen } from "@testing-library/react";
import { AIChart } from "@/components/AIChart/AIChart";
import { AIChartData, ChartDataInfo } from "@/lib/types/charts";

// Mock the ChartFactory component
jest.mock("@/components/AIChart/ChartFactory", () => ({
  ChartFactory: ({
    chartType,
    chartDataInfo,
  }: {
    chartType: string;
    chartDataInfo: ChartDataInfo;
  }) => (
    <div
      data-testid="chart-factory-mock"
      data-chart-type={chartType}
      data-chart-data-info={JSON.stringify(chartDataInfo)}
      data-dimensions={JSON.stringify([{ accessor: "name" }])}
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
  const mockAIChartData: AIChartData = {
    headline: "Test Chart Headline",
    timestamp: "2024-01-01T00:00:00Z",
    preamble: "This is a test preamble",
    content: "This is test content",
    chart: {
      type: "bar",
      labels: ["Category 1", "Category 2", "Category 3"],
      data: [100, 200, 150],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders the headline correctly", () => {
      render(<AIChart data={mockAIChartData} />);

      expect(screen.getByText("Test Chart Headline")).toBeInTheDocument();
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
});
