import { renderHook, act, waitFor } from '@testing-library/react';
import { useChatStream } from '@/hooks/chats/stream';
import { newChatMessageStream } from '@/lib/services/chats.service';
import {
  ChatStreamChunk,
  ChatPromptRequest,
  ExecutionMetadata,
} from '@/lib/types/chats';
import { HttpStreamResponse } from '@/lib/types/api/http-client';

jest.mock('@/lib/services/chats.service');

const mockedNewChatMessageStream = jest.mocked(newChatMessageStream);

// Helper to create a mock stream that can be wrapped in a HttpStreamResponse
async function* createMockStreamGenerator(
  chunks: ChatStreamChunk[],
  hang?: boolean
) {
  for (const chunk of chunks) {
    await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate network delay
    yield chunk;
  }
  if (hang) {
    await new Promise(() => {}); // Never resolve, keeping the stream open
  }
}

function createMockHttpStreamResponse(
  chunks: ChatStreamChunk[],
  hang?: boolean
): HttpStreamResponse<ChatStreamChunk> {
  const stream = createMockStreamGenerator(chunks, hang);
  return {
    [Symbol.asyncIterator]: () => stream,
    cancel: jest.fn(),
    status: 200,
    statusText: 'OK',
    headers: {},
    ok: true,
  };
}

describe('useChatStream', () => {
  const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
  const mockPayload: ChatPromptRequest = {
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'test-model',
    temperature: 0,
    max_tokens: 1,
    top_p: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useChatStream());
    expect(result.current.chunks).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.aggregatedContent).toBe('');
    expect(result.current.finishReason).toBeNull();
    expect(result.current.metadata).toBeNull();
    expect(result.current.steps).toEqual([]);
    expect(result.current.lastChunk).toBeNull();
  });

  it('should not start without a payload', () => {
    const { result } = renderHook(() => useChatStream());
    act(() => {
      result.current.start();
    });
    expect(result.current.error).toBe('Missing payload for chat stream');
  });

  it('should start and process stream chunks', async () => {
    const mockChunks: ChatStreamChunk[] = [
      {
        id: '1',
        created: 'ts1',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: 'Hello' },
          },
        ],
      },
      {
        id: '2',
        created: 'ts2',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: ' world' },
          },
        ],
      },
    ];
    mockedNewChatMessageStream.mockResolvedValue(
      createMockHttpStreamResponse(mockChunks)
    );

    const { result } = renderHook(() => useChatStream());

    act(() => {
      result.current.start(mockPayload);
    });

    await waitFor(() => expect(result.current.isStreaming).toBe(false));

    expect(result.current.chunks.length).toBe(2);
    expect(normalize(result.current.aggregatedContent)).toBe('Hello world');
    expect(result.current.lastChunk).toEqual(mockChunks[1]);
  });

  it('should handle delta and snapshot content updates', async () => {
    const mockChunks: ChatStreamChunk[] = [
      {
        id: '1',
        created: 'ts1',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: 'first' },
          },
        ],
      },
      {
        id: '2',
        created: 'ts2',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: 'first part' },
          },
        ],
      }, // snapshot
      {
        id: '3',
        created: 'ts3',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: ' second' },
          },
        ],
      }, // delta
    ];
    mockedNewChatMessageStream.mockResolvedValue(
      createMockHttpStreamResponse(mockChunks)
    );
    const { result } = renderHook(() => useChatStream());
    act(() => {
      result.current.start(mockPayload);
    });
    await waitFor(() =>
      expect(normalize(result.current.aggregatedContent)).toContain(
        'first part second'
      )
    );
  });

  it('should stop streaming when stop is called', async () => {
    const mockChunks: ChatStreamChunk[] = [
      {
        id: '1',
        created: 'ts1',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: 'a' },
          },
        ],
      },
    ];
    const stream = createMockHttpStreamResponse(mockChunks, true); // hang stream
    mockedNewChatMessageStream.mockResolvedValue(stream);

    const { result } = renderHook(() => useChatStream());

    act(() => {
      result.current.start(mockPayload);
    });

    await waitFor(() => expect(result.current.isStreaming).toBe(true));

    act(() => {
      result.current.stop();
    });

    expect(result.current.isStreaming).toBe(false);
  });

  it('should reset state when reset is called', async () => {
    const mockChunks: ChatStreamChunk[] = [
      {
        id: '1',
        created: 'ts1',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: 'a' },
          },
        ],
      },
    ];
    mockedNewChatMessageStream.mockResolvedValue(
      createMockHttpStreamResponse(mockChunks)
    );
    const { result } = renderHook(() => useChatStream());
    act(() => {
      result.current.start(mockPayload);
    });
    await waitFor(() => expect(result.current.isStreaming).toBe(false));

    act(() => {
      result.current.reset();
    });

    expect(result.current.chunks).toEqual([]);
    expect(result.current.aggregatedContent).toBe('');
  });

  it('should handle stream errors', async () => {
    const errorMessage = 'Stream failed';
    mockedNewChatMessageStream.mockRejectedValue(new Error(errorMessage));
    const { result } = renderHook(() => useChatStream());
    act(() => {
      result.current.start(mockPayload);
    });
    await waitFor(() => expect(result.current.error).toBe(errorMessage));
    expect(result.current.isStreaming).toBe(false);
  });

  it('should capture finish reason and metadata', async () => {
    const mockMetadata: Partial<ExecutionMetadata> = { original_query: 'test' };
    const mockChunks: ChatStreamChunk[] = [
      {
        id: '1',
        created: 'ts1',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: 'stop',
            message: { role: 'assistant', content: '' },
            execution_metadata: mockMetadata as ExecutionMetadata,
          },
        ],
      },
    ];
    mockedNewChatMessageStream.mockResolvedValue(
      createMockHttpStreamResponse(mockChunks)
    );
    const { result } = renderHook(() => useChatStream());
    act(() => {
      result.current.start(mockPayload);
    });
    await waitFor(() => expect(result.current.finishReason).toBe('stop'));
    expect(result.current.metadata).toEqual(mockMetadata);
  });

  it('should stop automatically on finish if stopOnFinish is true', async () => {
    const mockChunks: ChatStreamChunk[] = [
      {
        id: '1',
        created: 'ts1',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: 'a' },
          },
        ],
      },
      {
        id: '2',
        created: 'ts2',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: 'stop',
            message: { role: 'assistant', content: '' },
          },
        ],
      },
      {
        id: '3',
        created: 'ts3',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: 'b' },
          },
        ],
      },
    ];
    mockedNewChatMessageStream.mockResolvedValue(
      createMockHttpStreamResponse(mockChunks)
    );
    const { result } = renderHook(() => useChatStream({ stopOnFinish: true }));
    act(() => {
      result.current.start(mockPayload);
    });
    await waitFor(() => expect(result.current.chunks.length).toBe(2)); // Stops after the finish_reason chunk
  });

  it('should track workflow steps', async () => {
    const mockChunks: ChatStreamChunk[] = [
      {
        id: '1',
        created: 'ts1',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: '' },
            step: 'step1',
            workflow_status: 'running',
          },
        ],
      },
      {
        id: '2',
        created: 'ts2',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: '' },
            step: 'step2',
            workflow_status: 'done',
          },
        ],
      },
    ];
    mockedNewChatMessageStream.mockResolvedValue(
      createMockHttpStreamResponse(mockChunks)
    );
    const { result } = renderHook(() => useChatStream());
    act(() => {
      result.current.start(mockPayload);
    });
    await waitFor(() => expect(result.current.steps.length).toBe(2));
    expect(result.current.steps[0]).toEqual({
      ts: 'ts1',
      step: 'step1',
      workflow_status: 'running',
      data: undefined,
    });
  });

  it('should handle AbortError silently', async () => {
    const abortError = new DOMException(
      'The user aborted a request.',
      'AbortError'
    );
    mockedNewChatMessageStream.mockRejectedValue(abortError);
    const { result } = renderHook(() => useChatStream());
    act(() => {
      result.current.start(mockPayload);
    });
    await waitFor(() => expect(result.current.isStreaming).toBe(false));
    expect(result.current.error).toBeNull();
  });

  it('should handle unknown errors', async () => {
    mockedNewChatMessageStream.mockRejectedValue('a string error');
    const { result } = renderHook(() => useChatStream());
    act(() => {
      result.current.start(mockPayload);
    });
    await waitFor(() =>
      expect(result.current.error).toBe('Unknown stream error')
    );
  });

  it('should not start if already streaming', async () => {
    const stream = createMockHttpStreamResponse([], true); // hang the stream
    mockedNewChatMessageStream.mockResolvedValue(stream);
    const { result } = renderHook(() => useChatStream());

    act(() => {
      result.current.start(mockPayload);
    });

    await waitFor(() => expect(result.current.isStreaming).toBe(true));

    act(() => {
      result.current.start(mockPayload); // second call should be ignored
    });

    expect(mockedNewChatMessageStream).toHaveBeenCalledTimes(1);

    // Stop the stream to avoid it hanging the test runner
    act(() => {
      result.current.stop();
    });
  });

  it('should use defaultPayload if provided', async () => {
    mockedNewChatMessageStream.mockResolvedValue(
      createMockHttpStreamResponse([])
    );
    const { result } = renderHook(() =>
      useChatStream({ defaultPayload: mockPayload })
    );
    act(() => {
      result.current.start();
    });
    await waitFor(() =>
      expect(mockedNewChatMessageStream).toHaveBeenCalledWith(
        mockPayload,
        expect.any(Object)
      )
    );
  });

  it('should autostart on mount if autoStart is true', async () => {
    mockedNewChatMessageStream.mockResolvedValue(
      createMockHttpStreamResponse([])
    );
    act(() => {
      renderHook(() =>
        useChatStream({ autoStart: true, defaultPayload: mockPayload })
      );
    });
    await waitFor(() =>
      expect(mockedNewChatMessageStream).toHaveBeenCalledTimes(1)
    );
  });

  it('appends when content is included but not a suffix (mergeMessageContent branch)', async () => {
    const mockChunks: ChatStreamChunk[] = [
      {
        id: '1',
        created: 'ts1',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: 'Hello world' },
          },
        ],
      },
      {
        id: '2',
        created: 'ts2',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            // this string is contained within previous content but is not a suffix
            message: { role: 'assistant', content: 'Hello' },
          },
        ],
      },
    ];
    mockedNewChatMessageStream.mockResolvedValue(
      createMockHttpStreamResponse(mockChunks)
    );

    const { result } = renderHook(() => useChatStream());
    act(() => {
      result.current.start(mockPayload);
    });
    await waitFor(() => expect(result.current.isStreaming).toBe(false));

    // Expect duplicated append from the specific branch (with normalized whitespace)
    expect(result.current.aggregatedContent.replace(/\s+/g, ' ').trim()).toContain(
      'Hello world Hello'
    );
  });

  it('continues processing after finish when stopOnFinish is false', async () => {
    const mockChunks: ChatStreamChunk[] = [
      {
        id: '1',
        created: 'ts1',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: 'a' },
          },
        ],
      },
      {
        id: '2',
        created: 'ts2',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: 'stop',
            message: { role: 'assistant', content: '' },
          },
        ],
      },
      {
        id: '3',
        created: 'ts3',
        object: 'chat.completion.chunk',
        model: 'test',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { role: 'assistant', content: 'b' },
          },
        ],
      },
    ];
    mockedNewChatMessageStream.mockResolvedValue(
      createMockHttpStreamResponse(mockChunks)
    );

    const { result } = renderHook(() =>
      useChatStream({ stopOnFinish: false })
    );
    act(() => {
      result.current.start(mockPayload);
    });
    await waitFor(() => expect(result.current.chunks.length).toBe(3));
  });
});
