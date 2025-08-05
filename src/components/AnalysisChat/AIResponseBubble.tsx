import React from "react";
import { Text } from "@ui5/webcomponents-react";
import { ChatMessage } from "@/lib/types/chats";
import { parseDate } from "@/lib/utils/dateUtils";
import { FeedbackVote } from "@/components/FeedbackVote/FeedbackVote";
import { tableData } from "@/lib/constants/mocks/dataTable";
import BaseDataTable from "@/components/Tables/BaseDataTable";
import { AIChart } from "../AIChart/AIChart";
import { AIChartExamples } from "@/lib/constants/mocks/aiChart";

interface AIResponseBubbleProps {
  message: ChatMessage;
  showTable?: boolean;
}

export function AIResponseBubble({
  message,
  showTable,
}: Readonly<AIResponseBubbleProps>) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        maxWidth: "100%",
        width: "100%",
        backgroundColor: "#EAF5CF",
        borderRadius: "16px",
        border: "1px solid #D5D7DA",
        padding: "10px 14px",
        color: "black",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
        }}
      >
        <FeedbackVote
          messageId={message.id}
          previousVote={message.feedbackVote}
        />
      </div>

      <div>
        <Text
          style={{
            fontSize: "var(--sapFontHeader5Size)",
            marginBottom: "4px",
            color: "var(--sapHighlightColor)",
            fontWeight: "700",
          }}
        >
          {message.title ?? "AI Response"}
        </Text>
      </div>

      <Text
        style={{
          fontSize: "var(--sapFontSmallSize)",
          marginBottom: "4px",
        }}
      >
        {parseDate(message.created)}
      </Text>

      <Text
        style={{
          fontSize: "var(--sapFontSize)",
          fontWeight: "400",
        }}
      >
        {message.content}
      </Text>

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

      {showTable && (
        <div
          style={{ marginTop: "1rem", width: "100%" }}
          data-testid="base-data-table"
        >
          <BaseDataTable data={tableData} tableClassName="h-96" />
        </div>
      )}
    </div>
  );
}
