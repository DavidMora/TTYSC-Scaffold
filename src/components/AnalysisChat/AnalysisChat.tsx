"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChatMessage, CreateChatMessageRequest } from "@/lib/types/chats";
import { useSendChatMessage } from "@/hooks/chats";
import { MessageBubble } from "@/components/AnalysisChat/MessageBubble";
import { ChatInput } from "@/components/AnalysisChat/ChatInput";

interface AnalysisChatProps {
  chatId: string;
  previousMessages: ChatMessage[];
  draft?: string;
}

export default function AnalysisChat({
  chatId,
  previousMessages,
  draft,
}: Readonly<AnalysisChatProps>) {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = ({
    behavior = "smooth",
    immediate = false,
  }: { behavior?: "smooth" | "auto"; immediate?: boolean } = {}) => {
    const scroll = () => {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    };

    if (immediate) {
      scroll();
    } else {
      setTimeout(scroll, 50);
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>(previousMessages);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setMessages(previousMessages);
  }, [previousMessages]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom({ behavior: "auto", immediate: true });
      setIsReady(true);
    }, 10);

    return () => clearTimeout(timeout);
  }, [messages]);

  const addMessage = (
    id: string,
    content: string,
    role: "user" | "assistant",
    title?: string
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id,
        role,
        created: new Date().toLocaleString(),
        title,
        content,
      },
    ]);
  };

  const { mutate, isLoading } = useSendChatMessage({
    onSuccess: (botMsg) => {
      const message = botMsg?.choices?.[0]?.message || {};
      const id = botMsg?.id ?? Date.now().toString();
      const content = message.content ?? "";
      const role = message.role ?? "assistant";
      const title = message.title ?? "";
      addMessage(id, content, role, title);
      scrollToBottom();
    },
    onError: () => {
      addMessage(
        Date.now().toString(),
        "Error: There was an error sending the message.",
        "assistant"
      );
      scrollToBottom({ behavior: "smooth" });
    },
  });

  const handleSendMessage = (input: string) => {
    if (input.trim()) {
      addMessage(Date.now().toString(), input, "user");

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
        opacity: isReady ? 1 : 0,
        transition: "opacity 0.1s ease-in",
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
      <ChatInput
        draft={draft}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}
