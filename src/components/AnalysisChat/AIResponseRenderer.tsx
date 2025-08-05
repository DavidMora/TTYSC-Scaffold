import React, { useMemo } from "react";
import { Text } from "@ui5/webcomponents-react";
import { CodeBlock } from "@/components/CodeBlock/CodeBlock";
import BaseDataTable from "../Tables/BaseDataTable";
import { tableData } from "@/lib/constants/mocks/dataTable";

interface AIResponseRendererProps {
  content: string;
}

const BLOCK_REGEX = /```(?:(\w+)\n?)?((?:[^`]|`(?!``))*?)```|\[SHOW_TABLE\]/gi;

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

    let lastIndex = 0;
    const parts = [];

    for (const match of content.matchAll(BLOCK_REGEX)) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }
      if (match[0].startsWith("```")) {
        parts.push({
          type: "code",
          content: match[2]?.trim() ?? "",
          language: match[1] || "text",
        });
      } else if (match[0].toUpperCase() === "[SHOW_TABLE]") {
        parts.push({ type: "table" });
      }
      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    // If no matches, just render as text
    if (parts.length === 0) {
      return <Text style={textStyle}>{content}</Text>;
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

  return <div style={{ width: "100%" }}>{renderedContent}</div>;
}
