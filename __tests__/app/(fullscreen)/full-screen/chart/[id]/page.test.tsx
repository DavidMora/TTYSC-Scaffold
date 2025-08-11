import React from "react";
import { render, screen } from "@testing-library/react";
import ChartPage from "@/app/(fullscreen)/full-screen/chart/[id]/page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "xyz" }),
}));

jest.mock("@/components/AICharts/AIChartContainer", () => ({
  AIChartContainer: ({
    chartId,
    isFullscreen,
  }: {
    chartId: string;
    isFullscreen: boolean;
  }) => (
    <div
      data-testid="ai-chart-container"
      data-id={chartId}
      data-full={String(isFullscreen)}
    />
  ),
}));

describe("fullscreen chart page", () => {
  it("renders title area and passes id to AIChartContainer", () => {
    render(<ChartPage />);
    expect(screen.getByText("Here is the full chart")).toBeInTheDocument();
    const c = screen.getByTestId("ai-chart-container");
    expect(c).toHaveAttribute("data-id", "xyz");
    expect(c).toHaveAttribute("data-full", "true");
  });
});
