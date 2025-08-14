import React from 'react';
import { FlexBox, Avatar, Text } from '@ui5/webcomponents-react';
import { ChatMessage } from '@/lib/types/chats';
import { parseDate } from '@/lib/utils/dateUtils';
import { AIResponseBubble } from '@/components/AnalysisChat/AIResponseBubble';
import type { ChatStreamStepInfo } from '@/hooks/chats/stream';

interface MessageBubbleProps {
  message: ChatMessage;
  user?: {
    name: string;
    initials: string;
  };
  steps?: ChatStreamStepInfo[];
  isStreaming?: boolean;
}

export function MessageBubble({
  message,
  user = { name: 'Unknown', initials: 'U' },
  steps = [],
  isStreaming = false,
}: Readonly<MessageBubbleProps>) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        margin: '1rem 0 0 0',
      }}
    >
      {isUser ? (
        <div
          style={{
            maxWidth: '70%',
            width: 'auto',
            backgroundColor: 'var(--sapAccentBackgroundColor10)',
            borderRadius: '16px',
            border: '1px solid #D5D7DA',
            padding: '10px 14px',
            color: 'black',
            position: 'relative',
          }}
        >
          <FlexBox
            alignItems={'Center'}
            style={{ marginBottom: '7px', gap: '10px' }}
          >
            <Avatar
              initials={user.initials}
              size="XS"
              style={{
                backgroundColor: '#5B738B80',
                color: 'white',
                fontSize: 'var(--sapFontSize)',
              }}
            />
            <div>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 'var(--sapFontHeader5Size)',
                  color: 'black',
                  display: 'block',
                }}
              >
                {user.name}
              </Text>
              <Text
                style={{
                  fontSize: 'var(--sapFontSmallSize)',
                  display: 'block',
                }}
              >
                {parseDate(message.created)}
              </Text>
            </div>
          </FlexBox>

          <Text
            style={{
              fontSize: 'var(--sapFontSize)',
              fontWeight: '400',
            }}
          >
            {message.content}
          </Text>
        </div>
      ) : (
        <AIResponseBubble message={message} steps={steps} isStreaming={isStreaming} />
      )}
    </div>
  );
}
