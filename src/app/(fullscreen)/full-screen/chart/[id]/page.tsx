"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AIChartContainer } from "@/components/AICharts/AIChartContainer";

export default function ChartPage() {
  const { id } = useParams();

  return (
    <AIChartContainer
      chartId={id?.toString() || "1"}
      showPreviousText={false}
    />
  );
}
