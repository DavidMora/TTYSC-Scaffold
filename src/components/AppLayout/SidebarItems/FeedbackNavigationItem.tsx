import {
  SideNavigationItem,
  FlexBox,
  FlexBoxDirection,
  Text,
  TextArea,
  Button,
} from "@ui5/webcomponents-react";
import { useState } from "react";

interface FeedbackNavigationItemProps {
  onSubmitFeedback?: (feedback: string) => void;
}

export default function FeedbackNavigationItem({
  onSubmitFeedback,
}: Readonly<FeedbackNavigationItemProps>) {
  const [feedbackText, setFeedbackText] = useState("");

  const handleSubmit = () => {
    if (feedbackText.trim()) {
      onSubmitFeedback?.(feedbackText);
      setFeedbackText(""); // Clear after submission
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
        />
        <FlexBox direction={FlexBoxDirection.Row} className="gap-2">
          <Button
            design="Emphasized"
            onClick={handleSubmit}
            disabled={!feedbackText.trim()}
          >
            Submit
          </Button>
        </FlexBox>
      </FlexBox>
    </SideNavigationItem>
  );
}
