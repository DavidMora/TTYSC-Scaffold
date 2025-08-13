"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { AIChartContainer } from "@/components/AICharts/AIChartContainer";
import { FlexBox, Text, Title } from "@ui5/webcomponents-react";

export default function ChartPage() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");

  if (!id) {
    return (
      <FlexBox direction="Column" className="p-4">
        <Title level="H2">Error</Title>
        <Text>Chart ID not found</Text>
      </FlexBox>
    );
  }

  return (
    <>
      <FlexBox
        direction="Column"
        className="pb-4 border-b-2 border-gray-300 mb-6 sticky top-0 z-10"
      >
        <Title level="H2">{title}</Title>
        <Text>Here is the full chart</Text>
      </FlexBox>
      <AIChartContainer chartId={id} isFullscreen onTitleChange={setTitle} />
    </>
  );
}
