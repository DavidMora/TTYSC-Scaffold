"use client";

import {
  TextArea,
  Button,
  FlexBox,
  Avatar,
  Text,
} from "@ui5/webcomponents-react";

export default function AnalysisChat() {
  const messages = [
    {
      id: 1,
      type: "user",
      initials: "DA",
      sender: "Daniel",
      timestamp: "7/22/2024, 14:56",
      content: "This is a sample user message to show the format.",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxHeight: "100vh",
        minHeight: 0,
        width: "100%",
      }}
    >
      {/* Message area with overflow */}
      <div style={{ flex: 1, overflow: "auto", padding: "1rem 0" }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              margin: "1rem 0 0 0",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                backgroundColor: "var(--sapAccentBackgroundColor10)",
                borderRadius: "16px",
                border: "1px solid #D5D7DA",
                padding: "10px 14px",
                color: "black",
              }}
            >
              <FlexBox
                alignItems={"Center"}
                style={{ marginBottom: "7px", gap: "10px" }}
              >
                <Avatar
                  initials={msg.initials}
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
                    {msg.sender}
                  </Text>
                  <Text
                    style={{
                      fontSize: "var(--sapFontSmallSize)",
                      display: "block",
                    }}
                  >
                    {msg.timestamp}
                  </Text>
                </div>
              </FlexBox>
              <Text
                style={{
                  fontSize: "var(--sapFontSize)",
                  fontWeight: "400",
                }}
              >
                {msg.content}
              </Text>
            </div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div
        style={{
          width: "100%",
          background: "white",
          zIndex: 10,
          padding: "0.5rem 0",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "98%",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
          }}
        >
          <TextArea
            placeholder="Write your lines here"
            style={{
              width: "100%",
              paddingRight: "0.5rem",
            }}
          />
          <Button
            icon="paper-plane"
            style={{
              width: "32px",
              height: "26px",
              color: "var(--sapButton_Emphasized_TextColor)",
              background: "var(--sapButton_Emphasized_Background_Color)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
