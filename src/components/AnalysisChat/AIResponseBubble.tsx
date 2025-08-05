import React from "react";
import { Text } from "@ui5/webcomponents-react";
import { ChatMessage } from "@/lib/types/chats";
import { parseDate } from "@/lib/utils/dateUtils";
import { FeedbackVote } from "@/components/FeedbackVote/FeedbackVote";
import { AIResponseRenderer } from "@/components/AnalysisChat/AIResponseRenderer";

interface AIResponseBubbleProps {
  message: ChatMessage;
}

export function AIResponseBubble({ message }: Readonly<AIResponseBubbleProps>) {
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
      <AIResponseRenderer content={message.content} />
    </div>
  );
}
