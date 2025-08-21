'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessage, ChatPromptRequest } from '@/lib/types/chats';
import { useSendChatMessage } from '@/hooks/chats';
import { BusyIndicator } from '@ui5/webcomponents-react';
import { MessageBubble } from '@/components/AnalysisChat/MessageBubble';
import { ChatInput } from '@/components/AnalysisChat/ChatInput';
import { useChatStream } from '@/hooks/chats/stream';
import { metadataToAIChartData } from '@/lib/metadata/chart';
import { metadataToTableData } from '@/lib/metadata/table';

interface AnalysisChatProps {
  previousMessages: ChatMessage[];
  draft?: string;
}

export default function AnalysisChat({
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

  const [model] = useState('supply_chain_workflow');

  const [messages, setMessages] = useState<ChatMessage[]>(previousMessages);
  const [isReady, setIsReady] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [runId, setRunId] = useState<number | null>(null);
  const [appendedRunId, setAppendedRunId] = useState<number | null>(null);

  // Initialize messages only once from props; do not overwrite user/appended messages
  useEffect(() => {
    setMessages((prev) => (prev.length ? prev : previousMessages));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const { isLoading } = useSendChatMessage({
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
    reset,
    isStreaming,
    steps,
    aggregatedContent,
    finishReason,
    metadata,
  } = useChatStream({ stopOnFinish: true });

  const handleSend = useCallback(
    (prompt: string) => {
      if (!prompt.trim()) return;
      setShowLoader(true);
      const thisRunId = Date.now();
      setRunId(thisRunId);
      setAppendedRunId(null);
      reset();
      // Append the user message immediately so it persists in the chat
      const userMessageId = `${Date.now()}-user`;
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId,
          role: 'user',
          created: new Date().toLocaleString(),
          title: 'You',
          content: prompt.trim(),
        },
      ]);
      setTimeout(() => {
        scrollToBottom({ behavior: 'auto', immediate: true });
      }, 0);

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
    [model, reset, sendMessage]
  );

  // When stream finishes, append the final assistant message to persist in chat
  useEffect(() => {
    if (!isStreaming) {
      const inlineTable = metadataToTableData(metadata);
      const inlineChart = metadataToAIChartData(metadata);
      const finalContent = aggregatedContent;
      if (runId && appendedRunId !== runId && (finalContent || inlineTable)) {
        const assistantMessageId = `${Date.now()}-assistant`;
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            created: new Date().toLocaleString(),
            title: 'AI Response',
            content: finalContent,
            chart: inlineChart || undefined,
            table: inlineTable || undefined,
          },
        ]);
        setAppendedRunId(runId);
      }
      setShowLoader(false);
    }
  }, [
    isStreaming,
    finishReason,
    aggregatedContent,
    metadata,
    runId,
    appendedRunId,
  ]);

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
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {(isStreaming || showLoader) && (
          <div
            style={{
              width: '100%',
              padding: '8px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '6px',
              color: 'black',
            }}
          >
            <span style={{ fontSize: 'var(--sapFontSize)' }}>
              {(() => {
                const last = [...steps]
                  .reverse()
                  .find((s) => s.workflow_status);
                if (!last) return 'Running...';
                if (last.workflow_status === 'in_progress')
                  return last.step || 'Running...';
                if (last.workflow_status === 'started') return 'Running...';
                return 'Running...';
              })()}
            </span>
            <BusyIndicator active size="M" />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        draft={draft}
        onSendMessage={handleSend}
        isLoading={isLoading || isStreaming || showLoader}
      />
    </div>
  );
}
