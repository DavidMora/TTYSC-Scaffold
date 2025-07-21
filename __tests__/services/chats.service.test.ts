import { httpClient } from "@/lib/api";
import { CHATS, CHAT } from "@/lib/constants/api/routes";
import {
  getChats,
  getChat,
  createChat,
  updateChat,
  deleteChat,
} from "@/services/chats.service";
import { Chat, CreateChatRequest, UpdateChatRequest } from "@/lib/types/chats";
import { HttpClientResponse } from "@/lib/types/api/http-client";

// Mock the httpClient
jest.mock("@/lib/api", () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

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
          id: "1",
          date: "2023-07-17",
          title: "Team Meeting",
          participants: [
            { id: "user1", name: "John Doe" },
            { id: "user2", name: "Jane Smith" },
          ],
          messages: [],
        },
        {
          id: "2",
          date: "2023-07-16",
          title: "Project Discussion",
          participants: [
            { id: "user1", name: "John Doe" },
            { id: "user3", name: "Bob Johnson" },
          ],
          messages: [],
        },
      ];

      const mockResponse: HttpClientResponse<Chat[]> = {
        data: mockChats,
        status: 200,
        statusText: "OK",
        headers: {},
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getChats();

      expect(result.data).toEqual(mockChats);
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
        participants: [
          { id: "user1", name: "John Doe" },
          { id: "user2", name: "Jane Smith" },
        ],
        messages: [
          {
            id: "msg1",
            sender: "user1",
            timestamp: "2023-07-17T10:00:00Z",
            content: "Hello everyone!",
          },
          {
            id: "msg2",
            sender: "user2",
            timestamp: "2023-07-17T10:01:00Z",
            content: "Hi John!",
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
      const mockPayload: CreateChatRequest = {
        title: "New Chat",
        participants: [
          { id: "user1", name: "John Doe" },
          { id: "user2", name: "Jane Smith" },
        ],
      };

      const mockCreatedChat: Chat = {
        id: "new-chat-id",
        date: "2023-07-17",
        ...mockPayload,
        messages: [],
      };

      const mockResponse: HttpClientResponse<Chat> = {
        data: mockCreatedChat,
        status: 201,
        statusText: "Created",
        headers: {},
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await createChat(mockPayload);

      expect(mockHttpClient.post).toHaveBeenCalledWith(CHATS, mockPayload);
      expect(result).toBe(mockResponse);
      expect(result.data).toEqual(mockCreatedChat);
      expect(result.status).toBe(201);
    });

    it("should handle validation errors", async () => {
      const invalidPayload: CreateChatRequest = {
        title: "",
        participants: [],
      };

      const mockResponse: HttpClientResponse<Chat> = {
        data: {} as Chat,
        status: 400,
        statusText: "Bad Request",
        headers: {},
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await createChat(invalidPayload);

      expect(result.status).toBe(400);
      expect(result.statusText).toBe("Bad Request");
    });

    it("should handle error response", async () => {
      const mockPayload: CreateChatRequest = {
        title: "New Chat",
        participants: [{ id: "user1", name: "John Doe" }],
      };

      const mockError = new Error("Server error");
      mockHttpClient.post.mockRejectedValue(mockError);

      await expect(createChat(mockPayload)).rejects.toThrow("Server error");
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
        participants: [{ id: "user1", name: "John Doe" }],
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
        participants: [
          { id: "user1", name: "John Doe" },
          { id: "user2", name: "Jane Smith" },
          { id: "user3", name: "Bob Johnson" },
        ],
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
