import React, { useMemo } from 'react';
import { BusyIndicator, Text } from '@ui5/webcomponents-react';
import { ChatMessage } from '@/lib/types/chats';
import { parseDate } from '@/lib/utils/dateUtils';
import { FeedbackVote } from '@/components/FeedbackVote/FeedbackVote';
import { AIResponseRenderer } from '@/components/AnalysisChat/AIResponseRenderer';
import type { ChatStreamStepInfo } from '@/hooks/chats/stream';
import BaseDataTable from '@/components/Tables/BaseDataTable';

interface AIResponseBubbleProps {
  message: ChatMessage;
  steps?: ChatStreamStepInfo[];
  isStreaming?: boolean;
}

export function AIResponseBubble({
  message,
  steps = [],
  isStreaming = false,
}: Readonly<AIResponseBubbleProps>) {
  const activeStepText = useMemo(() => {
    if (!steps.length) return null;
    const lastWithStatus = [...steps].reverse().find((s) => s.workflow_status);
    if (!lastWithStatus) return null;
    if (lastWithStatus.workflow_status === 'in_progress')
      return lastWithStatus.step || 'Processing';
    return null;
  }, [steps]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        maxWidth: '100%',
        width: '100%',
        backgroundColor: '#EAF5CF',
        borderRadius: '16px',
        border: '1px solid #D5D7DA',
        padding: '10px 14px',
        color: 'black',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
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
            fontSize: 'var(--sapFontHeader5Size)',
            marginBottom: '4px',
            color: 'var(--sapHighlightColor)',
            fontWeight: '700',
          }}
        >
          {message.title ?? 'AI Response'}
        </Text>
      </div>

      <Text
        style={{
          fontSize: 'var(--sapFontSmallSize)',
          marginBottom: '4px',
        }}
      >
        {parseDate(message.created)}
      </Text>
      {isStreaming && (
        <div style={{ width: '100%', marginBottom: '8px' }}>
          <BusyIndicator
            active
            size="S"
            text={activeStepText || 'Analizando...'}
          />
        </div>
      )}
      {/* Keep the UI minimal during streaming: only show the loader with the active step text */}
      {!isStreaming && message.content && (
        <AIResponseRenderer content={message.content} />
      )}
      {/* Table inline if it comes from the message */}
      {!isStreaming && message.table && (
        <div style={{ width: '100%', marginTop: '1rem' }}>
          <BaseDataTable data={message.table} tableClassName="h-96" />
        </div>
      )}
    </div>
  );
}
