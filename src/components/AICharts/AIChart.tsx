import React from 'react';
import { Title } from '@ui5/webcomponents-react';
import TitleLevel from '@ui5/webcomponents/dist/types/TitleLevel.js';
import { AIChartData } from '@/lib/types/charts';
import { getChartDataInfo } from '@/lib/utils/chartUtils';
import { ChartFactory } from '@/components/Charts/ChartFactory';

interface AIChartProps {
  data: AIChartData;
  chartId?: string;
  isFullscreen?: boolean;
  onDateRangeChange?: (from: string, to: string) => void;
  onRegionChange?: (region: string) => void;
  dateRange?: string;
  region?: string;
}

export function AIChart({
  data,
  chartId,
  isFullscreen = false,
  onDateRangeChange,
  onRegionChange,
  dateRange,
  region,
}: Readonly<AIChartProps>) {
  const { headline, preamble, content, chart, label } = data;

  const chartDataInfo = getChartDataInfo(chart);

  return (
    <div>
      {!isFullscreen && (
        <Title level={TitleLevel.H2} style={{ marginBottom: 16 }}>
          {headline}
        </Title>
      )}

      {preamble && !isFullscreen && (
        <p
          style={{
            marginBottom: 12,
            color: 'var(--sapTextColor)',
            fontSize: 14,
            lineHeight: '1.4',
          }}
        >
          {preamble}
        </p>
      )}

      {content && !isFullscreen && (
        <p
          style={{
            color: 'var(--sapTextColor)',
            fontSize: 14,
            lineHeight: '1.4',
          }}
        >
          {content}
        </p>
      )}

      <ChartFactory
        height={isFullscreen ? 800 : 400}
        chartType={chart.type}
        chartDataInfo={chartDataInfo}
        title={label}
        chartIdForFullscreen={isFullscreen ? undefined : chartId}
        onDateRangeChange={onDateRangeChange}
        onRegionChange={onRegionChange}
        dateRange={dateRange}
        region={region}
      />
    </div>
  );
}
