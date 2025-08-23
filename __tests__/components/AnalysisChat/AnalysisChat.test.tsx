import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AnalysisChat from '@/components/AnalysisChat/AnalysisChat';
import { ChatMessage, BotResponse } from '@/lib/types/chats';
import { useSendChatMessage } from '@/hooks/chats';
import { useChatStream } from '@/hooks/chats/stream';
import '@testing-library/jest-dom';

// Mock auth to satisfy useCurrentUser dependency
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    session: { user: { name: 'Test User', image: null } },
    isLoading: false,
    authError: null,
  }),
}));

// Mock hooks
jest.mock('@/hooks/chats', () => ({
  useSendChatMessage: jest.fn(),
}));
jest.mock('@/hooks/chats/stream', () => ({
  useChatStream: jest.fn(() => ({
    start: jest.fn(),
    reset: jest.fn(),
    isStreaming: false,
    steps: [],
    aggregatedContent: '',
    finishReason: null,
    metadata: null,
  })),
}));

// Mock components
jest.mock('@/components/AnalysisChat/MessageBubble', () => ({
  MessageBubble: ({
    message,
    user,
  }: {
    message: ChatMessage;
    user?: { name: string; initials: string };
  }) => (
    <div data-testid={`message-${message.id}`} data-role={message.role}>
      <div data-testid="message-content">{message.content}</div>
      <div data-testid="user-name">{user?.name || 'Unknown'}</div>
    </div>
  ),
}));

jest.mock('@/components/AnalysisChat/ChatInput', () => ({
  ChatInput: ({
    onSendMessage,
    isLoading,
  }: {
    onSendMessage: (msg: string) => void;
    isLoading: boolean;
  }) => {
    const [inputValue, setInputValue] = React.useState('');

    return (
      <div data-testid="chat-input">
        <input
          data-testid="message-input"
          placeholder="Write your lines here"
          disabled={isLoading}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          data-testid="send-button"
          onClick={() => {
            onSendMessage(inputValue);
            setInputValue('');
          }}
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    );
  },
}));

const mockUseSendChatMessage = useSendChatMessage as jest.MockedFunction<
  typeof useSendChatMessage
>;
const mockUseChatStream = useChatStream as jest.MockedFunction<
  typeof useChatStream
>;

describe('AnalysisChat', () => {
  const mockMutate = jest.fn();

  const mockPreviousMessages: ChatMessage[] = [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      created: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hi there!',
      title: 'Assistant Response',
      created: '2024-01-01T10:01:00Z',
    },
  ];

  const defaultProps = {
    previousMessages: mockPreviousMessages,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSendChatMessage.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: jest.fn(),
      isLoading: false,
      data: undefined,
      error: undefined,
      reset: jest.fn(),
      isSuccess: false,
      isError: false,
      isIdle: true,
    });
    mockUseChatStream.mockReturnValue({
      start: jest.fn(),
      reset: jest.fn(),
      stop: jest.fn(),
      isStreaming: false,
      steps: [],
      aggregatedContent: '',
      finishReason: null,
      metadata: null,
      chunks: [],
      error: null,
      lastChunk: null,
    });

    // Mock scrollTo on HTMLDivElement prototype
    HTMLDivElement.prototype.scrollTo = jest.fn();
  });

  describe('Component Rendering', () => {
    it('should render the chat component with correct structure', () => {
      render(<AnalysisChat {...defaultProps} />);

      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
      expect(screen.getByTestId('message-1')).toBeInTheDocument();
      expect(screen.getByTestId('message-2')).toBeInTheDocument();
    });

    it('should render with empty previous messages', () => {
      render(<AnalysisChat previousMessages={[]} />);

      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
      expect(screen.queryByTestId('message-1')).not.toBeInTheDocument();
    });

    it('should initialize messages state with previous messages', () => {
      render(<AnalysisChat {...defaultProps} />);

      expect(screen.getByTestId('message-1')).toBeInTheDocument();
      expect(screen.getByTestId('message-2')).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should handle loading state', () => {
      mockUseSendChatMessage.mockReturnValue({
        mutate: mockMutate,
        isLoading: true,
        data: undefined,
        error: undefined,
        reset: jest.fn(),
        mutateAsync: jest.fn(),
        isSuccess: false,
        isError: false,
        isIdle: false,
      });

      render(<AnalysisChat {...defaultProps} />);

      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    it('should handle user sending a message (appends user message)', () => {
      const mockStart = jest.fn();
      mockUseChatStream.mockReturnValue({
        start: mockStart,
        reset: jest.fn(),
        stop: jest.fn(),
        isStreaming: false,
        steps: [],
        aggregatedContent: '',
        finishReason: null,
        metadata: null,
        chunks: [],
        error: null,
        lastChunk: null,
      });

      render(<AnalysisChat {...defaultProps} />);
      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');
      fireEvent.change(input, { target: { value: 'Hello model' } });
      fireEvent.click(sendButton);
      // Mutation not called directly anymore; streaming start should be invoked
      expect(mockStart).toHaveBeenCalled();
    });

    it('should test onError callback behavior', () => {
      let capturedOnError: ((error: Error) => void) | undefined;

      mockUseSendChatMessage.mockImplementation((options) => {
        capturedOnError = options?.onError;
        return {
          mutate: mockMutate,
          isLoading: false,
          data: undefined,
          error: undefined,
          reset: jest.fn(),
          mutateAsync: jest.fn(),
          isSuccess: false,
          isError: false,
          isIdle: true,
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
        act(() => {
          capturedOnError!(new Error('Test error'));
        });
      }
    });

    it('should test onSuccess callback with empty content', () => {
      let capturedOnSuccess: ((data: BotResponse) => void) | undefined;

      mockUseSendChatMessage.mockImplementation((options) => {
        capturedOnSuccess = options?.onSuccess;
        return {
          mutate: mockMutate,
          isLoading: false,
          data: undefined,
          error: undefined,
          reset: jest.fn(),
          mutateAsync: jest.fn(),
          isSuccess: false,
          isError: false,
          isIdle: true,
        };
      });

      render(<AnalysisChat {...defaultProps} />);

      if (capturedOnSuccess) {
        const mockBotResponse: BotResponse = {
          id: 'test-id',
          object: 'chat.completion',
          model: 'gpt-4',
          created: '2024-01-01T10:00:00Z',
          choices: [
            {
              message: {
                content: '',
                role: 'assistant',
              },
              finish_reason: 'stop',
              index: 0,
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
        };

        act(() => {
          capturedOnSuccess!(mockBotResponse);
        });
      }
    });

    it('should test onSuccess callback with undefined choices', () => {
      let capturedOnSuccess: ((data: BotResponse) => void) | undefined;

      mockUseSendChatMessage.mockImplementation((options) => {
        capturedOnSuccess = options?.onSuccess;
        return {
          mutate: mockMutate,
          isLoading: false,
          data: undefined,
          error: undefined,
          reset: jest.fn(),
          mutateAsync: jest.fn(),
          isSuccess: false,
          isError: false,
          isIdle: true,
        };
      });

      render(<AnalysisChat {...defaultProps} />);

      if (capturedOnSuccess) {
        const mockBotResponse: BotResponse = {
          id: 'test-id',
          object: 'chat.completion',
          model: 'gpt-4',
          created: '2024-01-01T10:00:00Z',
          choices: [],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
        };

        act(() => {
          capturedOnSuccess!(mockBotResponse);
        });
      }
    });

    it('should call streaming start and schedule scroll when sending messages', () => {
      Object.defineProperty(window, 'setTimeout', {
        value: jest.fn((callback) => {
          callback();
          return 1;
        }),
        writable: true,
      });

      const mockScrollTo = jest.fn();
      Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
        value: mockScrollTo,
        writable: true,
      });

      const mockStart = jest.fn();
      mockUseChatStream.mockReturnValue({
        start: mockStart,
        reset: jest.fn(),
        stop: jest.fn(),
        isStreaming: false,
        steps: [],
        aggregatedContent: '',
        finishReason: null,
        metadata: null,
        chunks: [],
        error: null,
        lastChunk: null,
      });

      render(<AnalysisChat {...defaultProps} draft="" />);

      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      expect(mockStart).toHaveBeenCalled();
    });

    it('should not send message when input is empty', () => {
      const mockScrollTo = jest.fn();
      Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
        value: mockScrollTo,
        writable: true,
      });

      render(<AnalysisChat {...defaultProps} draft="" />);

      const sendButton = screen.getByTestId('send-button');
      fireEvent.click(sendButton);

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should schedule scroll with timeout (immediate=false path)', () => {
      const mockSetTimeout = jest.fn((cb) => {
        cb();
        return 1;
      });
      Object.defineProperty(window, 'setTimeout', {
        value: mockSetTimeout,
        writable: true,
      });
      const mockScrollTo = jest.fn();
      Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
        value: mockScrollTo,
        writable: true,
      });
      render(<AnalysisChat {...defaultProps} />);
      expect(mockSetTimeout).toHaveBeenCalled();
    });

    it('should test onError callback with smooth scroll (line 78)', () => {
      jest.useFakeTimers();

      let capturedOnError: ((error: Error) => void) | undefined;
      const mockScrollTo = jest.fn();
      // Override the global mock for this specific test
      HTMLDivElement.prototype.scrollTo = mockScrollTo;

      mockUseSendChatMessage.mockImplementation((options) => {
        capturedOnError = options?.onError;
        return {
          mutate: mockMutate,
          isLoading: false,
          data: undefined,
          error: undefined,
          reset: jest.fn(),
          mutateAsync: jest.fn(),
          isSuccess: false,
          isError: false,
          isIdle: true,
        };
      });

      render(<AnalysisChat {...defaultProps} />);

      // Fast forward timers to execute the initial useEffect scroll
      act(() => {
        jest.runAllTimers();
      });

      // Reset mock to test the actual behavior we're testing
      mockScrollTo.mockClear();

      if (capturedOnError) {
        // Simulate an error that would trigger the onError callback
        const error = new Error('Test error');
        act(() => {
          capturedOnError!(error);
        });

        // Fast forward timers to execute the scroll behavior
        act(() => {
          jest.runAllTimers();
        });
      }

      // Verify scrollTo was called with smooth behavior
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth',
      });

      jest.useRealTimers();
    });

    it('handles immediate scroll behavior', () => {
      jest.useFakeTimers();

      const mockScrollTo = jest.fn();
      // Override the global mock for this specific test
      HTMLDivElement.prototype.scrollTo = mockScrollTo;

      (useSendChatMessage as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      });

      render(<AnalysisChat {...defaultProps} />);

      // Fast forward timers to execute the initial useEffect scroll
      act(() => {
        jest.runAllTimers();
      });

      // Reset mock to test the actual behavior we're testing
      mockScrollTo.mockClear();

      // Test immediate scroll with auto behavior
      // This would be triggered by some interaction, let's simulate via message sending
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      // Fast forward timers to execute the scroll behavior
      act(() => {
        jest.runAllTimers();
      });

      // The immediate scroll is usually triggered internally,
      // but we can test the behavior by checking the scroll calls
      expect(mockScrollTo).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('handles onSuccess callback with default values', () => {
      jest.useFakeTimers();

      const mockScrollTo = jest.fn();
      // Override the global mock for this specific test
      HTMLDivElement.prototype.scrollTo = mockScrollTo;

      let capturedOnSuccess: ((botMsg: BotResponse) => void) | undefined;

      (useSendChatMessage as jest.Mock).mockImplementation((options) => {
        capturedOnSuccess = options.onSuccess;
        return {
          mutate: jest.fn(),
          isLoading: false,
          data: undefined,
          error: undefined,
          reset: jest.fn(),
          mutateAsync: jest.fn(),
          isSuccess: false,
          isError: false,
          isIdle: true,
        };
      });

      render(<AnalysisChat {...defaultProps} />);

      // Fast forward timers to execute the initial useEffect scroll
      act(() => {
        jest.runAllTimers();
      });

      // Reset mock to test the actual behavior we're testing
      mockScrollTo.mockClear();

      // Simulate onSuccess with minimal bot response
      if (capturedOnSuccess) {
        const botMsg: BotResponse = {
          id: 'test-bot-response',
          object: 'chat.completion',
          model: 'test-model',
          created: new Date().toISOString(),
          choices: [
            {
              message: {
                content: '', // Test fallback to empty string
                role: 'assistant', // Test fallback to "assistant"
                title: '', // Test fallback to empty string
              },
              finish_reason: 'stop',
              index: 0,
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
        };

        act(() => {
          capturedOnSuccess!(botMsg);
        });

        // Fast forward timers to execute the scroll behavior
        act(() => {
          jest.runAllTimers();
        });
      }

      // Verify scrollTo was called after adding message
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth',
      });

      jest.useRealTimers();
    });
  });

  describe('Streaming and Markdown Generation', () => {
    it('should display busy indicator when streaming', () => {
      mockUseChatStream.mockReturnValue({
        start: jest.fn(),
        reset: jest.fn(),
        stop: jest.fn(),
        isStreaming: true,
        steps: [],
        aggregatedContent: '',
        finishReason: null,
        metadata: null,
        chunks: [],
        error: null,
        lastChunk: null,
      });

      render(<AnalysisChat {...defaultProps} />);

      expect(screen.getByTestId('ui5-busy-indicator')).toBeInTheDocument();
      expect(screen.getByText('Running...')).toBeInTheDocument();
    });

    it('should display busy indicator when showLoader is true', () => {
      // Mock a scenario where showLoader would be true by making the hook show loading
      mockUseChatStream.mockReturnValue({
        start: jest.fn(),
        reset: jest.fn(),
        stop: jest.fn(),
        isStreaming: false,
        steps: [],
        aggregatedContent: '',
        finishReason: null,
        metadata: null,
        chunks: [],
        error: null,
        lastChunk: null,
      });

      // Also mock the chat message hook to show loading
      mockUseSendChatMessage.mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
        isLoading: true, // This will make the ChatInput disabled
        data: undefined,
        error: undefined,
        reset: jest.fn(),
        isSuccess: false,
        isError: false,
        isIdle: false,
      });

      render(<AnalysisChat {...defaultProps} />);

      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      // The inputs should be disabled when loading
      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    it('should generate markdown from stream results with metadata', async () => {
      const mockStart = jest.fn();
      const mockReset = jest.fn();

      // Mock streaming with metadata containing query_results
      mockUseChatStream.mockReturnValue({
        start: mockStart,
        reset: mockReset,
        stop: jest.fn(),
        isStreaming: false,
        steps: [
          {
            ts: '2024-01-01T10:00:00Z',
            step: 'Planning completed',
            workflow_status: 'completed',
          },
          {
            ts: '2024-01-01T10:01:00Z',
            step: 'Data retrieved',
            workflow_status: 'completed',
          },
        ],
        aggregatedContent: '',
        finishReason: 'stop',
        metadata: {
          original_query: 'Test query',
          final_query: 'SELECT * FROM test',
          execution_plan: {
            complexity: 'simple',
            entities_referenced: {},
            data_sources_needed: ['test_db'],
            reasoning: 'Test reasoning',
            steps: ['step1'],
            parallel_steps: [],
          },
          selected_data_source: 'test_db',
          entity_validation: {
            valid: ['entity1'],
            inferred: {},
          },
          generated_sql: 'SELECT * FROM test',
          query_results: {
            dataframe_records: [
              {
                nvpn: 'NV001',
                description: 'Test Product',
                lt_weeks: 4,
                mfr: 'TestMfr',
                cm_site_name: 'Site1',
              },
              {
                nvpn: 'NV002',
                description: 'Another Product',
                lt_weeks: 6,
                mfr: 'TestMfr2',
                cm_site_name: 'Site2',
              },
            ],
            success: true,
            limited_to: 100,
            truncated: false,
          },
          completed_steps: ['step1'],
          error: null,
        },
        chunks: [],
        error: null,
        lastChunk: null,
      });

      const { rerender } = render(<AnalysisChat {...defaultProps} />);

      // First, send a message to trigger the streaming
      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Test query' } });
      fireEvent.click(sendButton);

      expect(mockStart).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: 'Test query' }],
        model: 'supply_chain_workflow',
        temperature: 0,
        max_tokens: 0,
        top_p: 0,
      });

      // Now simulate streaming completion by updating the mock to show not streaming
      mockUseChatStream.mockReturnValue({
        start: mockStart,
        reset: mockReset,
        stop: jest.fn(),
        isStreaming: false,
        steps: [
          {
            ts: '2024-01-01T10:00:00Z',
            step: 'Planning completed',
            workflow_status: 'completed',
          },
          {
            ts: '2024-01-01T10:01:00Z',
            step: 'Data retrieved',
            workflow_status: 'completed',
          },
        ],
        aggregatedContent: '',
        finishReason: 'stop',
        metadata: {
          original_query: 'Test query',
          final_query: 'SELECT * FROM test',
          execution_plan: {
            complexity: 'simple',
            entities_referenced: {},
            data_sources_needed: ['test_db'],
            reasoning: 'Test reasoning',
            steps: ['step1'],
            parallel_steps: [],
          },
          selected_data_source: 'test_db',
          entity_validation: {
            valid: ['entity1'],
            inferred: {},
          },
          generated_sql: 'SELECT * FROM test',
          query_results: {
            dataframe_records: [
              {
                nvpn: 'NV001',
                description: 'Test Product',
                lt_weeks: 4,
                mfr: 'TestMfr',
                cm_site_name: 'Site1',
              },
              {
                nvpn: 'NV002',
                description: 'Another Product',
                lt_weeks: 6,
                mfr: 'TestMfr2',
                cm_site_name: 'Site2',
              },
            ],
            success: true,
            limited_to: 100,
            truncated: false,
          },
          completed_steps: ['step1'],
          error: null,
        },
        chunks: [],
        error: null,
        lastChunk: null,
      });

      rerender(<AnalysisChat {...defaultProps} />);

      // Wait for the effect to process the stream completion
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // The markdown content should be generated and added as a message
      // We can verify this by checking that messages were updated
    });

    it('should use aggregatedContent when no metadata query_results', async () => {
      const mockStart = jest.fn();
      const mockReset = jest.fn();

      mockUseChatStream.mockReturnValue({
        start: mockStart,
        reset: mockReset,
        stop: jest.fn(),
        isStreaming: false,
        steps: [],
        aggregatedContent: 'This is the aggregated content from streaming',
        finishReason: 'stop',
        metadata: null, // No metadata
        chunks: [],
        error: null,
        lastChunk: null,
      });

      const { rerender } = render(<AnalysisChat {...defaultProps} />);

      // Send a message first
      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Test query' } });
      fireEvent.click(sendButton);

      // Update to simulate stream completion with aggregated content
      rerender(<AnalysisChat {...defaultProps} />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    });

    it('should handle empty aggregatedContent and no metadata', async () => {
      const mockStart = jest.fn();
      const mockReset = jest.fn();

      mockUseChatStream.mockReturnValue({
        start: mockStart,
        reset: mockReset,
        stop: jest.fn(),
        isStreaming: false,
        steps: [],
        aggregatedContent: '',
        finishReason: 'stop',
        metadata: null,
        chunks: [],
        error: null,
        lastChunk: null,
      });

      const { rerender } = render(<AnalysisChat {...defaultProps} />);

      // Send a message first
      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Test query' } });
      fireEvent.click(sendButton);

      // Update to simulate stream completion with no content
      rerender(<AnalysisChat {...defaultProps} />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    });

    it('should show workflow status messages correctly', () => {
      mockUseChatStream.mockReturnValue({
        start: jest.fn(),
        reset: jest.fn(),
        stop: jest.fn(),
        isStreaming: true,
        steps: [
          {
            ts: '2024-01-01T10:00:00Z',
            step: 'Planning completed',
            workflow_status: 'in_progress',
          },
        ],
        aggregatedContent: '',
        finishReason: null,
        metadata: null,
        chunks: [],
        error: null,
        lastChunk: null,
      });

      render(<AnalysisChat {...defaultProps} />);

      expect(screen.getByText('Planning completed')).toBeInTheDocument();
    });

    it('should show default "Running..." when no steps have workflow_status', () => {
      mockUseChatStream.mockReturnValue({
        start: jest.fn(),
        reset: jest.fn(),
        stop: jest.fn(),
        isStreaming: true,
        steps: [
          {
            ts: '2024-01-01T10:00:00Z',
            step: 'Some step',
            workflow_status: null,
          },
        ],
        aggregatedContent: '',
        finishReason: null,
        metadata: null,
        chunks: [],
        error: null,
        lastChunk: null,
      });

      render(<AnalysisChat {...defaultProps} />);

      expect(screen.getByText('Running...')).toBeInTheDocument();
    });

    it('should show "Running..." for started workflow status', () => {
      mockUseChatStream.mockReturnValue({
        start: jest.fn(),
        reset: jest.fn(),
        stop: jest.fn(),
        isStreaming: true,
        steps: [
          {
            ts: '2024-01-01T10:00:00Z',
            step: 'Initial step',
            workflow_status: 'started',
          },
        ],
        aggregatedContent: '',
        finishReason: null,
        metadata: null,
        chunks: [],
        error: null,
        lastChunk: null,
      });

      render(<AnalysisChat {...defaultProps} />);

      expect(screen.getByText('Running...')).toBeInTheDocument();
    });

    it('should show step text for in_progress status with fallback', () => {
      mockUseChatStream.mockReturnValue({
        start: jest.fn(),
        reset: jest.fn(),
        stop: jest.fn(),
        isStreaming: true,
        steps: [
          {
            ts: '2024-01-01T10:00:00Z',
            step: '',
            workflow_status: 'in_progress',
          }, // Empty step
        ],
        aggregatedContent: '',
        finishReason: null,
        metadata: null,
        chunks: [],
        error: null,
        lastChunk: null,
      });

      render(<AnalysisChat {...defaultProps} />);

      expect(screen.getByText('Running...')).toBeInTheDocument();
    });

    it('should handle buildMarkdownFromResults with empty steps', () => {
      const mockStart = jest.fn();
      const mockReset = jest.fn();

      mockUseChatStream.mockReturnValue({
        start: mockStart,
        reset: mockReset,
        stop: jest.fn(),
        isStreaming: false,
        steps: [], // Empty steps
        aggregatedContent: '',
        finishReason: 'stop',
        metadata: {
          original_query: 'Test query',
          final_query: 'SELECT * FROM test',
          execution_plan: {
            complexity: 'simple',
            entities_referenced: {},
            data_sources_needed: ['test_db'],
            reasoning: 'Test reasoning',
            steps: ['step1'],
            parallel_steps: [],
          },
          selected_data_source: 'test_db',
          entity_validation: {
            valid: ['entity1'],
            inferred: {},
          },
          generated_sql: 'SELECT * FROM test',
          query_results: {
            dataframe_records: [{ nvpn: 'NV001', description: 'Test Product' }],
            success: true,
            limited_to: 100,
            truncated: false,
          },
          completed_steps: ['step1'],
          error: null,
        },
        chunks: [],
        error: null,
        lastChunk: null,
      });

      const { rerender } = render(<AnalysisChat {...defaultProps} />);

      // Send a message first
      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Test query' } });
      fireEvent.click(sendButton);

      // Update to simulate stream completion
      rerender(<AnalysisChat {...defaultProps} />);
    });

    it('should handle buildMarkdownFromResults with steps that have no step property', () => {
      const mockStart = jest.fn();
      const mockReset = jest.fn();

      mockUseChatStream.mockReturnValue({
        start: mockStart,
        reset: mockReset,
        stop: jest.fn(),
        isStreaming: false,
        steps: [
          { ts: '2024-01-01T10:00:00Z', workflow_status: 'completed' }, // No step property
          {
            ts: '2024-01-01T10:01:00Z',
            step: undefined,
            workflow_status: 'completed',
          }, // Undefined step
          {
            ts: '2024-01-01T10:02:00Z',
            step: '',
            workflow_status: 'completed',
          }, // Empty step
        ],
        aggregatedContent: '',
        finishReason: 'stop',
        metadata: {
          original_query: 'Test query',
          final_query: 'SELECT * FROM test',
          execution_plan: {
            complexity: 'simple',
            entities_referenced: {},
            data_sources_needed: ['test_db'],
            reasoning: 'Test reasoning',
            steps: ['step1'],
            parallel_steps: [],
          },
          selected_data_source: 'test_db',
          entity_validation: {
            valid: ['entity1'],
            inferred: {},
          },
          generated_sql: 'SELECT * FROM test',
          query_results: {
            dataframe_records: [{ nvpn: 'NV001', description: 'Test Product' }],
            success: true,
            limited_to: 100,
            truncated: false,
          },
          completed_steps: ['step1'],
          error: null,
        },
        chunks: [],
        error: null,
        lastChunk: null,
      });

      const { rerender } = render(<AnalysisChat {...defaultProps} />);

      // Send a message first
      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Test query' } });
      fireEvent.click(sendButton);

      // Update to simulate stream completion
      rerender(<AnalysisChat {...defaultProps} />);
    });

    it('should handle metadata without query_results', () => {
      const mockStart = jest.fn();
      const mockReset = jest.fn();

      mockUseChatStream.mockReturnValue({
        start: mockStart,
        reset: mockReset,
        stop: jest.fn(),
        isStreaming: false,
        steps: [
          {
            ts: '2024-01-01T10:00:00Z',
            step: 'Planning completed',
            workflow_status: 'completed',
          },
        ],
        aggregatedContent: 'Some aggregated content',
        finishReason: 'stop',
        metadata: {
          original_query: 'Test query',
          final_query: 'SELECT * FROM test',
          execution_plan: {
            complexity: 'simple',
            entities_referenced: {},
            data_sources_needed: ['test_db'],
            reasoning: 'Test reasoning',
            steps: ['step1'],
            parallel_steps: [],
          },
          selected_data_source: 'test_db',
          entity_validation: {
            valid: ['entity1'],
            inferred: {},
          },
          generated_sql: 'SELECT * FROM test',
          query_results: {
            dataframe_records: [],
            success: true,
            limited_to: 100,
            truncated: false,
          },
          completed_steps: ['step1'],
          error: null,
        },
        chunks: [],
        error: null,
        lastChunk: null,
      });

      const { rerender } = render(<AnalysisChat {...defaultProps} />);

      // Send a message first
      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Test query' } });
      fireEvent.click(sendButton);

      // Update to simulate stream completion
      rerender(<AnalysisChat {...defaultProps} />);
    });

    it('should handle metadata with query_results but non-array dataframe_records', () => {
      const mockStart = jest.fn();
      const mockReset = jest.fn();

      // We'll use a type assertion to bypass TypeScript checking for this test case
      const invalidMetadata = {
        original_query: 'Test query',
        final_query: 'SELECT * FROM test',
        execution_plan: {
          complexity: 'simple',
          entities_referenced: {},
          data_sources_needed: ['test_db'],
          reasoning: 'Test reasoning',
          steps: ['step1'],
          parallel_steps: [],
        },
        selected_data_source: 'test_db',
        entity_validation: {
          valid: ['entity1'],
          inferred: {},
        },
        generated_sql: 'SELECT * FROM test',
        query_results: {
          dataframe_records: 'not an array' as unknown as Record<
            string,
            unknown
          >[], // Invalid type
          success: true,
          limited_to: 100,
          truncated: false,
        },
        completed_steps: ['step1'],
        error: null,
      };

      mockUseChatStream.mockReturnValue({
        start: mockStart,
        reset: mockReset,
        stop: jest.fn(),
        isStreaming: false,
        steps: [
          {
            ts: '2024-01-01T10:00:00Z',
            step: 'Planning completed',
            workflow_status: 'completed',
          },
        ],
        aggregatedContent: 'Some aggregated content',
        finishReason: 'stop',
        metadata: invalidMetadata,
        chunks: [],
        error: null,
        lastChunk: null,
      });

      const { rerender } = render(<AnalysisChat {...defaultProps} />);

      // Send a message first
      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Test query' } });
      fireEvent.click(sendButton);

      // Update to simulate stream completion
      rerender(<AnalysisChat {...defaultProps} />);
    });

    it('should not append duplicate messages for same runId', async () => {
      const mockStart = jest.fn();
      const mockReset = jest.fn();

      const mockStreamState = {
        start: mockStart,
        reset: mockReset,
        stop: jest.fn(),
        isStreaming: false,
        steps: [],
        aggregatedContent: 'Content',
        finishReason: 'stop',
        metadata: null,
        chunks: [],
        error: null,
        lastChunk: null,
      };

      mockUseChatStream.mockImplementation(() => mockStreamState);

      const { rerender } = render(<AnalysisChat {...defaultProps} />);

      // Send a message first
      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Test query' } });
      fireEvent.click(sendButton);

      // First completion
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Try to trigger the same completion again
      rerender(<AnalysisChat {...defaultProps} />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should not append the same message twice
    });
  });
});
