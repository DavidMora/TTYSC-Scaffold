import React from "react";
import { Text } from "@ui5/webcomponents-react";
import { ChatMessage } from "@/lib/types/chats";
import { parseDate } from "@/lib/utils/dateUtils";
import { FeedbackVote } from "@/components/FeedbackVote/FeedbackVote";
import { tableData } from "@/lib/constants/mocks/dataTable";
import BaseDataTable from "@/components/Tables/BaseDataTable";

interface AIResponseBubbleProps {
  message: ChatMessage;
}

export function AIResponseBubble({ message }: Readonly<AIResponseBubbleProps>) {
  // Mocking the table to show 20% of the time
  const shouldShowTable = parseInt(message.id) % 10 < 2;

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
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
        }}
      >
        <FeedbackVote previousVote={message.feedbackVote} />
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
          {message.title}
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

      {shouldShowTable && (
        <div style={{ marginTop: "1rem", width: "100%" }}>
          <BaseDataTable data={tableData} tableClassName="h-96" />
        </div>
      )}
    </div>
  );
}
