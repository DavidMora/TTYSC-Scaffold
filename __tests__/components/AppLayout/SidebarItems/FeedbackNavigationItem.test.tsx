import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import FeedbackNavigationItem, {
  validateFeedbackText,
  processFeedback,
} from '../../../../src/components/AppLayout/SidebarItems/FeedbackNavigationItem';
import { createFeedback } from '../../../../src/lib/services/feedback.service';

// Mock UI5 components
jest.mock('@ui5/webcomponents-react', () => ({
  SideNavigationItem: ({ children, ...props }: any) => (
    <div data-testid="side-navigation-item" {...props}>
      {children}
    </div>
  ),
  FlexBox: ({ children, ...props }: any) => (
    <div data-testid="flexbox" {...props}>
      {children}
    </div>
  ),
  FlexBoxDirection: {
    Column: 'column',
    Row: 'row',
  },
  Text: ({ children, ...props }: any) => (
    <span data-testid="text" {...props}>
      {children}
    </span>
  ),
  TextArea: ({ onInput, ...props }: any) => (
    <textarea
      data-testid="textarea"
      onChange={(e) => onInput?.(e)}
      {...props}
    />
  ),
  Button: ({ children, onClick, ...props }: any) => (
    <button
      data-testid={props['data-testid'] || 'button'}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock the feedback service
jest.mock('../../../../src/lib/services/feedback.service', () => ({
  createFeedback: jest.fn(),
}));

const mockCreateFeedback = createFeedback as jest.MockedFunction<
  typeof createFeedback
>;

describe('FeedbackNavigationItem', () => {
  const mockOnSubmitFeedback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateFeedback.mockResolvedValue({
      id: '123',
      message: 'Success',
    } as any);
  });

  // Test utility functions first for 100% coverage
  describe('validateFeedbackText', () => {
    it('returns true for valid non-empty text', () => {
      expect(validateFeedbackText('valid feedback')).toBe(true);
    });

    it('returns false for empty text', () => {
      expect(validateFeedbackText('')).toBe(false);
    });

    it('returns false for whitespace-only text', () => {
      expect(validateFeedbackText('   ')).toBe(false);
    });

    it('returns false for tab and newline characters', () => {
      expect(validateFeedbackText('\t\n  ')).toBe(false);
    });

    it('returns true for text with leading/trailing spaces', () => {
      expect(validateFeedbackText('  valid  ')).toBe(true);
    });
  });

  describe('processFeedback', () => {
    it('successfully processes feedback and calls onSuccess', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await processFeedback('test feedback', onSuccess, onError);

      expect(mockCreateFeedback).toHaveBeenCalledWith({
        message: 'test feedback',
        category: 'general',
      });
      expect(onSuccess).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it('handles errors and calls onError callback', async () => {
      const error = new Error('API Error');
      mockCreateFeedback.mockRejectedValue(error);

      const onSuccess = jest.fn();
      const onError = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        processFeedback('test feedback', onSuccess, onError)
      ).rejects.toThrow('API Error');

      expect(onError).toHaveBeenCalledWith(error);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error submitting feedback:',
        error
      );

      consoleSpy.mockRestore();
    });

    it('trims whitespace from feedback text', async () => {
      const onSuccess = jest.fn();

      await processFeedback('  test feedback  ', onSuccess);

      expect(mockCreateFeedback).toHaveBeenCalledWith({
        message: 'test feedback',
        category: 'general',
      });
    });

    it('works without callbacks', async () => {
      await expect(processFeedback('test feedback')).resolves.not.toThrow();
    });

    it('handles error without onError callback', async () => {
      const error = new Error('API Error');
      mockCreateFeedback.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(processFeedback('test feedback')).rejects.toThrow(
        'API Error'
      );
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  // Component tests
  describe('FeedbackNavigationItem Component', () => {
    it('renders correctly with all elements', () => {
      render(<FeedbackNavigationItem />);

      expect(screen.getByTestId('side-navigation-item')).toBeInTheDocument();
      expect(screen.getByTestId('text')).toHaveTextContent(
        'Please provide your feedback here'
      );
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toBeInTheDocument();
    });

    it('renders without onSubmitFeedback prop', () => {
      render(<FeedbackNavigationItem />);
      expect(screen.getByTestId('button')).toBeInTheDocument();
    });

    it('updates textarea value when user types', () => {
      render(<FeedbackNavigationItem />);
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: 'test feedback' } });
      expect(textarea.value).toBe('test feedback');
    });

    it('enables submit button when valid text is entered', () => {
      render(<FeedbackNavigationItem />);
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByTestId('button') as HTMLButtonElement;

      fireEvent.change(textarea, { target: { value: 'valid feedback' } });
      expect(button.disabled).toBe(false);
    });

    it('keeps submit button disabled when only whitespace is entered', () => {
      render(<FeedbackNavigationItem />);
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByTestId('button') as HTMLButtonElement;

      fireEvent.change(textarea, { target: { value: '   ' } });
      expect(button.disabled).toBe(true);
    });

    it('successfully submits feedback and calls callback', async () => {
      render(
        <FeedbackNavigationItem onSubmitFeedback={mockOnSubmitFeedback} />
      );
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByTestId('button');

      fireEvent.change(textarea, { target: { value: 'test feedback' } });

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(mockCreateFeedback).toHaveBeenCalledWith({
          message: 'test feedback',
          category: 'general',
        });
      });

      expect(mockOnSubmitFeedback).toHaveBeenCalledWith('test feedback');
    });

    it('clears textarea after successful submission', async () => {
      render(<FeedbackNavigationItem />);
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      const button = screen.getByTestId('button');

      fireEvent.change(textarea, { target: { value: 'test feedback' } });

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('shows loading state while submitting', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const controlledPromise = new Promise<any>((resolve) => {
        resolvePromise = resolve;
      });
      mockCreateFeedback.mockReturnValue(controlledPromise);

      render(<FeedbackNavigationItem />);
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByTestId('button');

      fireEvent.change(textarea, { target: { value: 'test feedback' } });

      await act(async () => {
        fireEvent.click(button);
      });

      // Check loading state
      expect(button).toHaveTextContent('Submitting...');
      expect(button).toBeDisabled();
      expect(textarea).toBeDisabled();

      // Resolve the promise
      await act(async () => {
        resolvePromise({ id: '123' });
      });

      await waitFor(() => {
        expect(button).toHaveTextContent('Submit');
        expect(button).toBeDisabled(); // Should be disabled because textarea is now empty
      });
    });

    it('calls validation logic with empty feedback', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<FeedbackNavigationItem />);
      const textarea = screen.getByTestId('textarea');
      const forceSubmitButton = screen.getByTestId('force-submit-button');

      // Set empty text
      fireEvent.change(textarea, { target: { value: '' } });

      await act(async () => {
        fireEvent.click(forceSubmitButton);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Feedback text is empty or only whitespace'
      );
      expect(mockCreateFeedback).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('calls validation logic with whitespace-only feedback', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<FeedbackNavigationItem />);
      const textarea = screen.getByTestId('textarea');
      const forceSubmitButton = screen.getByTestId('force-submit-button');

      // Set whitespace text
      fireEvent.change(textarea, { target: { value: '   ' } });

      await act(async () => {
        fireEvent.click(forceSubmitButton);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Feedback text is empty or only whitespace'
      );
      expect(mockCreateFeedback).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('works without onSubmitFeedback callback', async () => {
      render(<FeedbackNavigationItem />);
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByTestId('button');

      fireEvent.change(textarea, { target: { value: 'test feedback' } });

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(mockCreateFeedback).toHaveBeenCalled();
      });

      // Should not throw error even without callback
    });

    it('maintains proper button state based on form validity', () => {
      render(<FeedbackNavigationItem />);
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByTestId('button');

      // Initially disabled
      expect(button).toBeDisabled();

      // Enabled with valid text
      fireEvent.change(textarea, { target: { value: 'valid' } });
      expect(button).toBeEnabled();

      // Disabled with invalid text
      fireEvent.change(textarea, { target: { value: '   ' } });
      expect(button).toBeDisabled();

      // Enabled again with valid text
      fireEvent.change(textarea, { target: { value: 'valid again' } });
      expect(button).toBeEnabled();
    });
  });
});
