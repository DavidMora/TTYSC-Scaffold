import {
  BASE,
  DEFINITIONS,
  DEFINITION,
  DEFINITION_DETAILS,
  CHATS,
  CHAT,
  CHAT_MESSAGES,
  CHAT_MESSAGE,
} from "@/lib/constants/api/routes";

describe("API Routes", () => {
  describe("Base URL", () => {
    it("should have correct base URL", () => {
      expect(BASE).toBe("http://localhost:5000");
    });
  });

  describe("Definitions endpoints", () => {
    it("should have correct definitions endpoint", () => {
      expect(DEFINITIONS).toBe(`${BASE}/definitions`);
      expect(DEFINITIONS).toBe("http://localhost:5000/definitions");
    });

    it("should generate correct definition endpoint with ID", () => {
      const testId = "test-definition-id";
      expect(DEFINITION(testId)).toBe(`${BASE}/definitions/${testId}`);
      expect(DEFINITION(testId)).toBe(
        "http://localhost:5000/definitions/test-definition-id"
      );
    });

    it("should generate correct definition details endpoint with ID", () => {
      const testId = "test-definition-id";
      expect(DEFINITION_DETAILS(testId)).toBe(
        `${BASE}/definitions/${testId}/details`
      );
      expect(DEFINITION_DETAILS(testId)).toBe(
        "http://localhost:5000/definitions/test-definition-id/details"
      );
    });

    it("should handle different definition IDs", () => {
      const id1 = "definition-1";
      const id2 = "definition-2";

      expect(DEFINITION(id1)).toBe(
        "http://localhost:5000/definitions/definition-1"
      );
      expect(DEFINITION(id2)).toBe(
        "http://localhost:5000/definitions/definition-2"
      );
      expect(DEFINITION(id1)).not.toBe(DEFINITION(id2));
    });
  });

  describe("Chat endpoints", () => {
    it("should have correct chats endpoint", () => {
      expect(CHATS).toBe(`${BASE}/chats`);
      expect(CHATS).toBe("http://localhost:5000/chats");
    });

    it("should generate correct chat endpoint with ID", () => {
      const testChatId = "test-chat-id";
      expect(CHAT(testChatId)).toBe(`${BASE}/chats/${testChatId}`);
      expect(CHAT(testChatId)).toBe("http://localhost:5000/chats/test-chat-id");
    });

    it("should generate correct chat messages endpoint with chat ID", () => {
      const testChatId = "test-chat-id";
      expect(CHAT_MESSAGES(testChatId)).toBe(
        `${BASE}/chats/${testChatId}/messages`
      );
      expect(CHAT_MESSAGES(testChatId)).toBe(
        "http://localhost:5000/chats/test-chat-id/messages"
      );
    });

    it("should generate correct chat message endpoint with chat and message IDs", () => {
      const testChatId = "test-chat-id";
      const testMessageId = "test-message-id";

      expect(CHAT_MESSAGE(testChatId, testMessageId)).toBe(
        `${BASE}/chats/${testChatId}/messages/${testMessageId}`
      );
      expect(CHAT_MESSAGE(testChatId, testMessageId)).toBe(
        "http://localhost:5000/chats/test-chat-id/messages/test-message-id"
      );
    });

    it("should handle different chat IDs", () => {
      const chatId1 = "chat-1";
      const chatId2 = "chat-2";

      expect(CHAT(chatId1)).toBe("http://localhost:5000/chats/chat-1");
      expect(CHAT(chatId2)).toBe("http://localhost:5000/chats/chat-2");
      expect(CHAT(chatId1)).not.toBe(CHAT(chatId2));
    });

    it("should handle different message IDs for same chat", () => {
      const chatId = "test-chat";
      const messageId1 = "message-1";
      const messageId2 = "message-2";

      expect(CHAT_MESSAGE(chatId, messageId1)).toBe(
        "http://localhost:5000/chats/test-chat/messages/message-1"
      );
      expect(CHAT_MESSAGE(chatId, messageId2)).toBe(
        "http://localhost:5000/chats/test-chat/messages/message-2"
      );
      expect(CHAT_MESSAGE(chatId, messageId1)).not.toBe(
        CHAT_MESSAGE(chatId, messageId2)
      );
    });

    it("should handle special characters in IDs", () => {
      const chatIdWithSpecialChars = "chat-with-special_chars.123";
      const messageIdWithSpecialChars = "message-with-special_chars.456";

      expect(CHAT(chatIdWithSpecialChars)).toBe(
        "http://localhost:5000/chats/chat-with-special_chars.123"
      );
      expect(CHAT_MESSAGES(chatIdWithSpecialChars)).toBe(
        "http://localhost:5000/chats/chat-with-special_chars.123/messages"
      );
      expect(
        CHAT_MESSAGE(chatIdWithSpecialChars, messageIdWithSpecialChars)
      ).toBe(
        "http://localhost:5000/chats/chat-with-special_chars.123/messages/message-with-special_chars.456"
      );
    });

    it("should handle empty string IDs gracefully", () => {
      const emptyId = "";

      expect(CHAT(emptyId)).toBe("http://localhost:5000/chats/");
      expect(CHAT_MESSAGES(emptyId)).toBe(
        "http://localhost:5000/chats//messages"
      );
      expect(CHAT_MESSAGE(emptyId, emptyId)).toBe(
        "http://localhost:5000/chats//messages/"
      );
    });
  });

  describe("URL consistency", () => {
    it("should use consistent base URL across all endpoints", () => {
      const testId = "test-id";

      expect(DEFINITIONS.startsWith(BASE)).toBe(true);
      expect(DEFINITION(testId).startsWith(BASE)).toBe(true);
      expect(DEFINITION_DETAILS(testId).startsWith(BASE)).toBe(true);
      expect(CHATS.startsWith(BASE)).toBe(true);
      expect(CHAT(testId).startsWith(BASE)).toBe(true);
      expect(CHAT_MESSAGES(testId).startsWith(BASE)).toBe(true);
      expect(CHAT_MESSAGE(testId, testId).startsWith(BASE)).toBe(true);
    });

    it("should have proper URL structure without double slashes in path", () => {
      const testId = "test-id";

      // Check that there are no double slashes in the path part of URLs (after the protocol)
      expect(DEFINITIONS.replace("http://", "")).not.toMatch(/\/\//);
      expect(DEFINITION(testId).replace("http://", "")).not.toMatch(/\/\//);
      expect(DEFINITION_DETAILS(testId).replace("http://", "")).not.toMatch(
        /\/\//
      );
      expect(CHATS.replace("http://", "")).not.toMatch(/\/\//);
      expect(CHAT(testId).replace("http://", "")).not.toMatch(/\/\//);
      expect(CHAT_MESSAGES(testId).replace("http://", "")).not.toMatch(/\/\//);
      expect(CHAT_MESSAGE(testId, testId).replace("http://", "")).not.toMatch(
        /\/\//
      );
    });
  });
});
