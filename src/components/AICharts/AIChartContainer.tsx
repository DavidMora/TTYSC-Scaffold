import React, { useCallback, useMemo } from "react";
import { Title, Button, Icon } from "@ui5/webcomponents-react";
import TitleLevel from "@ui5/webcomponents/dist/types/TitleLevel.js";
import { useChart } from "@/hooks/charts";
import { AIChart } from "./AIChart";

// Constants for skeleton items
const SKELETON_ITEMS = [1, 2, 3];

const ChartSkeleton: React.FC = () => (
  <div
    style={{
      borderRadius: 8,
      padding: 16,
      background: "#fff",
      width: "100%",
      height: 500,
      marginBottom: 16,
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}
  >
    <div
      style={{
        flex: 1,
        background:
          "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "loading 1.5s infinite",
        borderRadius: 4,
      }}
    />
    <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
      {SKELETON_ITEMS.map((item) => (
        <div
          key={item}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#f0f0f0",
            }}
          />
          <div
            style={{
              width: 60,
              height: 12,
              background: "#f0f0f0",
              borderRadius: 2,
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

interface ChartErrorProps {
  onRetry: () => void;
  error?: string;
}

const ChartError: React.FC<ChartErrorProps> = ({ onRetry, error }) => (
  <div
    style={{
      borderRadius: 8,
      padding: 16,
      background: "#fff",
      width: "100%",
      height: 500,
      marginBottom: 16,
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      border: "1px solid #ccc",
    }}
  >
    <Icon
      name="error"
      style={{
        fontSize: 48,
        color: "#666",
      }}
    />
    <Title
      level={TitleLevel.H3}
      style={{
        color: "#333",
        margin: 0,
      }}
    >
      Error loading chart
    </Title>
    {error && (
      <p
        style={{
          color: "#666",
          textAlign: "center",
          margin: 0,
        }}
      >
        {error}
      </p>
    )}
    <Button onClick={onRetry} design="Emphasized" style={{ marginTop: 8 }}>
      Retry
    </Button>
  </div>
);

interface AIChartContainerProps {
  chartId: string;
}

export const AIChartContainer: React.FC<AIChartContainerProps> = ({
  chartId,
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
    return <AIChart data={data.data} />;
  }

  return null;
};
