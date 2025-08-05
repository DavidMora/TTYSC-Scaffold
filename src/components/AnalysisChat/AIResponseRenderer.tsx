import React, { useMemo } from "react";
import { Text } from "@ui5/webcomponents-react";
import { CodeBlock } from "@/components/CodeBlock/CodeBlock";
import BaseDataTable from "@/components/Tables/BaseDataTable";
import { tableData } from "@/lib/constants/mocks/dataTable";
import { parseContent } from "@/lib/utils/aiContentParser";
import { AIChart } from "@/components/AIChart/AIChart";
import { AIChartExamples } from "@/lib/constants/mocks/aiChart";
interface AIResponseRendererProps {
  content: string;
}

const textStyle = {
  fontSize: "var(--sapFontSize)",
  fontWeight: 400,
  whiteSpace: "pre-wrap" as const,
};

export function AIResponseRenderer({
  content,
}: Readonly<AIResponseRendererProps>) {
  const renderedContent = useMemo(() => {
    if (!content) return null;

    const matches = parseContent(content);

    if (matches.length === 0) {
      return <Text style={textStyle}>{content}</Text>;
    }

    const parts: Array<{
      type: "text" | "code" | "table";
      content?: string;
      language?: string;
    }> = [];

    let lastIndex = 0;

    for (const match of matches) {
      // Add text before this match
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }

      // Add the match
      if (match.type === "code") {
        parts.push({
          type: "code",
          content: match.content?.trim() ?? "",
          language: match.language || "text",
        });
      } else if (match.type === "table") {
        parts.push({ type: "table" });
      }

      lastIndex = match.index + (match.matchLength || 0);
    }

    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    // Render parts
    return parts.map((part, idx) => {
      const key = `${part.type}-${idx}-${
        part.content?.slice(0, 20) || "empty"
      }`;

      if (part.type === "code") {
        return (
          <CodeBlock
            key={key}
            code={part.content ?? ""}
            language={part.language}
            showLineNumbers
          />
        );
      }
      if (part.type === "table") {
        return (
          <div key={key} style={{ marginTop: "1rem", width: "100%" }}>
            <BaseDataTable data={tableData} tableClassName="h-96" />
          </div>
        );
      }
      return (
        <Text key={key} style={textStyle}>
          {part.content}
        </Text>
      );
    });
  }, [content]);

  return (
    <div style={{ width: "100%" }}>
      {renderedContent}
      <div style={{ marginTop: "1rem", width: "100%" }}>
        <AIChart data={AIChartExamples.bar} />
        <AIChart data={AIChartExamples.line} />
        <AIChart data={AIChartExamples.area} />
        <AIChart data={AIChartExamples.pie} />
        <AIChart data={AIChartExamples.doughnut} />
        <AIChart data={AIChartExamples.column} />
        <AIChart data={AIChartExamples.bullet} />
        <AIChart data={AIChartExamples.columnWithTrend} />
        <AIChart data={AIChartExamples.composed} />
        <AIChart data={AIChartExamples.radar} />
      </div>
    </div>
  );
}
