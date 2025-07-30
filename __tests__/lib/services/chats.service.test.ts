import { apiClient } from "@/lib/api";
import { CHATS, CHAT, CHAT_MESSAGE } from "@/lib/constants/api/routes";
import {
  getChats,
  getChat,
  createChat,
  updateChat,
  deleteChat,
  createChatMessage,
} from "@/lib/services/chats.service";
import {
  Chat,
  BotResponse,
  CreateChatMessageRequest,
  UpdateChatRequest,
} from "@/lib/types/chats";
import { HttpClientResponse } from "@/lib/types/api/http-client";
import { BaseResponse } from "@/lib/types/http/responses";

// Mock the apiClient
jest.mock("@/lib/api", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const generalMockChat: Chat = {
  id: "test-chat-id",
  date: "2023-07-17",
  title: "Team Meeting",
  messages: [],
  draft: "",
  metadata: {
    analysis: {
      key: "test-analysis-key",
      name: "Test Analysis",
    },
    organizations: {
      key: "test-organization-key",
      name: "Test Organization",
    },
    CM: {
      key: "test-cm-key",
      name: "Test CM",
    },
    SKU: {
      key: "test-sku-key",
      name: "Test SKU",
    },
    NVPN: {
      key: "test-nvpn-key",
      name: "Test NVPN",
    },
  },
};

const mockHttpClient = apiClient as jest.Mocked<typeof apiClient>;

describe("Chats Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getChats", () => {
    it("should call httpClient.get with correct URL", async () => {
      const mockResponse: HttpClientResponse<Chat[]> = {
        data: [],
        status: 200,
        statusText: "OK",
        headers: {},
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getChats();

      expect(mockHttpClient.get).toHaveBeenCalledWith(CHATS);
      expect(result).toBe(mockResponse);
    });

    it("should return chat list successfully", async () => {
      const mockChats: Chat[] = [
        {
          ...generalMockChat,
        },
        {
          ...generalMockChat,
          id: "test-chat-id-2",
          title: "Project Discussion",
        },
      ];

      const mockResponse: HttpClientResponse<BaseResponse<Chat[]>> = {
        data: {
          data: mockChats,
          message: "Chats retrieved successfully",
          success: true,
        },
        status: 200,
        statusText: "OK",
        headers: {},
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getChats();

      expect(result.data.data).toEqual(mockChats);
      expect(result.status).toBe(200);
    });

    it("should handle error response", async () => {
      const mockError = new Error("Network error");
      mockHttpClient.get.mockRejectedValue(mockError);

      await expect(getChats()).rejects.toThrow("Network error");
    });
  });

  describe("getChat", () => {
    const testChatId = "test-chat-id";

    it("should call httpClient.get with correct URL and ID", async () => {
      const mockResponse: HttpClientResponse<Chat> = {
        data: {} as Chat,
        status: 200,
        statusText: "OK",
        headers: {},
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getChat(testChatId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(CHAT(testChatId));
      expect(result).toBe(mockResponse);
    });

    it("should return specific chat successfully", async () => {
      const mockChat: Chat = {
        id: testChatId,
        date: "2023-07-17",
        title: "Team Meeting",
        draft: "",
        metadata: generalMockChat.metadata,
        messages: [
          {
            id: "msg1",
            created: "2023-07-17T10:00:00Z",
            content: "Hello everyone!",
            role: "user",
          },
          {
            id: "msg2",
            created: "2023-07-17T10:01:00Z",
            content: "Hi John!",
            role: "assistant",
          },
        ],
      };

      const mockResponse: HttpClientResponse<Chat> = {
        data: mockChat,
        status: 200,
        statusText: "OK",
        headers: {},
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getChat(testChatId);

      expect(result.data).toEqual(mockChat);
      expect(result.status).toBe(200);
    });

    it("should handle chat not found", async () => {
      const mockResponse: HttpClientResponse<Chat> = {
        data: {} as Chat,
        status: 404,
        statusText: "Not Found",
        headers: {},
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getChat("non-existent-id");

      expect(result.status).toBe(404);
      expect(result.statusText).toBe("Not Found");
    });

    it("should handle error response", async () => {
      const mockError = new Error("Network error");
      mockHttpClient.get.mockRejectedValue(mockError);

      await expect(getChat(testChatId)).rejects.toThrow("Network error");
    });
  });

  describe("createChat", () => {
    it("should call httpClient.post with correct URL and payload", async () => {
      const mockCreatedChat: Chat = {
        id: "new-chat-id",
        date: "2023-07-17",
        title: "New Chat",
        messages: [],
        draft: "",
        metadata: generalMockChat.metadata,
      };

      const mockResponse: HttpClientResponse<Chat> = {
        data: mockCreatedChat,
        status: 201,
        statusText: "Created",
        headers: {},
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await createChat({ title: "New Chat" });

      expect(mockHttpClient.post).toHaveBeenCalledWith(CHATS, {
        title: "New Chat",
      });
      expect(result).toBe(mockResponse);
      expect(result.data).toEqual(mockCreatedChat);
      expect(result.status).toBe(201);
    });

    it("should handle validation errors", async () => {
      const mockResponse: HttpClientResponse<Chat> = {
        data: {} as Chat,
        status: 400,
        statusText: "Bad Request",
        headers: {},
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await createChat({ title: "New Chat" });

      expect(result.status).toBe(400);
      expect(result.statusText).toBe("Bad Request");
    });

    it("should handle error response", async () => {
      const mockError = new Error("Server error");
      mockHttpClient.post.mockRejectedValue(mockError);

      await expect(createChat({ title: "New Chat" })).rejects.toThrow(
        "Server error"
      );
    });
  });

  describe("updateChat", () => {
    it("should call httpClient.patch with correct URL and payload", async () => {
      const mockPayload: UpdateChatRequest = {
        id: "chat-to-update",
        title: "Updated Chat Title",
      };

      const mockUpdatedChat: Chat = {
        id: "chat-to-update",
        date: "2023-07-17",
        title: "Updated Chat Title",
        draft: "",
        metadata: generalMockChat.metadata,
        messages: [],
      };

      const mockResponse: HttpClientResponse<Chat> = {
        data: mockUpdatedChat,
        status: 200,
        statusText: "OK",
        headers: {},
      };

      mockHttpClient.patch.mockResolvedValue(mockResponse);

      const result = await updateChat(mockPayload);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        CHAT(mockPayload.id),
        mockPayload
      );
      expect(result).toBe(mockResponse);
      expect(result.data).toEqual(mockUpdatedChat);
    });

    it("should handle partial updates", async () => {
      const mockPayload: UpdateChatRequest = {
        id: "chat-id",
        title: "Updated Chat Title",
      };

      const mockResponse: HttpClientResponse<Chat> = {
        data: {} as Chat,
        status: 200,
        statusText: "OK",
        headers: {},
      };

      mockHttpClient.patch.mockResolvedValue(mockResponse);

      const result = await updateChat(mockPayload);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        CHAT(mockPayload.id),
        mockPayload
      );
      expect(result.status).toBe(200);
    });

    it("should handle chat not found during update", async () => {
      const mockPayload: UpdateChatRequest = {
        id: "non-existent-chat",
        title: "Updated Title",
      };

      const mockResponse: HttpClientResponse<Chat> = {
        data: {} as Chat,
        status: 404,
        statusText: "Not Found",
        headers: {},
      };

      mockHttpClient.patch.mockResolvedValue(mockResponse);

      const result = await updateChat(mockPayload);

      expect(result.status).toBe(404);
      expect(result.statusText).toBe("Not Found");
    });

    it("should handle error response", async () => {
      const mockPayload: UpdateChatRequest = {
        id: "chat-id",
        title: "Updated Title",
      };

      const mockError = new Error("Server error");
      mockHttpClient.patch.mockRejectedValue(mockError);

      await expect(updateChat(mockPayload)).rejects.toThrow("Server error");
    });
  });

  describe("deleteChat", () => {
    const testChatId = "chat-to-delete";

    it("should call httpClient.delete with correct URL", async () => {
      const mockResponse: HttpClientResponse<void> = {
        data: undefined,
        status: 204,
        statusText: "No Content",
        headers: {},
      };

      mockHttpClient.delete.mockResolvedValue(mockResponse);

      const result = await deleteChat(testChatId);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(CHAT(testChatId));
      expect(result).toBe(mockResponse);
      expect(result.status).toBe(204);
    });

    it("should handle successful deletion", async () => {
      const mockResponse: HttpClientResponse<void> = {
        data: undefined,
        status: 204,
        statusText: "No Content",
        headers: {},
      };

      mockHttpClient.delete.mockResolvedValue(mockResponse);

      const result = await deleteChat(testChatId);

      expect(result.data).toBeUndefined();
      expect(result.status).toBe(204);
    });

    it("should handle chat not found during deletion", async () => {
      const mockResponse: HttpClientResponse<void> = {
        data: undefined,
        status: 404,
        statusText: "Not Found",
        headers: {},
      };

      mockHttpClient.delete.mockResolvedValue(mockResponse);

      const result = await deleteChat("non-existent-chat");

      expect(result.status).toBe(404);
      expect(result.statusText).toBe("Not Found");
    });

    it("should handle error response", async () => {
      const mockError = new Error("Server error");
      mockHttpClient.delete.mockRejectedValue(mockError);

      await expect(deleteChat(testChatId)).rejects.toThrow("Server error");
    });

    it("should handle unauthorized deletion", async () => {
      const mockResponse: HttpClientResponse<void> = {
        data: undefined,
        status: 403,
        statusText: "Forbidden",
        headers: {},
      };

      mockHttpClient.delete.mockResolvedValue(mockResponse);

      const result = await deleteChat(testChatId);

      expect(result.status).toBe(403);
      expect(result.statusText).toBe("Forbidden");
    });
  });

  describe("createChatMessage", () => {
    it("should call httpClient.post with correct URL and payload", async () => {
      const mockPayload: CreateChatMessageRequest = {
        chatId: "chat-id",
        messages: [],
        use_knowledge_base: false,
      };

      const mockResponse: HttpClientResponse<BotResponse> = {
        data: {} as BotResponse,
        status: 200,
        statusText: "OK",
        headers: {},
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await createChatMessage(mockPayload);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        CHAT_MESSAGE,
        mockPayload
      );
      expect(result).toBe(mockResponse);
    });

    it("should handle error response", async () => {
      const mockError = new Error("Failed to send message");
      mockHttpClient.post.mockRejectedValue(mockError);

      const mockPayload: CreateChatMessageRequest = {
        chatId: "chat-id",
        messages: [{ role: "user", content: "Hello" }],
        use_knowledge_base: false,
      };

      await expect(createChatMessage(mockPayload)).rejects.toThrow(
        "Failed to send message"
      );
    });

    it("should return bot response successfully", async () => {
      const mockBotResponse: BotResponse = {
        id: "response-id",
        object: "chat.completion",
        model: "gpt-3.5-turbo",
        created: "2023-07-17T10:00:00Z",
        choices: [
          {
            message: { content: "Hello!", role: "assistant" },
            finish_reason: "stop",
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
        statusText: "OK",
        headers: {},
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const mockPayload: CreateChatMessageRequest = {
        chatId: "chat-id",
        messages: [{ role: "user", content: "Hello" }],
        use_knowledge_base: true,
      };

      const result = await createChatMessage(mockPayload);

      expect(result.data).toEqual(mockBotResponse);
      expect(result.status).toBe(200);
    });
  });

  describe("Integration with API routes", () => {
    it("should use correct CHATS endpoint", () => {
      expect(CHATS).toBe("http://localhost:5000/chats");
    });

    it("should generate correct CHAT endpoint for specific ID", () => {
      const chatId = "test-id";
      expect(CHAT(chatId)).toBe(`http://localhost:5000/chats/${chatId}`);
    });
  });
});
