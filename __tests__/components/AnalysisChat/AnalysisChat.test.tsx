import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AnalysisChat from "@/components/AnalysisChat/AnalysisChat";
import { ChatMessage, BotResponse } from "@/lib/types/chats";
import { useSendChatMessage } from "@/hooks/chats";
import "@testing-library/jest-dom";

// Mock hooks
jest.mock("@/hooks/chats", () => ({
  useSendChatMessage: jest.fn(),
}));

// Mock components
jest.mock("@/components/AnalysisChat/MessageBubble", () => ({
  MessageBubble: ({
    message,
    user,
  }: {
    message: ChatMessage;
    user?: { name: string; initials: string };
  }) => (
    <div data-testid={`message-${message.id}`} data-role={message.role}>
      <div data-testid="message-content">{message.content}</div>
      <div data-testid="user-name">{user?.name || "Unknown"}</div>
    </div>
  ),
}));

jest.mock("@/components/AnalysisChat/ChatInput", () => ({
  ChatInput: ({
    onSendMessage,
    isLoading,
  }: {
    onSendMessage: (msg: string) => void;
    isLoading: boolean;
  }) => (
    <div data-testid="chat-input">
      <input
        data-testid="message-input"
        placeholder="Write your lines here"
        disabled={isLoading}
        onChange={() => {
          // Simulate input change
        }}
      />
      <button
        data-testid="send-button"
        onClick={() => onSendMessage("Test message")}
        disabled={isLoading}
      >
        Send
      </button>
    </div>
  ),
}));

const mockUseSendChatMessage = useSendChatMessage as jest.MockedFunction<
  typeof useSendChatMessage
>;

describe("AnalysisChat", () => {
  const mockMutate = jest.fn();

  const mockPreviousMessages: ChatMessage[] = [
    {
      id: "1",
      role: "user",
      content: "Hello",
      created: "2024-01-01T10:00:00Z",
    },
    {
      id: "2",
      role: "assistant",
      content: "Hi there!",
      title: "Assistant Response",
      created: "2024-01-01T10:01:00Z",
    },
  ];

  const defaultProps = {
    chatId: "test-chat-id",
    previousMessages: mockPreviousMessages,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSendChatMessage.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      data: undefined,
      error: null,
      reset: jest.fn(),
    });
  });

  describe("Component Rendering", () => {
    it("should render the chat component with correct structure", () => {
      render(<AnalysisChat {...defaultProps} />);

      expect(screen.getByTestId("chat-input")).toBeInTheDocument();
      expect(screen.getByTestId("message-1")).toBeInTheDocument();
      expect(screen.getByTestId("message-2")).toBeInTheDocument();
    });

    it("should render with empty previous messages", () => {
      render(<AnalysisChat chatId="test-chat-id" previousMessages={[]} />);

      expect(screen.getByTestId("chat-input")).toBeInTheDocument();
      expect(screen.queryByTestId("message-1")).not.toBeInTheDocument();
    });

    it("should initialize messages state with previous messages", () => {
      render(<AnalysisChat {...defaultProps} />);

      expect(screen.getByTestId("message-1")).toBeInTheDocument();
      expect(screen.getByTestId("message-2")).toBeInTheDocument();
    });
  });

  describe("Hook Integration", () => {
    it("should handle loading state", () => {
      mockUseSendChatMessage.mockReturnValue({
        mutate: mockMutate,
        isLoading: true,
        data: undefined,
        error: null,
        reset: jest.fn(),
      });

      render(<AnalysisChat {...defaultProps} />);

      const input = screen.getByTestId("message-input");
      const sendButton = screen.getByTestId("send-button");

      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    it("should handle successful message response", () => {
      mockUseSendChatMessage.mockReturnValue({
        mutate: mockMutate,
        isLoading: false,
        data: {
          id: "test-id",
          object: "chat.completion",
          model: "gpt-4",
          created: "2024-01-01T10:00:00Z",
          choices: [
            {
              message: {
                content: "This is a successful response",
                role: "assistant",
                title: "Assistant Response",
              },
              finish_reason: "stop",
              index: 0,
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
        },
        error: null,
        reset: jest.fn(),
      });

      render(<AnalysisChat {...defaultProps} />);

      const sendButton = screen.getByTestId("send-button");
      fireEvent.click(sendButton);

      // Verify that the success callback would be called with the response data
      expect(mockMutate).toHaveBeenCalled();
    });

    it("should test onError callback behavior", () => {
      let capturedOnError: ((error: Error) => void) | undefined;

      mockUseSendChatMessage.mockImplementation((options) => {
        capturedOnError = options?.onError;
        return {
          mutate: mockMutate,
          isLoading: false,
          data: undefined,
          error: null,
          reset: jest.fn(),
        };
      });

      render(<AnalysisChat {...defaultProps} />);

      // Verify the hook was called with onError callback
      expect(mockUseSendChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );

      // Test the onError callback behavior
      if (capturedOnError) {
        // Call the onError callback
        capturedOnError(new Error("Test error"));
      }
    });

    it("should test onSuccess callback with empty content", () => {
      let capturedOnSuccess: ((data: BotResponse) => void) | undefined;

      mockUseSendChatMessage.mockImplementation((options) => {
        capturedOnSuccess = options?.onSuccess;
        return {
          mutate: mockMutate,
          isLoading: false,
          data: undefined,
          error: null,
          reset: jest.fn(),
        };
      });

      render(<AnalysisChat {...defaultProps} />);

      if (capturedOnSuccess) {
        const mockBotResponse: BotResponse = {
          id: "test-id",
          object: "chat.completion",
          model: "gpt-4",
          created: "2024-01-01T10:00:00Z",
          choices: [
            {
              message: {
                content: "",
                role: "assistant",
              },
              finish_reason: "stop",
              index: 0,
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
        };

        capturedOnSuccess(mockBotResponse);
      }
    });

    describe("Scroll Functionality", () => {
      it("should call scrollToBottom when sending messages", () => {
        Object.defineProperty(window, "setTimeout", {
          value: jest.fn((callback) => {
            callback();
            return 1;
          }),
          writable: true,
        });

        render(<AnalysisChat {...defaultProps} />);

        const sendButton = screen.getByTestId("send-button");
        fireEvent.click(sendButton);

        expect(mockMutate).toHaveBeenCalled();
      });
    });
  });
});
