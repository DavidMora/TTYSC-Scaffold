import React from "react";
import { FlexBox, Avatar, Text } from "@ui5/webcomponents-react";
import { ChatMessage } from "@/lib/types/chats";
import { parseDate } from "@/lib/utils/dateUtils";

interface MessageBubbleProps {
  message: ChatMessage;
}

const MOCK_USER = {
  name: "Daniel",
  initials: "DA",
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        margin: "1rem 0 0 0",
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          backgroundColor: isUser
            ? "var(--sapAccentBackgroundColor10)"
            : "#EAF5CF",
          borderRadius: "16px",
          border: "1px solid #D5D7DA",
          padding: "10px 14px",
          color: "black",
          ...(!isUser && {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }),
        }}
      >
        {isUser ? (
          <>
            <FlexBox
              alignItems={"Center"}
              style={{ marginBottom: "7px", gap: "10px" }}
            >
              <Avatar
                initials={MOCK_USER.initials}
                size="XS"
                style={{
                  backgroundColor: "#5B738B80",
                  color: "white",
                  fontSize: "var(--sapFontSize)",
                }}
              />
              <div>
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: "var(--sapFontHeader5Size)",
                    color: "black",
                    display: "block",
                  }}
                >
                  {MOCK_USER.name}
                </Text>
                <Text
                  style={{
                    fontSize: "var(--sapFontSmallSize)",
                    display: "block",
                  }}
                >
                  {parseDate(message.created)}
                </Text>
              </div>
            </FlexBox>
          </>
        ) : (
          <>
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
          </>
        )}

        <Text
          style={{
            fontSize: "var(--sapFontSize)",
            fontWeight: "400",
          }}
        >
          {message.content}
        </Text>
      </div>
    </div>
  );
}
