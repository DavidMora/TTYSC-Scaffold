import React, { useState } from "react";
import {
  TextArea,
  Button,
  Ui5CustomEvent,
  TextAreaDomRef,
} from "@ui5/webcomponents-react";
import { useAutosaveUI } from "@/contexts/AutosaveUIProvider";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useUpdateChat } from "@/hooks/chats";
import { useParams } from "next/navigation";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  draft?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  draft,
}: Readonly<ChatInputProps>) {
  const [input, setInput] = useState(draft || "");
  const { id } = useParams();

  const { activateAutosaveUI } = useAutosaveUI();

  const { mutate: updateChat } = useUpdateChat({});

  useAutoSave({
    valueToWatch: input,
    onSave: async () => {
      await updateChat({
        id: id as string,
        draft: input,
      });
    },
    onSuccess: () => {
      activateAutosaveUI();
    },
    onError: (error) => {
      console.error("Autosave failed:", error);
    },
  });

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
          className="analysis-chat-input"
          placeholder="Write your lines here"
          aria-label="Chat message input"
          style={{ width: "100%" }}
          value={input}
          rows={3}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={isLoading}
        />
        <Button
          icon="paper-plane"
          style={{
            position: "absolute",
            right: "5px",
            top: "5px",
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
