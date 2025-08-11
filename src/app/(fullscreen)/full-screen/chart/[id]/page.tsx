"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AIChartContainer } from "@/components/AICharts/AIChartContainer";

export default function ChartPage() {
  const { id } = useParams() as { id: string };

  return <AIChartContainer chartId={id} isFullscreen />;
}
