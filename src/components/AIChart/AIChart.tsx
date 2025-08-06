import React from "react";
import { Title } from "@ui5/webcomponents-react";
import TitleLevel from "@ui5/webcomponents/dist/types/TitleLevel.js";
import { AIChartData } from "@/lib/types/charts";
import { getChartDataInfo } from "@/lib/utils/chartUtils";
import { ChartFactory } from "./ChartFactory";

interface AIChartProps {
  data: AIChartData;
  className?: string;
  style?: React.CSSProperties;
}

export function AIChart({ data, className, style }: Readonly<AIChartProps>) {
  const { headline, preamble, content, chart } = data;

  const chartDataInfo = getChartDataInfo(chart);

  return (
    <div className={className} style={style}>
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

      <div
        style={{
          borderRadius: 8,
          padding: 16,
          background: "#fff",
          width: "100%",
          height: 400,
          marginBottom: 16,
          marginTop: 16,
        }}
      >
        <ChartFactory chartType={chart.type} chartDataInfo={chartDataInfo} />
      </div>
    </div>
  );
}
