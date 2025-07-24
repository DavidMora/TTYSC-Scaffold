import React from "react";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "@/components/AnalysisChat/MessageBubble"; // Ajusta ruta si cambia
import { ChatMessage } from "@/lib/types/chats";

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

    expect(screen.queryByText("Assistant Title")).not.toBeInTheDocument();
  });

  it("renders assistant message with title and timestamp only", () => {
    const assistantMessage: ChatMessage = {
      ...baseMessage,
      role: "assistant",
    };

    render(<MessageBubble message={assistantMessage} user={user} />);

    expect(screen.getByText("Assistant Title")).toBeInTheDocument();

    expect(
      screen.getByText("Formatted(2025-07-23T10:00:00.000Z)")
    ).toBeInTheDocument();

    expect(screen.getByText("This is a test message.")).toBeInTheDocument();

    expect(screen.queryByTestId("ui5-avatar")).not.toBeInTheDocument();
    expect(screen.queryByText("Daniel Alferez")).not.toBeInTheDocument();
  });

  it("renders system message correctly", () => {
    const systemMessage: ChatMessage = {
      ...baseMessage,
      role: "assistant",
    };

    render(<MessageBubble message={systemMessage} user={user} />);

    expect(screen.getByText("Assistant Title")).toBeInTheDocument();
    expect(screen.getByText("This is a test message.")).toBeInTheDocument();
    expect(
      screen.getByText("Formatted(2025-07-23T10:00:00.000Z)")
    ).toBeInTheDocument();
  });
});
