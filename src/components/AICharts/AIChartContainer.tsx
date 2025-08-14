import React, { useCallback, useEffect, useMemo } from 'react';
import { useChart, ChartFilters } from '@/hooks/charts';
import { AIChart } from './AIChart';
import { ChartError, ChartSkeleton } from './AIChartSkeleton';

interface AIChartContainerProps {
  chartId: string;
  isFullscreen?: boolean;
  onTitleChange?: (title: string) => void;
}

export const AIChartContainer: React.FC<AIChartContainerProps> = ({
  chartId,
  isFullscreen = false,
  onTitleChange,
}) => {
  const [filters, setFilters] = React.useState<ChartFilters | undefined>(
    undefined
  );
  const { data, isLoading, error, mutate } = useChart(chartId, filters);

  const errorMessage = useMemo(() => {
    if (!error) return undefined;
    return error instanceof Error ? error.message : 'Unknown error occurred';
  }, [error]);

  useEffect(() => {
    if (!onTitleChange) return;
    if (data?.data) {
      onTitleChange(data.data.headline ?? '');
    }
  }, [data?.data?.headline, onTitleChange, data?.data]);

  const handleRetry = useCallback(() => {
    mutate?.();
  }, [mutate]);

  const handleDateRangeChange = useCallback((from: string, to: string) => {
    setFilters((prev) => ({ ...(prev || {}), from, to }));
  }, []);

  const handleRegionChange = useCallback((region: string) => {
    setFilters((prev) => ({ ...(prev || {}), region }));
  }, []);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return <ChartError onRetry={handleRetry} error={errorMessage} />;
  }

  if (data?.data) {
    return (
      <AIChart
        data={data.data}
        chartId={chartId}
        isFullscreen={isFullscreen}
        onDateRangeChange={handleDateRangeChange}
        onRegionChange={handleRegionChange}
        dateRange={
          filters?.from && filters?.to
            ? `${filters.from} - ${filters.to}`
            : undefined
        }
        region={filters?.region}
      />
    );
  }

  return null;
};
