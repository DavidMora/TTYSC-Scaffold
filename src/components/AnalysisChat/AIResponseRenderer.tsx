import React, { useMemo } from "react";
import { Text } from "@ui5/webcomponents-react";
import { CodeBlock } from "@/components/CodeBlock/CodeBlock";
import BaseDataTable from "../Tables/BaseDataTable";
import { tableData } from "@/lib/constants/mocks/dataTable";

interface AIResponseRendererProps {
  content: string;
}

const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)\n?```/g;
const showTableRegex = /\[SHOW_TABLE\]/gi;

const textStyle = {
  fontSize: "var(--sapFontSize)",
  fontWeight: 400,
  whiteSpace: "pre-wrap" as const,
};

function parseContent(text: string) {
  const results: Array<{
    type: "text" | "code" | "table";
    content?: string;
    language?: string;
    index: number;
    matchLength?: number;
  }> = [];

  // Find code blocks
  const codeBlocks = text.matchAll(codeBlockRegex);
  for (const match of codeBlocks) {
    results.push({
      type: "code",
      language: match[1] || "",
      content: match[2],
      index: match.index,
      matchLength: match[0].length,
    });
  }

  // Find show table markers
  const showTables = text.matchAll(showTableRegex);
  for (const match of showTables) {
    results.push({
      type: "table",
      index: match.index,
    });
  }

  return results.sort((a, b) => a.index - b.index);
}

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

      let matchLength: number;
      if (match.type === "code") {
        matchLength = match.matchLength || "[SHOW_TABLE]".length;
      } else {
        matchLength = "[SHOW_TABLE]".length;
      }
      lastIndex = match.index + matchLength;
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

  return <div style={{ width: "100%" }}>{renderedContent}</div>;
}
