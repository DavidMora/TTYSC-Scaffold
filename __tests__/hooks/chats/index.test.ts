import { renderHook } from '@testing-library/react';
import {
  useChats,
  useChat,
  useCreateChat,
  useUpdateChat,
  useSendChatMessage,
  useUpdateMessageFeedback,
  CHATS_KEY,
  CHAT_KEY,
} from '@/hooks/chats';
import { dataFetcher } from '@/lib/api';
import {
  getChats,
  getChat,
  createChat,
  updateChat,
  createChatMessage,
} from '@/lib/services/chats.service';
import { submitFeedback } from '@/lib/services/feedback.service';
import { HttpClientResponse } from '@/lib/types/api/http-client';
import { Chat, BotResponse, VoteType } from '@/lib/types/chats';

// Mock the dependencies
jest.mock('@/lib/api');
jest.mock('@/lib/services/chats.service');

const mockedDataFetcher = dataFetcher as jest.Mocked<typeof dataFetcher>;
const mockedGetChats = getChats as jest.MockedFunction<typeof getChats>;
const mockedGetChat = getChat as jest.MockedFunction<typeof getChat>;
const mockedCreateChat = createChat as jest.MockedFunction<typeof createChat>;
const mockedUpdateChat = updateChat as jest.MockedFunction<typeof updateChat>;
const mockedCreateChatMessage = createChatMessage as jest.MockedFunction<
  typeof createChatMessage
>;
const mockedSubmitFeedback = submitFeedback as jest.MockedFunction<
  typeof submitFeedback
>;

jest.mock('@/lib/services/chats.service', () => ({
  getChats: jest.fn(),
  getChat: jest.fn(),
  createChat: jest.fn(),
  updateChat: jest.fn(),
  createChatMessage: jest.fn(),
}));

jest.mock('@/lib/services/feedback.service', () => ({
  submitFeedback: jest.fn(),
}));

describe('Chat Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useChats', () => {
    it('should fetch chats with correct configuration', () => {
      const mockData = [{ id: '1', title: 'Test Chat' }];
      const mockFetchData = jest.fn().mockReturnValue({ data: mockData });
      mockedDataFetcher.fetchData = mockFetchData;

      renderHook(() => useChats());

      expect(mockFetchData).toHaveBeenCalledWith(
        'chatHistory',
        expect.any(Function),
        { revalidateOnFocus: false }
      );

      const fetcherFn = mockFetchData.mock.calls[0][1];
      fetcherFn();
      expect(mockedGetChats).toHaveBeenCalled();
    });
  });

  describe('useChat', () => {
    it('should fetch specific chat with correct configuration', () => {
      const chatId = '123';
      const mockData = { id: '123', title: 'Test Chat' };
      const mockFetchData = jest.fn().mockReturnValue({ data: mockData });
      mockedDataFetcher.fetchData = mockFetchData;

      renderHook(() => useChat(chatId));

      expect(mockFetchData).toHaveBeenCalledWith(
        `chat-${chatId}`,
        expect.any(Function),
        { revalidateOnFocus: false }
      );

      const fetcherFn = mockFetchData.mock.calls[0][1];
      fetcherFn();
      expect(mockedGetChat).toHaveBeenCalledWith(chatId);
    });
  });

  describe('useCreateChat', () => {
    it('should create chat with correct configuration', async () => {
      const mockChat = { id: '123', title: 'New Chat' };
      const mockMutateData = jest
        .fn()
        .mockImplementation((mutationKey, mutationFn, options) => ({
          mutate: jest.fn(),
          mutateAsync: jest.fn(),
          mutationKey,
          mutationFn,
          options,
        }));
      mockedDataFetcher.mutateData = mockMutateData;
      mockedCreateChat.mockResolvedValue({
        data: mockChat,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      } as HttpClientResponse<Chat>);

      const onSuccess = jest.fn();
      const onError = jest.fn();
      renderHook(() => useCreateChat({ onSuccess, onError }));

      expect(mockMutateData).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        expect.objectContaining({ invalidateQueries: ['chatHistory'] })
      );

      const mutationFn = mockMutateData.mock.calls[0][1];
      const payload = { title: 'New Chat' };
      const mutationResult = await mutationFn(payload);
      expect(mockedCreateChat).toHaveBeenCalledWith(payload);
      expect(mutationResult).toEqual({
        data: mockChat,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });
    });

    it('should work without callbacks', () => {
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      renderHook(() => useCreateChat({}));
      expect(mockMutateData).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        expect.objectContaining({ invalidateQueries: ['chatHistory'] })
      );
    });

    it('should call onSuccess callback when provided', () => {
      const mockChat = { id: '123', title: 'New Chat' };
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      const onSuccess = jest.fn();
      renderHook(() => useCreateChat({ onSuccess }));

      const config = mockMutateData.mock.calls[0][2];
      config.onSuccess(mockChat);
      expect(onSuccess).toHaveBeenCalledWith(mockChat);
    });

    it('should call onError callback when provided', () => {
      const mockError = new Error('Failed to create chat');
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      const onError = jest.fn();
      renderHook(() => useCreateChat({ onError }));

      const config = mockMutateData.mock.calls[0][2];
      config.onError(mockError);
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('useUpdateChat', () => {
    it('should update chat with correct configuration', async () => {
      const mockChat = { id: '123', title: 'Updated Chat' };
      const mockMutateData = jest
        .fn()
        .mockImplementation((mutationKey, mutationFn, options) => ({
          mutate: jest.fn(),
          mutateAsync: jest.fn(),
          mutationKey,
          mutationFn,
          options,
        }));
      mockedDataFetcher.mutateData = mockMutateData;
      mockedUpdateChat.mockResolvedValue({
        data: mockChat,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      } as HttpClientResponse<Chat>);

      const onSuccess = jest.fn();
      const onError = jest.fn();
      renderHook(() => useUpdateChat({ onSuccess, onError }));

      expect(mockMutateData).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        expect.objectContaining({ invalidateQueries: ['chatHistory'] })
      );

      const mutationFn = mockMutateData.mock.calls[0][1];
      const payload = { id: '123', title: 'Updated Chat' };
      const mutationResult = await mutationFn(payload);
      expect(mockedUpdateChat).toHaveBeenCalledWith(payload);
      expect(mutationResult).toEqual({
        data: mockChat,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });
    });

    it('should call onSuccess callback when provided', () => {
      const mockChat = { id: '123', title: 'Updated Chat' };
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      const onSuccess = jest.fn();
      renderHook(() => useUpdateChat({ onSuccess }));

      const config = mockMutateData.mock.calls[0][2];
      config.onSuccess(mockChat);
      expect(onSuccess).toHaveBeenCalledWith(mockChat);
    });

    it('should call onError callback when provided', () => {
      const mockError = new Error('Failed to update chat');
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      const onError = jest.fn();
      renderHook(() => useUpdateChat({ onError }));

      const config = mockMutateData.mock.calls[0][2];
      config.onError(mockError);
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('useSendChatMessage', () => {
    it('should send chat message with correct configuration', async () => {
      const mockResponse = {
        id: 'resp123',
        object: 'chat.completion',
        model: 'gpt-4',
        created: '2023-01-01',
        choices: [
          {
            message: {
              content: 'Bot response',
              role: 'assistant' as const,
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };
      const mockMutateData = jest
        .fn()
        .mockImplementation((mutationKey, mutationFn, options) => ({
          mutate: jest.fn(),
          mutateAsync: jest.fn(),
          mutationKey,
          mutationFn,
          options,
        }));
      mockedDataFetcher.mutateData = mockMutateData;
      mockedCreateChatMessage.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      } as HttpClientResponse<BotResponse>);

      const onSuccess = jest.fn();
      const onError = jest.fn();
      renderHook(() => useSendChatMessage({ onSuccess, onError }));

      expect(mockMutateData).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        expect.objectContaining({ invalidateQueries: [] })
      );

      const mutationFn = mockMutateData.mock.calls[0][1];
      const payload = { chatId: '123', message: 'Hello' };
      const mutationResult = await mutationFn(payload);
      expect(mockedCreateChatMessage).toHaveBeenCalledWith(payload);
      expect(mutationResult).toEqual({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });
    });

    it('should call onSuccess callback when provided', () => {
      const mockResponse = {
        id: 'resp123',
        object: 'chat.completion',
        model: 'gpt-4',
        created: '2023-01-01',
        choices: [
          {
            message: {
              content: 'Bot response',
              role: 'assistant' as const,
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      const onSuccess = jest.fn();
      renderHook(() => useSendChatMessage({ onSuccess }));

      const config = mockMutateData.mock.calls[0][2];
      config.onSuccess(mockResponse);
      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });

    it('should call onError callback when provided', () => {
      const mockError = new Error('Failed to send message');
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      const onError = jest.fn();
      renderHook(() => useSendChatMessage({ onError }));

      const config = mockMutateData.mock.calls[0][2];
      config.onError(mockError);
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });
  describe('useUpdateMessageFeedback', () => {
    it('should call onSuccess callback when feedback is updated successfully', async () => {
      const mockResponse = {
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };
      (mockedSubmitFeedback as jest.Mock).mockResolvedValue(mockResponse);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const mockMutateData = jest
        .fn()
        .mockImplementation((mutationKey, mutationFn, options) => ({
          mutate: jest.fn(),
          mutateAsync: mutationFn,
          mutationKey,
          mutationFn,
          options,
        }));
      mockedDataFetcher.mutateData = mockMutateData;

      renderHook(() => useUpdateMessageFeedback({ onSuccess, onError }));

      // Get the options object passed to mutateData
      const options = mockMutateData.mock.calls[0][2];

      // Manually trigger the onSuccess callback
      options.onSuccess(mockResponse.data);

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should call onError callback when feedback update fails', async () => {
      const mockError = new Error('Failed to update feedback');
      (mockedSubmitFeedback as jest.Mock).mockRejectedValue(mockError);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const mockMutateData = jest
        .fn()
        .mockImplementation((mutationKey, mutationFn, options) => ({
          mutate: jest.fn(),
          mutateAsync: mutationFn,
          mutationKey,
          mutationFn,
          options,
        }));
      mockedDataFetcher.mutateData = mockMutateData;

      renderHook(() => useUpdateMessageFeedback({ onSuccess, onError }));

      // Get the options object passed to mutateData
      const options = mockMutateData.mock.calls[0][2];

      // Manually trigger the onError callback
      options.onError(mockError);

      expect(onError).toHaveBeenCalledWith(mockError);
    });

    it('should call submitFeedback service with correct parameters', async () => {
      const mockResponse = {
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };
      (mockedSubmitFeedback as jest.Mock).mockResolvedValue(mockResponse);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const mockMutateData = jest
        .fn()
        .mockImplementation((mutationKey, mutationFn, options) => ({
          mutate: jest.fn(),
          mutateAsync: mutationFn,
          mutationKey,
          mutationFn,
          options,
        }));
      mockedDataFetcher.mutateData = mockMutateData;

      const { result } = renderHook(() =>
        useUpdateMessageFeedback({ onSuccess, onError })
      );

      const payload = {
        messageId: 'test-message-id',
        feedbackVote: 'up' as VoteType,
      };
      await result.current.mutateAsync(payload);

      expect(mockedSubmitFeedback).toHaveBeenCalledWith({
        feedback: 'good',
        queryId: 'test-message-id',
        query: '',
        answer: '',
        comments: '',
      });
    });

    it('should handle default case in feedbackVote switch statement', async () => {
      const mockResponse = {
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };
      (mockedSubmitFeedback as jest.Mock).mockResolvedValue(mockResponse);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const mockMutateData = jest
        .fn()
        .mockImplementation((mutationKey, mutationFn, options) => ({
          mutate: jest.fn(),
          mutateAsync: mutationFn,
          mutationKey,
          mutationFn,
          options,
        }));
      mockedDataFetcher.mutateData = mockMutateData;

      const { result } = renderHook(() =>
        useUpdateMessageFeedback({ onSuccess, onError })
      );

      const payload = {
        messageId: 'test-message-id',
        feedbackVote: 'neutral' as VoteType, // This will trigger the default case
      };
      await result.current.mutateAsync(payload);

      expect(mockedSubmitFeedback).toHaveBeenCalledWith({
        feedback: 'feedback provided',
        queryId: 'test-message-id',
        query: '',
        answer: '',
        comments: '',
      });
    });

    it('should handle "down" vote case correctly', async () => {
      const mockResponse = {
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };
      (mockedSubmitFeedback as jest.Mock).mockResolvedValue(mockResponse);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const mockMutateData = jest
        .fn()
        .mockImplementation((mutationKey, mutationFn, options) => ({
          mutate: jest.fn(),
          mutateAsync: mutationFn,
          mutationKey,
          mutationFn,
          options,
        }));
      mockedDataFetcher.mutateData = mockMutateData;

      const { result } = renderHook(() =>
        useUpdateMessageFeedback({ onSuccess, onError })
      );

      const payload = {
        messageId: 'test-message-id',
        feedbackVote: 'down' as VoteType,
      };
      await result.current.mutateAsync(payload);

      expect(mockedSubmitFeedback).toHaveBeenCalledWith({
        feedback: 'bad',
        queryId: 'test-message-id',
        query: '',
        answer: '',
        comments: '',
      });
    });
  });

  describe('Constants', () => {
    it('should have correct CHATS_KEY constant', () => {
      expect(CHATS_KEY).toBe('chatHistory');
    });

    it('should generate correct CHAT_KEY for given ID', () => {
      const testId = 'test-id';
      expect(CHAT_KEY(testId)).toBe(`chat-${testId}`);
    });

    it('should generate unique CHAT_KEY for different IDs', () => {
      const id1 = 'id1';
      const id2 = 'id2';

      expect(CHAT_KEY(id1)).toBe('chat-id1');
      expect(CHAT_KEY(id2)).toBe('chat-id2');
      expect(CHAT_KEY(id1)).not.toBe(CHAT_KEY(id2));
    });
  });
});
