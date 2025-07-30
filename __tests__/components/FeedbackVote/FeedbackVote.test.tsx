import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeedbackVote } from "@/components/FeedbackVote/FeedbackVote";

const mockOnVote = jest.fn();

describe("FeedbackVote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should render with default props", () => {
      render(<FeedbackVote />);

      expect(
        screen.getByText("How would you rate this answer?")
      ).toBeInTheDocument();
      expect(screen.getByText("thumb-up")).toBeInTheDocument();
      expect(screen.getByText("thumb-down")).toBeInTheDocument();
    });

    it("should render with custom className and style", () => {
      const customStyle = { backgroundColor: "red" };
      render(<FeedbackVote className="custom-class" style={customStyle} />);

      const container = screen.getByText(
        "How would you rate this answer?"
      ).parentElement;
      expect(container).toHaveClass("custom-class");
      expect(container).toHaveStyle("background-color: rgb(255, 0, 0)");
    });

    it("should render with previous vote state", () => {
      render(<FeedbackVote previousVote="up" />);

      const upIcon = screen.getByText("thumb-up");
      const downIcon = screen.getByText("thumb-down");

      expect(upIcon).toHaveStyle("color: var(--sapHighlightColor)");
      expect(downIcon).toHaveStyle(
        "color: var(--sapButton_Emphasized_Background_Color)"
      );
    });
  });

  describe("Voting Functionality", () => {
    it("should call onVote with 'up' when upvote icon is clicked", () => {
      render(<FeedbackVote onVote={mockOnVote} />);

      const upIcon = screen.getByText("thumb-up");
      fireEvent.click(upIcon);

      expect(mockOnVote).toHaveBeenCalledWith("up");
    });

    it("should call onVote with 'down' when downvote icon is clicked", () => {
      render(<FeedbackVote onVote={mockOnVote} />);

      const downIcon = screen.getByText("thumb-down");
      fireEvent.click(downIcon);

      expect(mockOnVote).toHaveBeenCalledWith("down");
    });

    it("should update visual state after voting", () => {
      render(<FeedbackVote onVote={mockOnVote} />);

      const upIcon = screen.getByText("thumb-up");
      const downIcon = screen.getByText("thumb-down");

      expect(upIcon).toHaveStyle(
        "color: var(--sapButton_Emphasized_Background_Color)"
      );
      expect(downIcon).toHaveStyle(
        "color: var(--sapButton_Emphasized_Background_Color)"
      );

      fireEvent.click(upIcon);

      expect(upIcon).toHaveStyle("color: var(--sapHighlightColor)");
      expect(downIcon).toHaveStyle(
        "color: var(--sapButton_Emphasized_Background_Color)"
      );
    });

    it("should not allow voting after a vote has been cast", () => {
      render(<FeedbackVote onVote={mockOnVote} />);

      const upIcon = screen.getByText("thumb-up");
      const downIcon = screen.getByText("thumb-down");

      fireEvent.click(upIcon);
      expect(mockOnVote).toHaveBeenCalledTimes(1);

      fireEvent.click(downIcon);
      expect(mockOnVote).toHaveBeenCalledTimes(1);
    });

    it("should not call onVote when disabled", () => {
      render(<FeedbackVote onVote={mockOnVote} disabled={true} />);

      const upIcon = screen.getByText("thumb-up");
      const downIcon = screen.getByText("thumb-down");

      fireEvent.click(upIcon);
      fireEvent.click(downIcon);

      expect(mockOnVote).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    it("should apply disabled styles when disabled prop is true", () => {
      render(<FeedbackVote disabled={true} />);

      const upIcon = screen.getByText("thumb-up");
      const downIcon = screen.getByText("thumb-down");

      expect(upIcon).toHaveStyle("cursor: not-allowed");
      expect(downIcon).toHaveStyle("cursor: not-allowed");
      expect(upIcon).toHaveStyle("opacity: 0.6");
      expect(downIcon).toHaveStyle("opacity: 0.6");
    });

    it("should apply disabled styles after voting", () => {
      render(<FeedbackVote onVote={mockOnVote} />);

      const upIcon = screen.getByText("thumb-up");
      const downIcon = screen.getByText("thumb-down");

      expect(upIcon).toHaveStyle("cursor: pointer");
      expect(downIcon).toHaveStyle("cursor: pointer");
      expect(upIcon).toHaveStyle("opacity: 1");
      expect(downIcon).toHaveStyle("opacity: 1");

      fireEvent.click(upIcon);

      expect(upIcon).toHaveStyle("cursor: not-allowed");
      expect(downIcon).toHaveStyle("cursor: not-allowed");
      expect(upIcon).toHaveStyle("opacity: 0.6");
      expect(downIcon).toHaveStyle("opacity: 0.6");
    });
  });

  describe("Previous Vote State", () => {
    it("should render with previous upvote", () => {
      render(<FeedbackVote previousVote="up" onVote={mockOnVote} />);

      const upIcon = screen.getByText("thumb-up");
      const downIcon = screen.getByText("thumb-down");

      expect(upIcon).toHaveStyle("color: var(--sapHighlightColor)");
      expect(downIcon).toHaveStyle(
        "color: var(--sapButton_Emphasized_Background_Color)"
      );
      expect(upIcon).toHaveStyle("cursor: not-allowed");
      expect(downIcon).toHaveStyle("cursor: not-allowed");
    });

    it("should render with previous downvote", () => {
      render(<FeedbackVote previousVote="down" onVote={mockOnVote} />);

      const upIcon = screen.getByText("thumb-up");
      const downIcon = screen.getByText("thumb-down");

      expect(upIcon).toHaveStyle(
        "color: var(--sapButton_Emphasized_Background_Color)"
      );
      expect(downIcon).toHaveStyle("color: var(--sapNegativeColor)");
      expect(upIcon).toHaveStyle("cursor: not-allowed");
      expect(downIcon).toHaveStyle("cursor: not-allowed");
    });

    it("should not allow voting when previous vote exists", () => {
      render(<FeedbackVote previousVote="up" onVote={mockOnVote} />);

      const upIcon = screen.getByText("thumb-up");
      const downIcon = screen.getByText("thumb-down");

      fireEvent.click(upIcon);
      fireEvent.click(downIcon);

      expect(mockOnVote).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper icon names for screen readers", () => {
      render(<FeedbackVote />);

      expect(screen.getByText("thumb-up")).toBeInTheDocument();
      expect(screen.getByText("thumb-down")).toBeInTheDocument();
    });

    it("should have descriptive text", () => {
      render(<FeedbackVote />);

      expect(
        screen.getByText("How would you rate this answer?")
      ).toBeInTheDocument();
    });
  });
});
