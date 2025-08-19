import { httpClient } from '@/lib/api';
import {
  BFF_CHATS,
  BFF_CHAT,
  BFF_CHAT_MESSAGE,
  BFF_MESSAGE_FEEDBACK,
  BFF_CHAT_STREAM,
} from '@/lib/constants/api/bff-routes';
import {
  getChats,
  getChat,
  createChat,
  updateChat,
  deleteChat,
  createChatMessage,
  updateMessageFeedback,
  newChatMessageStream,
} from '@/lib/services/chats.service';
import {
  Chat,
  BotResponse,
  CreateChatMessageRequest,
  UpdateChatRequest,
  ChatPromptRequest,
  ChatStreamChunk,
} from '@/lib/types/chats';
import { HttpClientResponse, HttpSSEEvent } from '@/lib/types/api/http-client';
import { BaseResponse } from '@/lib/types/http/responses';

// Mock the httpClient used by chats.service
jest.mock('@/lib/api', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
    stream: jest.fn(),
  },
}));

const generalMockChat: Chat = {
  id: 'test-chat-id',
  date: '2023-07-17',
  title: 'Team Meeting',
  messages: [],
  draft: '',
  metadata: {
    analysis: {
      key: 'test-analysis-key',
      name: 'Test Analysis',
    },
    organizations: {
      key: 'test-organization-key',
      name: 'Test Organization',
    },
    CM: {
      key: 'test-cm-key',
      name: 'Test CM',
    },
    SKU: {
      key: 'test-sku-key',
      name: 'Test SKU',
    },
    NVPN: {
      key: 'test-nvpn-key',
      name: 'Test NVPN',
    },
  },
};

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('Chats Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChats', () => {
    it('should call httpClient.get with correct URL', async () => {
      const mockResponse: HttpClientResponse<Chat[]> = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getChats();

      expect(mockHttpClient.get).toHaveBeenCalledWith(BFF_CHATS);
      expect(result).toBe(mockResponse);
    });

    it('should return chat list successfully', async () => {
      const mockChats: Chat[] = [
        {
          ...generalMockChat,
        },
        {
          ...generalMockChat,
          id: 'test-chat-id-2',
          title: 'Project Discussion',
        },
      ];

      const mockResponse: HttpClientResponse<BaseResponse<Chat[]>> = {
        data: {
          data: mockChats,
          message: 'Chats retrieved successfully',
          success: true,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getChats();

      expect(result.data.data).toEqual(mockChats);
      expect(result.status).toBe(200);
    });

    it('should handle error response', async () => {
      const mockError = new Error('Network error');
      mockHttpClient.get.mockRejectedValue(mockError);

      await expect(getChats()).rejects.toThrow('Network error');
    });
  });

  describe('getChat', () => {
    const testChatId = 'test-chat-id';

    it('should call httpClient.get with correct URL and ID', async () => {
      const mockResponse: HttpClientResponse<Chat> = {
        data: {} as Chat,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getChat(testChatId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(BFF_CHAT(testChatId));
      expect(result).toBe(mockResponse);
    });

    it('should return specific chat successfully', async () => {
      const mockChat: Chat = {
        id: testChatId,
        date: '2023-07-17',
        title: 'Team Meeting',
        draft: '',
        metadata: generalMockChat.metadata,
        messages: [
          {
            id: 'msg1',
            created: '2023-07-17T10:00:00Z',
            content: 'Hello everyone!',
            role: 'user',
          },
          {
            id: 'msg2',
            created: '2023-07-17T10:01:00Z',
            content: 'Hi John!',
            role: 'assistant',
          },
        ],
      };

      const mockResponse: HttpClientResponse<Chat> = {
        data: mockChat,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getChat(testChatId);

      expect(result.data).toEqual(mockChat);
      expect(result.status).toBe(200);
    });

    it('should handle chat not found', async () => {
      const mockResponse: HttpClientResponse<Chat> = {
        data: {} as Chat,
        status: 404,
        statusText: 'Not Found',
        headers: {},
        ok: false,
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getChat('non-existent-id');

      expect(result.status).toBe(404);
      expect(result.statusText).toBe('Not Found');
    });

    it('should handle error response', async () => {
      const mockError = new Error('Network error');
      mockHttpClient.get.mockRejectedValue(mockError);

      await expect(getChat(testChatId)).rejects.toThrow('Network error');
    });
  });

  describe('createChat', () => {
    it('should call httpClient.post with correct URL and payload', async () => {
      const mockCreatedChat: Chat = {
        id: 'new-chat-id',
        date: '2023-07-17',
        title: 'New Chat',
        messages: [],
        draft: '',
        metadata: generalMockChat.metadata,
      };

      const mockResponse: HttpClientResponse<Chat> = {
        data: mockCreatedChat,
        status: 201,
        statusText: 'Created',
        headers: {},
        ok: true,
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await createChat({ title: 'New Chat' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(BFF_CHATS, {
        title: 'New Chat',
      });
      expect(result).toBe(mockResponse);
      expect(result.data).toEqual(mockCreatedChat);
      expect(result.status).toBe(201);
    });

    it('should handle validation errors', async () => {
      const mockResponse: HttpClientResponse<Chat> = {
        data: {} as Chat,
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        ok: false,
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await createChat({ title: 'New Chat' });

      expect(result.status).toBe(400);
      expect(result.statusText).toBe('Bad Request');
    });

    it('should handle error response', async () => {
      const mockError = new Error('Server error');
      mockHttpClient.post.mockRejectedValue(mockError);

      await expect(createChat({ title: 'New Chat' })).rejects.toThrow(
        'Server error'
      );
    });
  });

  describe('updateChat', () => {
    it('should call httpClient.patch with correct URL and payload', async () => {
      const mockPayload: UpdateChatRequest = {
        id: 'chat-to-update',
        title: 'Updated Chat Title',
      };

      const mockUpdatedChat: Chat = {
        id: 'chat-to-update',
        date: '2023-07-17',
        title: 'Updated Chat Title',
        draft: '',
        metadata: generalMockChat.metadata,
        messages: [],
      };

      const mockResponse: HttpClientResponse<Chat> = {
        data: mockUpdatedChat,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.patch.mockResolvedValue(mockResponse);

      const result = await updateChat(mockPayload);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        BFF_CHAT(mockPayload.id),
        mockPayload
      );
      expect(result).toBe(mockResponse);
      expect(result.data).toEqual(mockUpdatedChat);
    });

    it('should handle partial updates', async () => {
      const mockPayload: UpdateChatRequest = {
        id: 'chat-id',
        title: 'Updated Chat Title',
      };

      const mockResponse: HttpClientResponse<Chat> = {
        data: {} as Chat,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.patch.mockResolvedValue(mockResponse);

      const result = await updateChat(mockPayload);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        BFF_CHAT(mockPayload.id),
        mockPayload
      );
      expect(result.status).toBe(200);
    });

    it('should handle chat not found during update', async () => {
      const mockPayload: UpdateChatRequest = {
        id: 'non-existent-chat',
        title: 'Updated Title',
      };

      const mockResponse: HttpClientResponse<Chat> = {
        data: {} as Chat,
        status: 404,
        statusText: 'Not Found',
        headers: {},
        ok: false,
      };

      mockHttpClient.patch.mockResolvedValue(mockResponse);

      const result = await updateChat(mockPayload);

      expect(result.status).toBe(404);
      expect(result.statusText).toBe('Not Found');
    });

    it('should handle error response', async () => {
      const mockPayload: UpdateChatRequest = {
        id: 'chat-id',
        title: 'Updated Title',
      };

      const mockError = new Error('Server error');
      mockHttpClient.patch.mockRejectedValue(mockError);

      await expect(updateChat(mockPayload)).rejects.toThrow('Server error');
    });
  });

  describe('deleteChat', () => {
    const testChatId = 'chat-to-delete';

    it('should call httpClient.delete with correct URL', async () => {
      const mockResponse: HttpClientResponse<void> = {
        data: undefined,
        status: 204,
        statusText: 'No Content',
        headers: {},
        ok: true,
      };

      mockHttpClient.delete.mockResolvedValue(mockResponse);

      const result = await deleteChat(testChatId);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(BFF_CHAT(testChatId));
      expect(result).toBe(mockResponse);
      expect(result.status).toBe(204);
    });

    it('should handle successful deletion', async () => {
      const mockResponse: HttpClientResponse<void> = {
        data: undefined,
        status: 204,
        statusText: 'No Content',
        headers: {},
        ok: true,
      };

      mockHttpClient.delete.mockResolvedValue(mockResponse);

      const result = await deleteChat(testChatId);

      expect(result.data).toBeUndefined();
      expect(result.status).toBe(204);
    });

    it('should handle chat not found during deletion', async () => {
      const mockResponse: HttpClientResponse<void> = {
        data: undefined,
        status: 404,
        statusText: 'Not Found',
        headers: {},
        ok: false,
      };

      mockHttpClient.delete.mockResolvedValue(mockResponse);

      const result = await deleteChat('non-existent-chat');

      expect(result.status).toBe(404);
      expect(result.statusText).toBe('Not Found');
    });

    it('should handle error response', async () => {
      const mockError = new Error('Server error');
      mockHttpClient.delete.mockRejectedValue(mockError);

      await expect(deleteChat(testChatId)).rejects.toThrow('Server error');
    });

    it('should handle unauthorized deletion', async () => {
      const mockResponse: HttpClientResponse<void> = {
        data: undefined,
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        ok: false,
      };

      mockHttpClient.delete.mockResolvedValue(mockResponse);

      const result = await deleteChat(testChatId);

      expect(result.status).toBe(403);
      expect(result.statusText).toBe('Forbidden');
    });
  });

  describe('createChatMessage', () => {
    it('should call httpClient.post with correct URL and payload', async () => {
      const mockPayload: CreateChatMessageRequest = {
        chatId: 'chat-id',
        messages: [],
        use_knowledge_base: false,
      };

      const mockResponse: HttpClientResponse<BotResponse> = {
        data: {} as BotResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await createChatMessage(mockPayload);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        BFF_CHAT_MESSAGE,
        mockPayload
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle error response', async () => {
      const mockError = new Error('Failed to send message');
      mockHttpClient.post.mockRejectedValue(mockError);

      const mockPayload: CreateChatMessageRequest = {
        chatId: 'chat-id',
        messages: [{ role: 'user', content: 'Hello' }],
        use_knowledge_base: false,
      };

      await expect(createChatMessage(mockPayload)).rejects.toThrow(
        'Failed to send message'
      );
    });

    it('should return bot response successfully', async () => {
      const mockBotResponse: BotResponse = {
        id: 'response-id',
        object: 'chat.completion',
        model: 'gpt-3.5-turbo',
        created: '2023-07-17T10:00:00Z',
        choices: [
          {
            message: { content: 'Hello!', role: 'assistant' },
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

      const mockResponse: HttpClientResponse<BotResponse> = {
        data: mockBotResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const mockPayload: CreateChatMessageRequest = {
        chatId: 'chat-id',
        messages: [{ role: 'user', content: 'Hello' }],
        use_knowledge_base: true,
      };

      const result = await createChatMessage(mockPayload);

      expect(result.data).toEqual(mockBotResponse);
      expect(result.status).toBe(200);
    });
  });

  describe('Integration with BFF routes', () => {
    it('should use correct BFF_CHATS endpoint', () => {
      expect(BFF_CHATS).toBe('/api/chats');
    });

    it('should generate correct BFF_CHAT endpoint for specific ID', () => {
      const chatId = 'test-id';
      expect(BFF_CHAT(chatId)).toBe(`/api/chats/${chatId}`);
    });
  });

  describe('updateMessageFeedback', () => {
    it('should call httpClient.put with correct URL and payload', async () => {
      const messageId = 'test-message-id';
      const feedbackVote = 'up' as const;

      const mockResponse: HttpClientResponse<void> = {
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.put.mockResolvedValue(mockResponse);

      const result = await updateMessageFeedback(messageId, feedbackVote);

      expect(mockHttpClient.put).toHaveBeenCalledWith(
        BFF_MESSAGE_FEEDBACK(messageId),
        { feedbackVote }
      );
      expect(result).toBe(mockResponse);
      expect(result.status).toBe(200);
    });

    it('should handle error response', async () => {
      const messageId = 'test-message-id';
      const feedbackVote = 'down' as const;

      const mockError = new Error('Failed to update feedback');
      mockHttpClient.put.mockRejectedValue(mockError);

      await expect(
        updateMessageFeedback(messageId, feedbackVote)
      ).rejects.toThrow('Failed to update feedback');
    });

    it('should handle null feedback vote', async () => {
      const messageId = 'test-message-id';
      const feedbackVote = null;

      const mockResponse: HttpClientResponse<void> = {
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.put.mockResolvedValue(mockResponse);

      const result = await updateMessageFeedback(messageId, feedbackVote);

      expect(mockHttpClient.put).toHaveBeenCalledWith(
        BFF_MESSAGE_FEEDBACK(messageId),
        { feedbackVote }
      );
      expect(result.status).toBe(200);
    });
  });

  describe('newChatMessageStream', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should stream chat messages successfully', async () => {
      const mockPayload: ChatPromptRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
      };

      const mockStreamChunk: ChatStreamChunk = {
        id: 'chunk-1',
        object: 'chat.completion.chunk',
        created: '2023-07-17T10:00:00Z',
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { content: 'Hello!', role: 'assistant' },
          },
        ],
      };

      const mockSSEEvents: HttpSSEEvent[] = [
        {
          data: JSON.stringify(mockStreamChunk),
          event: 'data',
          id: '1',
          retry: 0,
        },
        {
          data: JSON.stringify({ ...mockStreamChunk, id: 'chunk-2' }),
          event: 'data',
          id: '2',
          retry: 0,
        },
      ];

      const mockRawStream = {
        [Symbol.asyncIterator]: async function* () {
          for (const event of mockSSEEvents) {
            yield event;
          }
        },
        cancel: jest.fn(),
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.stream.mockResolvedValue(mockRawStream);

      const result = await newChatMessageStream(mockPayload);

      expect(mockHttpClient.stream).toHaveBeenCalledWith(BFF_CHAT_STREAM, {
        method: 'POST',
        body: mockPayload,
        parser: 'sse',
        signal: undefined,
      });

      expect(result.status).toBe(200);
      expect(result.statusText).toBe('OK');
      expect(result.ok).toBe(true);
      expect(typeof result.cancel).toBe('function');

      // Test async iteration
      const chunks: ChatStreamChunk[] = [];
      for await (const chunk of result) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2);
      expect(chunks[0].id).toBe('chunk-1');
      expect(chunks[1].id).toBe('chunk-2');
    });

    it('should handle malformed JSON chunks gracefully', async () => {
      const mockPayload: ChatPromptRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
      };

      const mockStreamChunk: ChatStreamChunk = {
        id: 'chunk-1',
        object: 'chat.completion.chunk',
        created: '2023-07-17T10:00:00Z',
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { content: 'Valid chunk', role: 'assistant' },
          },
        ],
      };

      const mockSSEEvents: HttpSSEEvent[] = [
        {
          data: JSON.stringify(mockStreamChunk),
          event: 'data',
          id: '1',
          retry: 0,
        },
        { data: 'invalid-json', event: 'data', id: '2', retry: 0 }, // This should be ignored
        {
          data: JSON.stringify({ ...mockStreamChunk, id: 'chunk-3' }),
          event: 'data',
          id: '3',
          retry: 0,
        },
      ];

      const mockRawStream = {
        [Symbol.asyncIterator]: async function* () {
          for (const event of mockSSEEvents) {
            yield event;
          }
        },
        cancel: jest.fn(),
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.stream.mockResolvedValue(mockRawStream);

      const result = await newChatMessageStream(mockPayload);

      // Test async iteration - should skip malformed JSON
      const chunks: ChatStreamChunk[] = [];
      for await (const chunk of result) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2); // Only valid chunks
      expect(chunks[0].id).toBe('chunk-1');
      expect(chunks[1].id).toBe('chunk-3');
    });

    it('should handle empty data events', async () => {
      const mockPayload: ChatPromptRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
      };

      const mockStreamChunk: ChatStreamChunk = {
        id: 'chunk-1',
        object: 'chat.completion.chunk',
        created: '2023-07-17T10:00:00Z',
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { content: 'Valid chunk', role: 'assistant' },
          },
        ],
      };

      const mockSSEEvents: HttpSSEEvent[] = [
        { data: '', event: 'data', id: '1', retry: 0 }, // Empty data should be ignored
        {
          data: JSON.stringify(mockStreamChunk),
          event: 'data',
          id: '2',
          retry: 0,
        },
        { data: undefined!, event: 'data', id: '3', retry: 0 }, // Undefined data should be ignored
      ];

      const mockRawStream = {
        [Symbol.asyncIterator]: async function* () {
          for (const event of mockSSEEvents) {
            yield event;
          }
        },
        cancel: jest.fn(),
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.stream.mockResolvedValue(mockRawStream);

      const result = await newChatMessageStream(mockPayload);

      // Test async iteration - should skip empty data
      const chunks: ChatStreamChunk[] = [];
      for await (const chunk of result) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1); // Only valid chunk
      expect(chunks[0].id).toBe('chunk-1');
    });

    it('should respect limit option and cancel stream', async () => {
      const mockPayload: ChatPromptRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
      };

      const mockStreamChunk: ChatStreamChunk = {
        id: 'chunk-1',
        object: 'chat.completion.chunk',
        created: '2023-07-17T10:00:00Z',
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            finish_reason: null,
            message: { content: 'Chunk ', role: 'assistant' },
          },
        ],
      };

      // Create multiple chunks
      const mockSSEEvents: HttpSSEEvent[] = Array.from(
        { length: 5 },
        (_, i) => ({
          data: JSON.stringify({ ...mockStreamChunk, id: `chunk-${i + 1}` }),
          event: 'data',
          id: `${i + 1}`,
          retry: 0,
        })
      );

      const mockRawStream = {
        [Symbol.asyncIterator]: async function* () {
          for (const event of mockSSEEvents) {
            yield event;
          }
        },
        cancel: jest.fn(),
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.stream.mockResolvedValue(mockRawStream);

      const result = await newChatMessageStream(mockPayload, { limit: 2 });

      // Test async iteration with limit
      const chunks: ChatStreamChunk[] = [];
      for await (const chunk of result) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2); // Should respect limit
      expect(mockRawStream.cancel).toHaveBeenCalled(); // Should cancel stream after limit
    });

    it('should pass abort signal to httpClient.stream', async () => {
      const mockPayload: ChatPromptRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
      };

      const abortController = new AbortController();
      const abortSignal = abortController.signal;

      const mockRawStream = {
        [Symbol.asyncIterator]: async function* () {
          // Empty stream for this test
        },
        cancel: jest.fn(),
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.stream.mockResolvedValue(mockRawStream);

      await newChatMessageStream(mockPayload, { abortSignal });

      expect(mockHttpClient.stream).toHaveBeenCalledWith(BFF_CHAT_STREAM, {
        method: 'POST',
        body: mockPayload,
        parser: 'sse',
        signal: abortSignal,
      });
    });

    it('should expose cancel method that calls rawStream.cancel', async () => {
      const mockPayload: ChatPromptRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
      };

      const mockRawStream = {
        [Symbol.asyncIterator]: async function* () {
          // Empty stream for this test
        },
        cancel: jest.fn(),
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };

      mockHttpClient.stream.mockResolvedValue(mockRawStream);

      const result = await newChatMessageStream(mockPayload);

      result.cancel();

      expect(mockRawStream.cancel).toHaveBeenCalled();
    });

    it('should preserve raw stream and metadata properties', async () => {
      const mockPayload: ChatPromptRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
      };

      const mockHeaders = { 'content-type': 'text/event-stream' };
      const mockRawStream = {
        [Symbol.asyncIterator]: async function* () {
          // Empty stream for this test
        },
        cancel: jest.fn(),
        status: 200,
        statusText: 'OK',
        headers: mockHeaders,
        ok: true,
      };

      mockHttpClient.stream.mockResolvedValue(mockRawStream);

      const result = await newChatMessageStream(mockPayload);

      expect(result.status).toBe(200);
      expect(result.statusText).toBe('OK');
      expect(result.headers).toBe(mockHeaders);
      expect(result.ok).toBe(true);
      expect(result.raw).toBe(mockRawStream);
    });
  });
});
