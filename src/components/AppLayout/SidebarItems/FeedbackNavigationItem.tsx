import {
  SideNavigationItem,
  FlexBox,
  FlexBoxDirection,
  Text,
  TextArea,
  Button,
} from "@ui5/webcomponents-react";
import { useState } from "react";
import { createFeedback } from "@/lib/services/feedback.service";

interface FeedbackNavigationItemProps {
  onSubmitFeedback?: (feedback: string) => void;
}

export default function FeedbackNavigationItem({
  onSubmitFeedback,
}: Readonly<FeedbackNavigationItemProps>) {
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (feedbackText.trim()) {
      setIsSubmitting(true);

      createFeedback({
        message: feedbackText,
        category: "general",
      })
        .then(() => {
          setFeedbackText("");
          onSubmitFeedback?.(feedbackText);
        })
        .catch((error) => {
          console.error("Error submitting feedback:", error);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  return (
    <SideNavigationItem text="Feedback" icon="notification-2" unselectable>
      <FlexBox direction={FlexBoxDirection.Column} className="gap-2">
        <Text>Please provide your feedback here</Text>
        <TextArea
          placeholder="Type your feedback..."
          rows={4}
          value={feedbackText}
          onInput={(event) => setFeedbackText(event.target.value)}
          disabled={isSubmitting}
        />
        <FlexBox direction={FlexBoxDirection.Row} className="gap-2">
          <Button
            design="Emphasized"
            onClick={handleSubmit}
            disabled={!feedbackText.trim() || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </FlexBox>
      </FlexBox>
    </SideNavigationItem>
  );
}
