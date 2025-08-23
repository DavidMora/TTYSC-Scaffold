import React, { useState } from 'react';
import { Text, Icon } from '@ui5/webcomponents-react';
import { VoteType } from '@/lib/types/chats';
import { useUpdateMessageFeedback } from '@/hooks/chats';
import { useAutosaveUI } from '@/contexts/AutosaveUIProvider';

interface FeedbackVoteProps {
  previousVote?: VoteType;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  messageId: string;
  query?: string;
  answer?: string;
}

export function FeedbackVote({
  previousVote = null,
  disabled = false,
  className,
  style,
  messageId,
  query = '',
  answer = '',
}: Readonly<FeedbackVoteProps>) {
  const { activateAutosaveUI } = useAutosaveUI();
  const [error, setError] = useState<string | null>(null);

  const updateFeedbackMutation = useUpdateMessageFeedback({
    onSuccess: () => {
      activateAutosaveUI();
      setHasVoted(true);
    },
    onError: () => {
      setHasVoted(false);
      setCurrentVote(null);
      setError('Error updating feedback, try again later');
      setTimeout(() => setError(null), 3000);
    },
  });

  const handleVote = (voteType: 'up' | 'down' | null) => {
    if (disabled || hasVoted) return;
    updateFeedbackMutation.mutate({
      messageId,
      feedbackVote: voteType,
      query,
      answer,
    });
    setCurrentVote(voteType);
  };

  const [currentVote, setCurrentVote] = useState<VoteType>(previousVote);
  const [hasVoted, setHasVoted] = useState(previousVote !== null);

  const isUpVoted = currentVote === 'up';
  const isDownVoted = currentVote === 'down';
  const isDisabled = disabled || hasVoted;

  return (
    <div
      data-testid="feedback-vote"
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', marginTop: '2px' }}>
          How would you rate this answer?
        </Text>
        <Icon
          name="thumb-up"
          style={{
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            color: isUpVoted
              ? 'var(--sapHighlightColor)'
              : 'var(--sapButton_Emphasized_Background_Color)',
            opacity: !isUpVoted && isDisabled ? 0.3 : 1,
            transition: 'color 0.2s ease, opacity 0.2s ease',
          }}
          onClick={() => handleVote('up')}
        />
        <Icon
          name="thumb-down"
          style={{
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            color: isDownVoted
              ? 'var(--sapNegativeColor)'
              : 'var(--sapButton_Emphasized_Background_Color)',
            opacity: !isDownVoted && isDisabled ? 0.3 : 1,
            transition: 'color 0.2s ease, opacity 0.2s ease',
          }}
          onClick={() => handleVote('down')}
        />
      </div>
      {error && (
        <Text
          style={{
            color: 'var(--sapNegativeColor)',
            fontSize: 'var(--sapFontSmallSize)',
            opacity: 0.7,
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          {error}
        </Text>
      )}
    </div>
  );
}
