import React, { useState } from "react";
import { Text, Icon } from "@ui5/webcomponents-react";
import { VoteType } from "@/lib/types/chats";

interface FeedbackVoteProps {
  onVote?: (voteType: VoteType) => void;
  previousVote?: VoteType;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function FeedbackVote({
  onVote,
  previousVote = null,
  disabled = false,
  className,
  style,
}: Readonly<FeedbackVoteProps>) {
  const [currentVote, setCurrentVote] = useState<VoteType>(previousVote);
  const [hasVoted, setHasVoted] = useState(previousVote !== null);

  const handleVote = (voteType: VoteType) => {
    if (disabled || hasVoted) return;

    setCurrentVote(voteType);
    setHasVoted(true);
    onVote?.(voteType);
  };

  const isUpVoted = currentVote === "up";
  const isDownVoted = currentVote === "down";
  const isDisabled = disabled || hasVoted;

  return (
    <div
      data-testid="feedback-vote"
      className={className}
      style={{
        display: "flex",
        gap: "6px",
        alignItems: "center",
        ...style,
      }}
    >
      <Text style={{ fontSize: "var(--sapFontSmallSize)", marginTop: "2px" }}>
        How would you rate this answer?
      </Text>
      <Icon
        name="thumb-up"
        style={{
          cursor: isDisabled ? "not-allowed" : "pointer",
          color: isUpVoted
            ? "var(--sapHighlightColor)"
            : "var(--sapButton_Emphasized_Background_Color)",
          opacity: isDisabled ? 0.6 : 1,
          transition: "color 0.2s ease, opacity 0.2s ease",
        }}
        onClick={() => handleVote("up")}
      />
      <Icon
        name="thumb-down"
        style={{
          cursor: isDisabled ? "not-allowed" : "pointer",
          color: isDownVoted
            ? "var(--sapNegativeColor)"
            : "var(--sapButton_Emphasized_Background_Color)",
          opacity: isDisabled ? 0.6 : 1,
          transition: "color 0.2s ease, opacity 0.2s ease",
        }}
        onClick={() => handleVote("down")}
      />
    </div>
  );
}
