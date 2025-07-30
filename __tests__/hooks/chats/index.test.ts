import { renderHook } from "@testing-library/react";
import {
  useChats,
  useChat,
  useCreateChat,
  useUpdateChat,
  useSendChatMessage,
  CHATS_KEY,
  CHAT_KEY,
} from "@/hooks/chats";
import { dataFetcher } from "@/lib/api";
import {
  getChats,
  getChat,
  createChat,
  updateChat,
  createChatMessage,
} from "@/lib/services/chats.service";
import { Chat, BotResponse } from "@/lib/types/chats";
import { useMutation } from "@/hooks/useMutation";

// Mock the dependencies
jest.mock("@/lib/api", () => ({
  dataFetcher: {
    fetchData: jest.fn(),
  },
}));

jest.mock("@/lib/services/chats.service", () => ({
  getChats: jest.fn(),
  getChat: jest.fn(),
  createChat: jest.fn(),
  updateChat: jest.fn(),
  createChatMessage: jest.fn(),
}));

jest.mock("@/hooks/useMutation", () => ({
  useMutation: jest.fn(),
}));

const mockDataFetcher = dataFetcher as jest.Mocked<typeof dataFetcher>;
const mockGetChats = getChats as jest.MockedFunction<typeof getChats>;
const mockGetChat = getChat as jest.MockedFunction<typeof getChat>;
const mockCreateChat = createChat as jest.MockedFunction<typeof createChat>;
const mockUpdateChat = updateChat as jest.MockedFunction<typeof updateChat>;
const mockCreateChatMessage = createChatMessage as jest.MockedFunction<
  typeof createChatMessage
>;
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

describe("Chat Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useChats", () => {
    it("should call dataFetcher.fetchData with correct parameters", () => {
      const mockResponse = {
        data: {
          data: [],
          success: true,
          message: "Chats fetched successfully",
        },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockResponse);

      const { result } = renderHook(() => useChats());

      expect(mockDataFetcher.fetchData).toHaveBeenCalledWith(
        CHATS_KEY,
        expect.any(Function),
        {
          revalidateOnFocus: false,
        }
      );

      expect(result.current.data).toEqual({
        data: [],
        message: "Chats fetched successfully",
        success: true,
      });
    });

    it("should use getChats service function as fetcher", () => {
      mockDataFetcher.fetchData.mockReturnValue({
        data: [],
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      renderHook(() => useChats());

      // Get the fetcher function passed to dataFetcher.fetchData
      const fetcherFunction = mockDataFetcher.fetchData.mock.calls[0][1];

      // Call the fetcher function
      fetcherFunction();

      expect(mockGetChats).toHaveBeenCalledWith();
    });

    it("should return loading state correctly", () => {
      const mockResponse = {
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockResponse);

      const { result } = renderHook(() => useChats());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("should return error state correctly", () => {
      const mockError = new Error("Failed to fetch chats");
      const mockResponse = {
        data: undefined,
        error: mockError,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockResponse);

      const { result } = renderHook(() => useChats());

      expect(result.current.error).toBe(mockError);
      expect(result.current.isLoading).toBe(false);
    });

    it("should return success state with data correctly", () => {
      const mockChats: Chat[] = [
        {
          id: "1",
          date: "2023-07-17",
          title: "Test Chat",
          messages: [],
        },
      ];

      const mockResponse = {
        data: { data: mockChats },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockResponse);

      const { result } = renderHook(() => useChats());

      expect(result.current.data).toEqual({ data: mockChats });
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("useChat", () => {
    const testChatId = "test-chat-id";

    it("should call dataFetcher.fetchData with correct parameters", () => {
      const mockResponse = {
        data: { data: undefined },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockResponse);

      const { result } = renderHook(() => useChat(testChatId));

      expect(mockDataFetcher.fetchData).toHaveBeenCalledWith(
        CHAT_KEY(testChatId),
        expect.any(Function),
        {
          revalidateOnFocus: false,
        }
      );

      expect(result.current.data).toEqual({ data: undefined });
    });

    it("should use getChat service function as fetcher with correct id", () => {
      mockDataFetcher.fetchData.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      renderHook(() => useChat(testChatId));

      // Get the fetcher function passed to dataFetcher.fetchData
      const fetcherFunction = mockDataFetcher.fetchData.mock.calls[0][1];

      // Call the fetcher function
      fetcherFunction();

      expect(mockGetChat).toHaveBeenCalledWith(testChatId);
    });

    it("should generate correct chat key for different IDs", () => {
      const chatId1 = "chat-1";
      const chatId2 = "chat-2";

      mockDataFetcher.fetchData.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      renderHook(() => useChat(chatId1));
      renderHook(() => useChat(chatId2));

      expect(mockDataFetcher.fetchData).toHaveBeenNthCalledWith(
        1,
        CHAT_KEY(chatId1),
        expect.any(Function),
        {
          revalidateOnFocus: false,
        }
      );

      expect(mockDataFetcher.fetchData).toHaveBeenNthCalledWith(
        2,
        CHAT_KEY(chatId2),
        expect.any(Function),
        {
          revalidateOnFocus: false,
        }
      );
    });

    it("should return loading state correctly", () => {
      const mockResponse = {
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockResponse);

      const { result } = renderHook(() => useChat(testChatId));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("should return error state correctly", () => {
      const mockError = new Error("Failed to fetch chat");
      const mockResponse = {
        data: undefined,
        error: mockError,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockResponse);

      const { result } = renderHook(() => useChat(testChatId));

      expect(result.current.error).toBe(mockError);
      expect(result.current.isLoading).toBe(false);
    });

    it("should return success state with chat data correctly", () => {
      const mockChat: Chat = {
        id: testChatId,
        date: "2023-07-17",
        title: "Test Chat",
        messages: [
          {
            id: "msg1",
            created: "2023-07-17T10:00:00Z",
            content: "Hello!",
            role: "user",
          },
        ],
      };

      const mockResponse = {
        data: { data: mockChat },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };

      mockDataFetcher.fetchData.mockReturnValue(mockResponse);

      const { result } = renderHook(() => useChat(testChatId));

      expect(result.current.data).toEqual({ data: mockChat });
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("useCreateChat", () => {
    it("should call useMutation with correct parameters", () => {
      const mockMutationResult = {
        mutate: jest.fn(),
        data: undefined,
        error: null,
        isLoading: false,
        reset: jest.fn(),
      };

      mockUseMutation.mockReturnValue(mockMutationResult);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = renderHook(() =>
        useCreateChat({ onSuccess, onError })
      );

      expect(mockUseMutation).toHaveBeenCalledWith(expect.any(Function), {
        invalidateQueries: [CHATS_KEY],
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      });

      expect(result.current).toBe(mockMutationResult);
    });

    it("should call onSuccess callback with correct data", async () => {
      const mockChat: Chat = {
        id: "new-chat-id",
        date: "2023-07-17",
        title: "New Chat",
        messages: [],
        draft: "",
        metadata: {},
      };

      const mockResponse = {
        data: mockChat,
        status: 200,
        statusText: "OK",
        headers: {},
      };
      mockCreateChat.mockResolvedValue(mockResponse);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const mockMutationResult = {
        mutate: jest.fn(),
        data: undefined,
        error: null,
        isLoading: false,
        reset: jest.fn(),
      };

      mockUseMutation.mockReturnValue(mockMutationResult);

      renderHook(() => useCreateChat({ onSuccess, onError }));

      const mutationFunction = mockUseMutation.mock.calls[0][0];
      const onSuccessCallback = mockUseMutation.mock.calls[0][1]?.onSuccess;

      const result = await mutationFunction(undefined);
      onSuccessCallback?.(result);

      expect(onSuccess).toHaveBeenCalledWith(mockChat);
    });

    it("should call onError callback when mutation fails", async () => {
      const mockError = new Error("Failed to create chat");
      mockCreateChat.mockRejectedValue(mockError);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const mockMutationResult = {
        mutate: jest.fn(),
        data: undefined,
        error: null,
        isLoading: false,
        reset: jest.fn(),
      };

      mockUseMutation.mockReturnValue(mockMutationResult);

      renderHook(() => useCreateChat({ onSuccess, onError }));

      const mutationFunction = mockUseMutation.mock.calls[0][0];
      const onErrorCallback = mockUseMutation.mock.calls[0][1]?.onError;

      try {
        await mutationFunction(undefined);
      } catch (error) {
        onErrorCallback?.(error as Error);
      }

      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe("useUpdateChat", () => {
    it("should call onSuccess callback with correct data", async () => {
      const mockChat: Chat = {
        id: "test-id",
        date: "2023-07-17",
        title: "New Title",
        messages: [],
        draft: "",
        metadata: {},
      };
      const mockResponse = {
        data: mockChat,
        status: 200,
        statusText: "OK",
        headers: {},
      };
      mockUpdateChat.mockResolvedValue(mockResponse);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const mockMutationResult = {
        mutate: jest.fn(),
        data: undefined,
        error: null,
        isLoading: false,
        reset: jest.fn(),
      };

      mockUseMutation.mockReturnValue(mockMutationResult);

      renderHook(() => useUpdateChat({ onSuccess, onError }));

      // Get the mutation function and onSuccess callback
      const mutationFunction = mockUseMutation.mock.calls[0][0];
      const onSuccessCallback = mockUseMutation.mock.calls[0][1]?.onSuccess;

      // Call the mutation function and then the onSuccess callback
      const result = await mutationFunction({
        id: "test-id",
        data: { title: "New Title" },
      });
      onSuccessCallback?.(result);

      expect(onSuccess).toHaveBeenCalledWith(mockChat);
    });

    it("should call onError callback when mutation fails", async () => {
      const mockError = new Error("Failed to rename chat");
      mockUpdateChat.mockRejectedValue(mockError);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const mockMutationResult = {
        mutate: jest.fn(),
        data: undefined,
        error: null,
        isLoading: false,
        reset: jest.fn(),
      };

      mockUseMutation.mockReturnValue(mockMutationResult);

      renderHook(() => useUpdateChat({ onSuccess, onError }));

      const mutationFunction = mockUseMutation.mock.calls[0][0];
      const onErrorCallback = mockUseMutation.mock.calls[0][1]?.onError;

      try {
        await mutationFunction({ id: "test-id", data: { title: "New Title" } });
      } catch (error) {
        onErrorCallback?.(error as Error);
      }

      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe("useSendChatMessage", () => {
    it("should call onSuccess callback with correct data", async () => {
      const mockBotResponse: BotResponse = {
        id: "response-id",
        object: "chat.completion",
        model: "gpt-3.5-turbo",
        created: "2023-07-17T10:00:00Z",
        choices: [
          {
            message: {
              content: "Hello there!",
              role: "assistant",
            },
            finish_reason: "stop",
            index: 0,
          },
        ],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 10,
          total_tokens: 15,
        },
      };

      const mockResponse = {
        data: mockBotResponse,
        status: 200,
        statusText: "OK",
        headers: {},
      };
      mockCreateChatMessage.mockResolvedValue(mockResponse);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const mockMutationResult = {
        mutate: jest.fn(),
        data: undefined,
        error: null,
        isLoading: false,
        reset: jest.fn(),
      };

      mockUseMutation.mockReturnValue(mockMutationResult);

      renderHook(() => useSendChatMessage({ onSuccess, onError }));

      const mutationFunction = mockUseMutation.mock.calls[0][0];
      const onSuccessCallback = mockUseMutation.mock.calls[0][1]?.onSuccess;

      const result = await mutationFunction({
        chatId: "test-id",
        messages: [{ role: "user", content: "Hello" }],
        use_knowledge_base: true,
      });
      onSuccessCallback?.(result);

      expect(onSuccess).toHaveBeenCalledWith(mockBotResponse);
    });

    it("should call onError callback when mutation fails", async () => {
      const mockError = new Error("Failed to send message");
      mockCreateChatMessage.mockRejectedValue(mockError);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const mockMutationResult = {
        mutate: jest.fn(),
        data: undefined,
        error: null,
        isLoading: false,
        reset: jest.fn(),
      };

      mockUseMutation.mockReturnValue(mockMutationResult);

      renderHook(() => useSendChatMessage({ onSuccess, onError }));

      const mutationFunction = mockUseMutation.mock.calls[0][0];
      const onErrorCallback = mockUseMutation.mock.calls[0][1]?.onError;

      try {
        await mutationFunction({
          chatId: "test-id",
          messages: [{ role: "user", content: "Hello" }],
          use_knowledge_base: false,
        });
      } catch (error) {
        onErrorCallback?.(error as Error);
      }

      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe("Constants", () => {
    it("should have correct CHATS_KEY constant", () => {
      expect(CHATS_KEY).toBe("chatHistory");
    });

    it("should generate correct CHAT_KEY for given ID", () => {
      const testId = "test-id";
      expect(CHAT_KEY(testId)).toBe(`chat-${testId}`);
    });

    it("should generate unique CHAT_KEY for different IDs", () => {
      const id1 = "id1";
      const id2 = "id2";

      expect(CHAT_KEY(id1)).toBe("chat-id1");
      expect(CHAT_KEY(id2)).toBe("chat-id2");
      expect(CHAT_KEY(id1)).not.toBe(CHAT_KEY(id2));
    });
  });
});
