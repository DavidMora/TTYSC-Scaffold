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
import { Chat } from "@/lib/types/chats";

// Mock the dependencies
jest.mock("@/lib/api", () => ({
  dataFetcher: {
    fetchData: jest.fn(),
    mutateData: jest.fn(),
  },
}));

jest.mock("@/lib/services/chats.service", () => ({
  getChats: jest.fn(),
  getChat: jest.fn(),
  createChat: jest.fn(),
  updateChat: jest.fn(),
  createChatMessage: jest.fn(),
}));

const mockDataFetcher = dataFetcher as jest.Mocked<typeof dataFetcher>;
const mockGetChats = getChats as jest.MockedFunction<typeof getChats>;
const mockGetChat = getChat as jest.MockedFunction<typeof getChat>;

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
    it("should call dataFetcher.mutateData with correct parameters", () => {
      const mockMutationResult = {
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
        data: undefined,
        error: undefined,
        isLoading: false,
        isSuccess: false,
        isError: false,
        isIdle: true,
        reset: jest.fn(),
      };

      mockDataFetcher.mutateData.mockReturnValue(mockMutationResult);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = renderHook(() =>
        useCreateChat({ onSuccess, onError })
      );

      expect(mockDataFetcher.mutateData).toHaveBeenCalledWith(
        expect.any(Function),
        {
          invalidateQueries: [CHATS_KEY],
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }
      );

      expect(result.current).toBe(mockMutationResult);
    });
  });

  describe("useUpdateChat", () => {
    it("should call dataFetcher.mutateData with correct parameters", () => {
      const mockMutationResult = {
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
        data: undefined,
        error: undefined,
        isLoading: false,
        isSuccess: false,
        isError: false,
        isIdle: true,
        reset: jest.fn(),
      };

      mockDataFetcher.mutateData.mockReturnValue(mockMutationResult);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = renderHook(() =>
        useUpdateChat({ onSuccess, onError })
      );

      expect(mockDataFetcher.mutateData).toHaveBeenCalledWith(
        expect.any(Function),
        {
          invalidateQueries: [CHATS_KEY],
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }
      );

      expect(result.current).toBe(mockMutationResult);
    });
  });

  describe("useSendChatMessage", () => {
    it("should call dataFetcher.mutateData with correct parameters", () => {
      const mockMutationResult = {
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
        data: undefined,
        error: undefined,
        isLoading: false,
        isSuccess: false,
        isError: false,
        isIdle: true,
        reset: jest.fn(),
      };

      mockDataFetcher.mutateData.mockReturnValue(mockMutationResult);

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = renderHook(() =>
        useSendChatMessage({ onSuccess, onError })
      );

      expect(mockDataFetcher.mutateData).toHaveBeenCalledWith(
        expect.any(Function),
        {
          invalidateQueries: [],
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }
      );

      expect(result.current).toBe(mockMutationResult);
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
