import React from "react";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "@/components/AnalysisChat/MessageBubble";
import { ChatMessage } from "@/lib/types/chats";

// Mock the AIResponseBubble component
jest.mock("@/components/AnalysisChat/AIResponseBubble", () => ({
  AIResponseBubble: ({ message }: { message: ChatMessage }) => (
    <div data-testid="ai-response-bubble">
      <div>{message.title}</div>
      <div>{message.content}</div>
    </div>
  ),
}));

// Mock date formatting
jest.mock("@/lib/utils/dateUtils", () => ({
  parseDate: (iso: string) => `Formatted(${iso})`,
}));

const user = {
  name: "Daniel Alferez",
  initials: "DA",
};

const baseMessage: ChatMessage = {
  id: "1",
  role: "user",
  content: "This is a test message.",
  created: "2025-07-23T10:00:00.000Z",
  title: "Assistant Title",
};

describe("MessageBubble", () => {
  it("renders user message with avatar and user info", () => {
    render(<MessageBubble message={baseMessage} user={user} />);

    expect(screen.getByTestId("ui5-avatar")).toHaveAttribute("initials", "DA");
    expect(screen.getByText("Daniel Alferez")).toBeInTheDocument();
    expect(
      screen.getByText("Formatted(2025-07-23T10:00:00.000Z)")
    ).toBeInTheDocument();
    expect(screen.getByText("This is a test message.")).toBeInTheDocument();
  });

  it("renders assistant message using AIResponseBubble component", () => {
    const assistantMessage: ChatMessage = {
      ...baseMessage,
      role: "assistant",
    };

    render(<MessageBubble message={assistantMessage} user={user} />);

    expect(screen.getByTestId("ai-response-bubble")).toBeInTheDocument();
    expect(screen.getByText("Assistant Title")).toBeInTheDocument();
    expect(screen.getByText("This is a test message.")).toBeInTheDocument();
  });

  it("does not render user info for assistant messages", () => {
    const assistantMessage: ChatMessage = {
      ...baseMessage,
      role: "assistant",
    };

    render(<MessageBubble message={assistantMessage} user={user} />);

    expect(screen.queryByTestId("ui5-avatar")).not.toBeInTheDocument();
    expect(screen.queryByText("Daniel Alferez")).not.toBeInTheDocument();
  });

  it("should show default user name when user name is not provided", () => {
    render(<MessageBubble message={baseMessage} user={undefined} />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});
