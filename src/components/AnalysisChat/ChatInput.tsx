import React, { useState } from "react";
import {
  TextArea,
  Button,
  Ui5CustomEvent,
  TextAreaDomRef,
} from "@ui5/webcomponents-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({
  onSendMessage,
  isLoading,
}: Readonly<ChatInputProps>) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  const handleInput = (event: Ui5CustomEvent<TextAreaDomRef>) => {
    setInput(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
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
          aria-label="Chat message input"
          style={{ width: "100%", paddingRight: "0.5rem" }}
          value={input}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={isLoading}
        />
        <Button
          icon="paper-plane"
          style={{
            width: "32px",
            height: "26px",
            color: "var(--sapButton_Emphasized_TextColor)",
            background: "var(--sapButton_Emphasized_Background_Color)",
          }}
          onClick={handleSend}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
