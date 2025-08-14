'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChatMessage,
  ChatPromptRequest,
  CreateChatMessageRequest,
} from '@/lib/types/chats';
import { useSendChatMessage } from '@/hooks/chats';
import { MessageBubble } from '@/components/AnalysisChat/MessageBubble';
import { ChatInput } from '@/components/AnalysisChat/ChatInput';
import { useChatStream } from '@/hooks/chats/stream';

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
    behavior = 'smooth',
    immediate = false,
  }: { behavior?: 'smooth' | 'auto'; immediate?: boolean } = {}) => {
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

  const [model, setModel] = useState('supply_chain_workflow');

  const [messages, setMessages] = useState<ChatMessage[]>(previousMessages);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setMessages(previousMessages);
  }, [previousMessages]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom({ behavior: 'auto', immediate: true });
      setIsReady(true);
    }, 10);

    return () => clearTimeout(timeout);
  }, [messages]);

  const addMessage = (
    id: string,
    content: string,
    role: 'user' | 'assistant',
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
      const content = message.content ?? '';
      const role = message.role ?? 'assistant';
      const title = message.title ?? '';
      addMessage(id, content, role, title);
      scrollToBottom();
    },
    onError: () => {
      addMessage(
        Date.now().toString(),
        'Error: There was an error sending the message.',
        'assistant'
      );
      scrollToBottom({ behavior: 'smooth' });
    },
  });

  const {
    start: sendMessage,
    stop,
    reset,
    isStreaming,
    aggregatedContent,
    steps,
    finishReason,
    metadata,
    error,
    chunks,
  } = useChatStream({ stopOnFinish: true });

  const handleSend = useCallback(
    (prompt: string) => {
      if (!prompt.trim()) return;
      // Opcional: reiniciar para un nuevo ciclo
      reset();
      const payload: ChatPromptRequest = {
        messages: [
          {
            role: 'user',
            content: prompt.trim(),
          },
        ],
        model,
        temperature: 0,
        max_tokens: 0,
        top_p: 0,
      };
      sendMessage(payload);
    },
    [model, prompt, reset, sendMessage]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100vh',
        minHeight: 0,
        width: '100%',
        opacity: isReady ? 1 : 0,
        transition: 'opacity 0.1s ease-in',
      }}
    >
      {/* Message area with overflow */}
      <div
        ref={messagesContainerRef}
        style={{ flex: 1, overflow: 'auto', padding: '1rem 1.5rem' }}
      >
        {/* {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))} */}
        <ol className="list-decimal ml-5 space-y-1 text-sm">
          {steps.map((s) => {
            const key = `${s.ts}-${s.step || 'step'}`;
            return (
              <li key={key} className="break-words">
                <span className="font-medium">{s.step || '(step)'}</span>
                {s.workflow_status && (
                  <span className="ml-2 text-xs text-gray-500">
                    [{s.workflow_status}]
                  </span>
                )}
                {s.data && (
                  <details className="mt-1 ml-2">
                    <summary className="cursor-pointer text-xs text-blue-700">
                      data
                    </summary>
                    <pre className="text-xs bg-white border p-2 rounded max-h-48 overflow-auto">
                      {JSON.stringify(s.data, null, 2)}
                    </pre>
                  </details>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Input */}
      <ChatInput
        draft={draft}
        onSendMessage={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
}
