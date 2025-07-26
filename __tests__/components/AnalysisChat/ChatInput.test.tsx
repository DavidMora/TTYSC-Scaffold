import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatInput } from "@/components/AnalysisChat/ChatInput";

// Mock the hooks
const mockActivateAutosaveUI = jest.fn();
const mockUpdateChat = jest.fn();

jest.mock("@/contexts/AutosaveUIProvider", () => ({
  useAutosaveUI: () => ({
    activateAutosaveUI: mockActivateAutosaveUI,
  }),
}));

jest.mock("@/hooks/useAutoSave", () => ({
  useAutoSave: jest.fn(),
}));

jest.mock("@/hooks/chats", () => ({
  useUpdateChat: () => ({
    mutate: mockUpdateChat,
  }),
}));

// Mock useParams to return an id
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "test-chat-id" }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

const mockOnSendMessage = jest.fn();

describe("ChatInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the input and send button", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      expect(
        screen.getByPlaceholderText("Write your lines here")
      ).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("disables input and button when isLoading is true", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={true}
          draft=""
        />
      );
      expect(
        screen.getByPlaceholderText("Write your lines here")
      ).toBeDisabled();
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("enables input and button when isLoading is false", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      expect(
        screen.getByPlaceholderText("Write your lines here")
      ).not.toBeDisabled();
      expect(screen.getByRole("button")).not.toBeDisabled();
    });
  });

  describe("Input behavior", () => {
    it("updates the input value on user typing", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const textarea: HTMLTextAreaElement = screen.getByPlaceholderText(
        "Write your lines here"
      );

      fireEvent.input(textarea, { target: { value: "Hello world" } });
      expect(textarea.value).toBe("Hello world");
    });
  });

  describe("Sending messages", () => {
    it("calls onSendMessage with input value and clears input", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const textarea: HTMLTextAreaElement = screen.getByPlaceholderText(
        "Write your lines here"
      );
      const button = screen.getByRole("button");

      fireEvent.input(textarea, { target: { value: "Test message" } });
      fireEvent.click(button);

      expect(mockOnSendMessage).toHaveBeenCalledWith("Test message");
      expect(textarea.value).toBe("");
    });

    it("clears input state after sending message via button click", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const textarea: HTMLTextAreaElement = screen.getByPlaceholderText(
        "Write your lines here"
      );
      const button = screen.getByRole("button");

      // Set input value
      fireEvent.input(textarea, { target: { value: "Test message" } });
      expect(textarea.value).toBe("Test message");

      // Send message
      fireEvent.click(button);

      // Verify input is cleared
      expect(textarea.value).toBe("");
      expect(mockOnSendMessage).toHaveBeenCalledWith("Test message");
    });

    it("clears input state after sending message via Enter key", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const textarea: HTMLTextAreaElement = screen.getByPlaceholderText(
        "Write your lines here"
      );

      // Set input value
      fireEvent.input(textarea, { target: { value: "Test message" } });
      expect(textarea.value).toBe("Test message");

      // Send message via Enter key
      fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

      // Verify input is cleared
      expect(textarea.value).toBe("");
      expect(mockOnSendMessage).toHaveBeenCalledWith("Test message");
    });

    it("does not send when input is empty", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const button = screen.getByRole("button");

      fireEvent.click(button);

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it("does not send when input is only whitespace", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const textarea = screen.getByPlaceholderText("Write your lines here");
      const button = screen.getByRole("button");

      fireEvent.input(textarea, { target: { value: "   " } });
      fireEvent.click(button);

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it("prevents sending while loading", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={true}
          draft=""
        />
      );
      const textarea = screen.getByPlaceholderText("Write your lines here");
      const button = screen.getByRole("button");

      fireEvent.input(textarea, { target: { value: "Blocked message" } });
      fireEvent.click(button);

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it("sends message when enter key is pressed", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const textarea = screen.getByPlaceholderText("Write your lines here");

      fireEvent.input(textarea, { target: { value: "Test message" } });
      fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

      expect(mockOnSendMessage).toHaveBeenCalledWith("Test message");
    });

    it("does not send message when enter key is pressed and shift key is pressed", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const textarea = screen.getByPlaceholderText("Write your lines here");

      fireEvent.input(textarea, { target: { value: "Test message" } });
      fireEvent.keyDown(textarea, {
        key: "Enter",
        code: "Enter",
        shiftKey: true,
      });

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it("does not prevent default when shift+enter is pressed", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const textarea = screen.getByPlaceholderText("Write your lines here");

      fireEvent.input(textarea, { target: { value: "Test message" } });

      const preventDefault = jest.fn();
      fireEvent.keyDown(textarea, {
        key: "Enter",
        code: "Enter",
        shiftKey: true,
        preventDefault,
      });

      expect(preventDefault).not.toHaveBeenCalled();
      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it("handles other key presses without triggering send", () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );
      const textarea = screen.getByPlaceholderText("Write your lines here");

      fireEvent.input(textarea, { target: { value: "Test message" } });

      const preventDefault = jest.fn();
      fireEvent.keyDown(textarea, {
        key: "Tab",
        code: "Tab",
        preventDefault,
      });

      expect(preventDefault).not.toHaveBeenCalled();
      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });
  });

  describe("useAutoSave integration", () => {
    it("should call useAutoSave with correct parameters including onSuccess callback", () => {
      const { useAutoSave } = require("@/hooks/useAutoSave");
      
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );

      expect(useAutoSave).toHaveBeenCalledWith({
        valueToWatch: "",
        onSave: expect.any(Function),
        onSuccess: expect.any(Function),
      });
    });

    it("should call activateAutosaveUI when useAutoSave onSuccess is triggered", () => {
      const { useAutoSave } = require("@/hooks/useAutoSave");
      
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );

      // Get the onSuccess callback from the useAutoSave call
      const useAutoSaveCall = useAutoSave.mock.calls[0][0];
      useAutoSaveCall.onSuccess();

      expect(mockActivateAutosaveUI).toHaveBeenCalled();
    });

    it("should update draft when input changes", () => {
      const { useAutoSave } = require("@/hooks/useAutoSave");
      
      const { rerender } = render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );

      const textarea = screen.getByPlaceholderText("Write your lines here");
      fireEvent.input(textarea, { target: { value: "New draft content" } });

      // Re-render to trigger useAutoSave with new value
      rerender(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          draft=""
        />
      );

      expect(useAutoSave).toHaveBeenCalledWith(
        expect.objectContaining({
          valueToWatch: "New draft content",
        })
      );
    });
  });
});
