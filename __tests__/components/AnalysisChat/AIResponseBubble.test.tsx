import React from "react";
import { render, screen } from "@testing-library/react";
import { AIResponseBubble } from "@/components/AnalysisChat/AIResponseBubble";
import { ChatMessage } from "@/lib/types/chats";

// Mock date formatting
jest.mock("@/lib/utils/dateUtils", () => ({
  parseDate: (iso: string) => `Formatted(${iso})`,
}));

const baseMessage: ChatMessage = {
  id: "1",
  role: "assistant",
  content: "This is an AI response message.",
  created: "2025-07-23T10:00:00.000Z",
  title: "Assistant Title",
};

describe("AIResponseBubble", () => {
  it("renders AI response with title and timestamp", () => {
    render(<AIResponseBubble message={baseMessage} />);

    expect(screen.getByText("Assistant Title")).toBeInTheDocument();
    expect(
      screen.getByText("Formatted(2025-07-23T10:00:00.000Z)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("This is an AI response message.")
    ).toBeInTheDocument();
  });

  it("renders feedback vote component", () => {
    render(<AIResponseBubble message={baseMessage} />);

    expect(screen.getByTestId("feedback-vote")).toBeInTheDocument();
  });

  it("renders data table", () => {
    render(<AIResponseBubble message={baseMessage} />);

    expect(screen.getByTestId("base-data-table")).toBeInTheDocument();
  });

  it("applies correct styling for AI response", () => {
    render(<AIResponseBubble message={baseMessage} />);

    const bubble = screen
      .getByText("This is an AI response message.")
      .closest("div");
    expect(bubble).toHaveStyle({
      backgroundColor: "#EAF5CF",
      borderRadius: "16px",
      border: "1px solid #D5D7DA",
    });
  });
});
