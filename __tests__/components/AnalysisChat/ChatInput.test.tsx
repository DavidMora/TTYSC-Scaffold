import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatInput } from "@/components/AnalysisChat/ChatInput"; // Ajusta la ruta si es necesario

const mockOnSendMessage = jest.fn();

describe("ChatInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the input and send button", () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);
      expect(
        screen.getByPlaceholderText("Write your lines here")
      ).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("disables input and button when isLoading is true", () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={true} />);
      expect(
        screen.getByPlaceholderText("Write your lines here")
      ).toBeDisabled();
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("enables input and button when isLoading is false", () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);
      expect(
        screen.getByPlaceholderText("Write your lines here")
      ).not.toBeDisabled();
      expect(screen.getByRole("button")).not.toBeDisabled();
    });
  });

  describe("Input behavior", () => {
    it("updates the input value on user typing", () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(
        "Write your lines here"
      ) as HTMLTextAreaElement;

      fireEvent.input(textarea, { target: { value: "Hello world" } });
      expect(textarea.value).toBe("Hello world");
    });
  });

  describe("Sending messages", () => {
    it("calls onSendMessage with input value and clears input", () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(
        "Write your lines here"
      ) as HTMLTextAreaElement;
      const button = screen.getByRole("button");

      fireEvent.input(textarea, { target: { value: "Test message" } });
      fireEvent.click(button);

      expect(mockOnSendMessage).toHaveBeenCalledWith("Test message");
      expect(textarea.value).toBe("");
    });

    it("does not send when input is empty", () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);
      const button = screen.getByRole("button");

      fireEvent.click(button);

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it("does not send when input is only whitespace", () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(
        "Write your lines here"
      ) as HTMLTextAreaElement;
      const button = screen.getByRole("button");

      fireEvent.input(textarea, { target: { value: "   " } });
      fireEvent.click(button);

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it("prevents sending while loading", () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={true} />);
      const textarea = screen.getByPlaceholderText(
        "Write your lines here"
      ) as HTMLTextAreaElement;
      const button = screen.getByRole("button");

      fireEvent.input(textarea, { target: { value: "Blocked message" } });
      fireEvent.click(button);

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it("sends message when enter key is pressed", () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(
        "Write your lines here"
      ) as HTMLTextAreaElement;

      fireEvent.input(textarea, { target: { value: "Test message" } });
      fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

      expect(mockOnSendMessage).toHaveBeenCalledWith("Test message");
    });

    it("does not send message when enter key is pressed and shift key is pressed", () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(
        "Write your lines here"
      ) as HTMLTextAreaElement;

      fireEvent.input(textarea, { target: { value: "Test message" } });
      fireEvent.keyDown(textarea, {
        key: "Enter",
        code: "Enter",
        shiftKey: true,
      });

      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });
  });
});
