import React, { useCallback, useEffect, useMemo } from "react";
import { useChart } from "@/hooks/charts";
import { AIChart } from "./AIChart";
import { ChartError, ChartSkeleton } from "./AIChartSkeleton";

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
  const { data, isLoading, error, mutate } = useChart(chartId);

  const errorMessage = useMemo(() => {
    if (!error) return undefined;
    return error instanceof Error ? error.message : "Unknown error occurred";
  }, [error]);

  useEffect(() => {
    if (!onTitleChange) return;
    if (data?.data) {
      onTitleChange(data.data.headline ?? "");
    }
  }, [data?.data?.headline, onTitleChange, data?.data]);

  const handleRetry = useCallback(() => {
    mutate?.();
  }, [mutate]);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return <ChartError onRetry={handleRetry} error={errorMessage} />;
  }

  if (data?.data) {
    return (
      <AIChart data={data.data} chartId={chartId} isFullscreen={isFullscreen} />
    );
  }

  return null;
};
