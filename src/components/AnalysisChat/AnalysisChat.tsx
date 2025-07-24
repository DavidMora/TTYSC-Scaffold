"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChatMessage, CreateChatMessageRequest } from "@/lib/types/chats";
import { useSendChatMessage } from "@/hooks/chats";
import { MessageBubble } from "@/components/AnalysisChat/MessageBubble";
import { ChatInput } from "@/components/AnalysisChat/ChatInput";

interface AnalysisChatProps {
  chatId: string;
  previousMessages: ChatMessage[];
}

export default function AnalysisChat({
  chatId,
  previousMessages,
}: AnalysisChatProps) {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (previousMessages.length > 0) {
      setMessages(previousMessages);
    }
  }, [previousMessages]);

  const addMessage = (
    content: string,
    role: "user" | "assistant",
    title?: string
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role,
        created: new Date().toLocaleString(),
        title,
        content,
      },
    ]);
  };

  const { mutate, isLoading } = useSendChatMessage({
    onSuccess: (botMsg) => {
      const content = botMsg?.choices?.[0]?.message?.content || "";
      const role = botMsg?.choices?.[0]?.message?.role || "assistant";
      const title = botMsg?.choices?.[0]?.message?.title || "";
      addMessage(content, role, title);
      scrollToBottom();
    },
    onError: () => {
      addMessage("Error: There was an error sending the message.", "assistant");
      scrollToBottom();
    },
  });

  const handleSendMessage = (input: string) => {
    if (input.trim()) {
      addMessage(input, "user");

      const conversationHistory: CreateChatMessageRequest["messages"] = [
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: input },
      ];

      mutate({
        messages: conversationHistory,
        use_knowledge_base: true,
        chatId: chatId,
      });

      scrollToBottom();
    }
  };

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
      <div
        ref={messagesContainerRef}
        style={{ flex: 1, overflow: "auto", padding: "1rem 1.5rem" }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
