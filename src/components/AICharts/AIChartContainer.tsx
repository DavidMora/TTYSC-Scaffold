import React, { useCallback, useMemo } from "react";
import { useChart } from "@/hooks/charts";
import { AIChart } from "./AIChart";
import { ChartError, ChartSkeleton } from "./AIChartSkeleton";
import { FlexBox, Text, Title } from "@ui5/webcomponents-react";

interface AIChartContainerProps {
  chartId: string;
  isFullscreen?: boolean;
}

export const AIChartContainer: React.FC<AIChartContainerProps> = ({
  chartId,
  isFullscreen = false,
}) => {
  const { data, isLoading, error, mutate } = useChart(chartId);

  const errorMessage = useMemo(() => {
    if (!error) return undefined;
    return error instanceof Error ? error.message : "Unknown error occurred";
  }, [error]);

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
      <>
        {isFullscreen && (
          <FlexBox
            direction="Column"
            className="pb-4 border-b-2 border-gray-300 mb-6 sticky top-0 z-10"
          >
            <Title level="H2">{"Chart"}</Title>
            <Text>Here is the full chart</Text>
          </FlexBox>
        )}
        <AIChart
          data={data.data}
          chartId={chartId}
          isFullscreen={isFullscreen}
        />
      </>
    );
  }

  return null;
};
