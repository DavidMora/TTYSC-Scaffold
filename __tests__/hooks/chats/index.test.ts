import { renderHook } from "@testing-library/react";
import { useChats, useChat, CHATS_KEY, CHAT_KEY } from "@/hooks/chats";
import { dataFetcher } from "@/lib/api";
import { getChats, getChat } from "@/services/chats.service";
import { Chat } from "@/lib/types/chats";

// Mock the dependencies
jest.mock("@/lib/api", () => ({
  dataFetcher: {
    fetchData: jest.fn(),
  },
}));

jest.mock("@/services/chats.service", () => ({
  getChats: jest.fn(),
  getChat: jest.fn(),
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

      expect(result.current.data).toEqual([]);
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
          participants: [{ id: "user1", name: "John Doe" }],
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

      expect(result.current.data).toBe(mockChats);
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

      expect(result.current.data).toBeUndefined();
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
        participants: [
          { id: "user1", name: "John Doe" },
          { id: "user2", name: "Jane Smith" },
        ],
        messages: [
          {
            id: "msg1",
            sender: "user1",
            timestamp: "2023-07-17T10:00:00Z",
            content: "Hello!",
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

      expect(result.current.data).toBe(mockChat);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
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
