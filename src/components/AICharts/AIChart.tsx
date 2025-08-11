import React from "react";
import { Title } from "@ui5/webcomponents-react";
import TitleLevel from "@ui5/webcomponents/dist/types/TitleLevel.js";
import { AIChartData } from "@/lib/types/charts";
import { getChartDataInfo } from "@/lib/utils/chartUtils";
import { ChartFactory } from "@/components/Charts/ChartFactory";

interface AIChartProps {
  data: AIChartData;
  chartId?: string;
  showPreviousText?: boolean;
}

export function AIChart({ data, chartId, showPreviousText = true }: Readonly<AIChartProps>) {
  const { headline, preamble, content, chart } = data;

  const chartDataInfo = getChartDataInfo(chart);

  return (
    <div>
      {showPreviousText && (
        <Title level={TitleLevel.H2} style={{ marginBottom: 16 }}>
          {headline}
        </Title>
      )}

      {preamble && showPreviousText &&  (
        <p
          style={{
            marginBottom: 12,
            color: "var(--sapTextColor)",
            fontSize: 14,
            lineHeight: "1.4",
          }}
        >
          {preamble}
        </p>
      )}

      {content && showPreviousText && (
        <p
          style={{
            color: "var(--sapTextColor)",
            fontSize: 14,
            lineHeight: "1.4",
          }}
        >
          {content}
        </p>
      )}

      <ChartFactory
        chartType={chart.type}
        chartDataInfo={chartDataInfo}
        title={headline}
        chartIdForFullscreen={chartId}
      />
    </div>
  );
}
