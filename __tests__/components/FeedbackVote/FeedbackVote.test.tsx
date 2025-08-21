import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackVote } from '@/components/FeedbackVote/FeedbackVote';
import { AutosaveUIProvider } from '@/contexts/AutosaveUIProvider';

const mockMutate = jest.fn();

// Mock the hooks
jest.mock('@/hooks/chats', () => ({
  useUpdateMessageFeedback: jest.fn(() => ({
    mutate: mockMutate,
    isLoading: false,
    data: undefined,
    error: null,
    reset: jest.fn(),
  })),
}));

// Wrapper component to provide context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AutosaveUIProvider>{children}</AutosaveUIProvider>
);

describe('FeedbackVote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore original setTimeout
    if (window.setTimeout !== setTimeout) {
      Object.defineProperty(window, 'setTimeout', {
        value: setTimeout,
        writable: true,
      });
    }
  });

  describe('Initial State', () => {
    it('should render with default props', () => {
      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" />
        </TestWrapper>
      );

      expect(
        screen.getByText('How would you rate this answer?')
      ).toBeInTheDocument();
      expect(screen.getByText('thumb-up')).toBeInTheDocument();
      expect(screen.getByText('thumb-down')).toBeInTheDocument();
    });

    it('should render with custom className and style', () => {
      const customStyle = { backgroundColor: 'red' };
      render(
        <TestWrapper>
          <FeedbackVote
            messageId="test-message-id"
            className="custom-class"
            style={customStyle}
          />
        </TestWrapper>
      );

      const container = screen.getByTestId('feedback-vote');
      expect(container).toHaveClass('custom-class');
      expect(container).toHaveStyle('background-color: rgb(255, 0, 0)');
    });

    it('should render with previous vote state', () => {
      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" previousVote="up" />
        </TestWrapper>
      );

      const upIcon = screen.getByText('thumb-up');
      const downIcon = screen.getByText('thumb-down');

      expect(upIcon).toHaveStyle('color: var(--sapHighlightColor)');
      expect(downIcon).toHaveStyle(
        'color: var(--sapButton_Emphasized_Background_Color)'
      );
    });
  });

  describe('Voting Functionality', () => {
    it('should call mutate with correct parameters when upvote icon is clicked', () => {
      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" />
        </TestWrapper>
      );

      const upIcon = screen.getByText('thumb-up');
      fireEvent.click(upIcon);

      expect(mockMutate).toHaveBeenCalledWith({
        messageId: 'test-message-id',
        feedbackVote: 'up',
      });
    });

    it('should call mutate with correct parameters when downvote icon is clicked', () => {
      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" />
        </TestWrapper>
      );

      const downIcon = screen.getByText('thumb-down');
      fireEvent.click(downIcon);

      expect(mockMutate).toHaveBeenCalledWith({
        messageId: 'test-message-id',
        feedbackVote: 'down',
      });
    });

    it('should update visual state after voting', () => {
      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" />
        </TestWrapper>
      );

      const upIcon = screen.getByText('thumb-up');
      const downIcon = screen.getByText('thumb-down');

      expect(upIcon).toHaveStyle(
        'color: var(--sapButton_Emphasized_Background_Color)'
      );
      expect(downIcon).toHaveStyle(
        'color: var(--sapButton_Emphasized_Background_Color)'
      );

      fireEvent.click(upIcon);

      expect(upIcon).toHaveStyle('color: var(--sapHighlightColor)');
      expect(downIcon).toHaveStyle(
        'color: var(--sapButton_Emphasized_Background_Color)'
      );
    });

    it('should not call mutate when disabled', () => {
      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" disabled />
        </TestWrapper>
      );

      const upIcon = screen.getByText('thumb-up');
      const downIcon = screen.getByText('thumb-down');

      fireEvent.click(upIcon);
      fireEvent.click(downIcon);

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should apply disabled styles when disabled prop is true', () => {
      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" disabled />
        </TestWrapper>
      );

      const upIcon = screen.getByText('thumb-up');
      const downIcon = screen.getByText('thumb-down');

      expect(upIcon).toHaveStyle('cursor: not-allowed');
      expect(downIcon).toHaveStyle('cursor: not-allowed');
    });
  });

  describe('Previous Vote State', () => {
    it('should render with previous upvote', () => {
      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" previousVote="up" />
        </TestWrapper>
      );

      const upIcon = screen.getByText('thumb-up');
      const downIcon = screen.getByText('thumb-down');

      expect(upIcon).toHaveStyle('color: var(--sapHighlightColor)');
      expect(downIcon).toHaveStyle(
        'color: var(--sapButton_Emphasized_Background_Color)'
      );
    });

    it('should render with previous downvote', () => {
      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" previousVote="down" />
        </TestWrapper>
      );

      const upIcon = screen.getByText('thumb-up');
      const downIcon = screen.getByText('thumb-down');

      expect(upIcon).toHaveStyle(
        'color: var(--sapButton_Emphasized_Background_Color)'
      );
      expect(downIcon).toHaveStyle('color: var(--sapNegativeColor)');
    });

    it('should not allow voting when previous vote exists', () => {
      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" previousVote="up" />
        </TestWrapper>
      );

      const upIcon = screen.getByText('thumb-up');
      const downIcon = screen.getByText('thumb-down');

      fireEvent.click(upIcon);
      fireEvent.click(downIcon);

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper icon names for screen readers', () => {
      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" />
        </TestWrapper>
      );

      expect(screen.getByText('thumb-up')).toBeInTheDocument();
      expect(screen.getByText('thumb-down')).toBeInTheDocument();
    });

    it('should have descriptive text', () => {
      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" />
        </TestWrapper>
      );

      expect(
        screen.getByText('How would you rate this answer?')
      ).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle onSuccess callback', () => {
      let capturedOnSuccess: (() => void) | undefined;
      const mockSetTimeout = jest.fn((callback) => {
        callback();
        return 1;
      });
      Object.defineProperty(window, 'setTimeout', {
        value: mockSetTimeout,
        writable: true,
      });

      const { useUpdateMessageFeedback } = jest.requireMock('@/hooks/chats');
      useUpdateMessageFeedback.mockImplementation(
        (options: { onSuccess?: () => void }) => {
          capturedOnSuccess = options?.onSuccess;
          return {
            mutate: mockMutate,
            isLoading: false,
            data: undefined,
            error: null,
            reset: jest.fn(),
          };
        }
      );

      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" />
        </TestWrapper>
      );

      // Trigger the onSuccess callback directly
      if (capturedOnSuccess) {
        capturedOnSuccess();
      }

      // Verify setTimeout was called to clear success state after 2 seconds
      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
    });

    it('should handle onError callback', async () => {
      let capturedOnError: (() => void) | undefined;
      const mockSetTimeout = jest.fn((callback) => {
        callback();
        return 1;
      });
      Object.defineProperty(window, 'setTimeout', {
        value: mockSetTimeout,
        writable: true,
      });

      const { useUpdateMessageFeedback } = jest.requireMock('@/hooks/chats');
      useUpdateMessageFeedback.mockImplementation(
        (options: { onError?: () => void }) => {
          capturedOnError = options?.onError;
          return {
            mutate: mockMutate,
            isLoading: false,
            data: undefined,
            error: null,
            reset: jest.fn(),
          };
        }
      );

      render(
        <TestWrapper>
          <FeedbackVote messageId="test-message-id" />
        </TestWrapper>
      );

      // Trigger the onError callback directly
      if (capturedOnError) {
        capturedOnError();
      }

      // Verify setTimeout was called to clear error after 3 seconds
      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
    });
  });
});
