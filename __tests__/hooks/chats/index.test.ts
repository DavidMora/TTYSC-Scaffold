import { renderHook } from "@testing-library/react";
import {
  useChats,
  useChat,
  useCreateChat,
  useUpdateChat,
  useSendChatMessage,
} from "@/hooks/chats";
import { dataFetcher } from "@/lib/api";
import {
  getChats,
  getChat,
  createChat,
  updateChat,
  createChatMessage,
} from "@/lib/services/chats.service";
import { HttpClientResponse } from "@/lib/types/api/http-client";
import { Chat, BotResponse } from "@/lib/types/chats";

// Mock the dependencies
jest.mock("@/lib/api");
jest.mock("@/lib/services/chats.service");

const mockedDataFetcher = dataFetcher as jest.Mocked<typeof dataFetcher>;
const mockedGetChats = getChats as jest.MockedFunction<typeof getChats>;
const mockedGetChat = getChat as jest.MockedFunction<typeof getChat>;
const mockedCreateChat = createChat as jest.MockedFunction<typeof createChat>;
const mockedUpdateChat = updateChat as jest.MockedFunction<typeof updateChat>;
const mockedCreateChatMessage = createChatMessage as jest.MockedFunction<
  typeof createChatMessage
>;

describe("Chat Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useChats", () => {
    it("should fetch chats with correct configuration", () => {
      const mockData = [{ id: "1", title: "Test Chat" }];
      const mockFetchData = jest.fn().mockReturnValue({ data: mockData });
      mockedDataFetcher.fetchData = mockFetchData;

      renderHook(() => useChats());

      expect(mockFetchData).toHaveBeenCalledWith(
        "chatHistory",
        expect.any(Function),
        { revalidateOnFocus: false }
      );

      const fetcherFn = mockFetchData.mock.calls[0][1];
      fetcherFn();
      expect(mockedGetChats).toHaveBeenCalled();
    });
  });

  describe("useChat", () => {
    it("should fetch specific chat with correct configuration", () => {
      const chatId = "123";
      const mockData = { id: "123", title: "Test Chat" };
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

  describe("useCreateChat", () => {
    it("should create chat with correct configuration", async () => {
      const mockChat = { id: "123", title: "New Chat" };
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;
      mockedCreateChat.mockResolvedValue({
        data: mockChat,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<Chat>);

      const onSuccess = jest.fn();
      const onError = jest.fn();
      renderHook(() => useCreateChat({ onSuccess, onError }));

      expect(mockMutateData).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ invalidateQueries: ["chatHistory"] })
      );

      const mutationFn = mockMutateData.mock.calls[0][0];
      const payload = { title: "New Chat" };
      const mutationResult = await mutationFn(payload);
      expect(mockedCreateChat).toHaveBeenCalledWith(payload);
      expect(mutationResult).toEqual({
        data: mockChat,
        status: 200,
        statusText: "OK",
      });
    });

    it("should work without callbacks", () => {
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      renderHook(() => useCreateChat({}));
      expect(mockMutateData).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ invalidateQueries: ["chatHistory"] })
      );
    });

    it("should call onSuccess callback when provided", () => {
      const mockChat = { id: "123", title: "New Chat" };
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      const onSuccess = jest.fn();
      renderHook(() => useCreateChat({ onSuccess }));

      const config = mockMutateData.mock.calls[0][1];
      config.onSuccess(mockChat);
      expect(onSuccess).toHaveBeenCalledWith(mockChat);
    });

    it("should call onError callback when provided", () => {
      const mockError = new Error("Failed to create chat");
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      const onError = jest.fn();
      renderHook(() => useCreateChat({ onError }));

      const config = mockMutateData.mock.calls[0][1];
      config.onError(mockError);
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe("useUpdateChat", () => {
    it("should update chat with correct configuration", async () => {
      const mockChat = { id: "123", title: "Updated Chat" };
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;
      mockedUpdateChat.mockResolvedValue({
        data: mockChat,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<Chat>);

      const onSuccess = jest.fn();
      const onError = jest.fn();
      renderHook(() => useUpdateChat({ onSuccess, onError }));

      expect(mockMutateData).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ invalidateQueries: ["chatHistory"] })
      );

      const mutationFn = mockMutateData.mock.calls[0][0];
      const payload = { id: "123", title: "Updated Chat" };
      const mutationResult = await mutationFn(payload);
      expect(mockedUpdateChat).toHaveBeenCalledWith(payload);
      expect(mutationResult).toEqual({
        data: mockChat,
        status: 200,
        statusText: "OK",
      });
    });

    it("should call onSuccess callback when provided", () => {
      const mockChat = { id: "123", title: "Updated Chat" };
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      const onSuccess = jest.fn();
      renderHook(() => useUpdateChat({ onSuccess }));

      const config = mockMutateData.mock.calls[0][1];
      config.onSuccess(mockChat);
      expect(onSuccess).toHaveBeenCalledWith(mockChat);
    });

    it("should call onError callback when provided", () => {
      const mockError = new Error("Failed to update chat");
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      const onError = jest.fn();
      renderHook(() => useUpdateChat({ onError }));

      const config = mockMutateData.mock.calls[0][1];
      config.onError(mockError);
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe("useSendChatMessage", () => {
    it("should send chat message with correct configuration", async () => {
      const mockResponse = {
        id: "resp123",
        object: "chat.completion",
        model: "gpt-4",
        created: "2023-01-01",
        choices: [
          {
            message: {
              content: "Bot response",
              role: "assistant" as const,
            },
            finish_reason: "stop",
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
      mockedCreateChatMessage.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        ok: true,
      } as HttpClientResponse<BotResponse>);

      const onSuccess = jest.fn();
      const onError = jest.fn();
      renderHook(() => useSendChatMessage({ onSuccess, onError }));

      expect(mockMutateData).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ invalidateQueries: [] })
      );

      const mutationFn = mockMutateData.mock.calls[0][0];
      const payload = { chatId: "123", message: "Hello" };
      const mutationResult = await mutationFn(payload);
      expect(mockedCreateChatMessage).toHaveBeenCalledWith(payload);
      expect(mutationResult).toEqual({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        ok: true,
      });
    });

    it("should call onSuccess callback when provided", () => {
      const mockResponse = {
        id: "resp123",
        object: "chat.completion",
        model: "gpt-4",
        created: "2023-01-01",
        choices: [
          {
            message: {
              content: "Bot response",
              role: "assistant" as const,
            },
            finish_reason: "stop",
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

      const config = mockMutateData.mock.calls[0][1];
      config.onSuccess(mockResponse);
      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });

    it("should call onError callback when provided", () => {
      const mockError = new Error("Failed to send message");
      const mockMutateData = jest.fn().mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      });
      mockedDataFetcher.mutateData = mockMutateData;

      const onError = jest.fn();
      renderHook(() => useSendChatMessage({ onError }));

      const config = mockMutateData.mock.calls[0][1];
      config.onError(mockError);
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });
});
