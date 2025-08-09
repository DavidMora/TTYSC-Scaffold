import React from "react";
import { Title } from "@ui5/webcomponents-react";
import TitleLevel from "@ui5/webcomponents/dist/types/TitleLevel.js";
import { AIChartData } from "@/lib/types/charts";
import { getChartDataInfo } from "@/lib/utils/chartUtils";
import { ChartFactory } from "@/components/Charts/ChartFactory";

interface AIChartProps {
  data: AIChartData;
}

export function AIChart({ data }: Readonly<AIChartProps>) {
  const { headline, preamble, content, chart } = data;

  const chartDataInfo = getChartDataInfo(chart);

  return (
    <div>
      <Title level={TitleLevel.H2} style={{ marginBottom: 16 }}>
        {headline}
      </Title>

      {preamble && (
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

      {content && (
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
      />
    </div>
  );
}
