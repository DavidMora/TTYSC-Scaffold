import {
  ChatMessage,
  Chat,
  CreateChatMessageRequest,
  UpdateChatRequest,
} from "@/lib/types/chats";

describe("Chat Types", () => {


  describe("ChatMessage", () => {
    it("should define correct interface structure", () => {
      const message: ChatMessage = {
        id: "msg123",
        role: "user",
        created: "2023-07-17T10:00:00Z",
        content: "Hello, this is a test message!",
      };

      expect(message.id).toBe("msg123");
      expect(message.role).toBe("user");
      expect(message.content).toBe("Hello, this is a test message!");
      expect(typeof message.id).toBe("string");
      expect(typeof message.role).toBe("string");
      expect(typeof message.content).toBe("string");
    });

    it("should allow array of messages", () => {
      const messages: ChatMessage[] = [
        {
          id: "msg1",
          role: "user",
          content: "First message",
          created: "2023-07-17T10:00:00Z",
        },
        {
          id: "msg2",
          role: "assistant",
          content: "Second message",
          created: "2023-07-17T10:01:00Z",
        },
      ];

      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe("First message");
      expect(messages[1].role).toBe("assistant");
    });
  });

  describe("Chat", () => {
    it("should define correct interface structure", () => {
      const chat: Chat = {
        id: "chat123",
        date: "2023-07-17",
        title: "Team Meeting",
        messages: [
          {
            id: "msg1",
            role: "user",
            content: "Hello everyone!",
            created: "2023-07-17T10:00:00Z",
          },
        ],
      };

      expect(chat.id).toBe("chat123");
      expect(chat.date).toBe("2023-07-17");
      expect(chat.title).toBe("Team Meeting");
      expect(chat.messages).toHaveLength(1);
      expect(typeof chat.id).toBe("string");
      expect(typeof chat.date).toBe("string");
      expect(typeof chat.title).toBe("string");
      expect(Array.isArray(chat.messages)).toBe(true);
    });

    it("should allow empty participants and messages", () => {
      const emptyChat: Chat = {
        id: "empty-chat",
        date: "2023-07-17",     
        title: "Empty Chat",
        messages: [],
      };

      expect(emptyChat.messages).toHaveLength(0);
    });
  });

  describe("CreateChatRequest", () => {

    it("should allow minimal chat creation", () => {
      const minimalChat: CreateChatMessageRequest = {
        chatId: "chat123",
        messages: [
          { role: "user", content: "This is a new message" },
        ],
        use_knowledge_base: true,
      };

      expect(minimalChat.messages).toHaveLength(1);
    });
  });

  describe("CreateChatMessageRequest", () => {
    it("should omit id and timestamp from ChatMessage", () => {
      const createMessageRequest: CreateChatMessageRequest = {
        chatId: "chat123",
        messages: [
          { role: "user", content: "This is a new message" },
        ],
        use_knowledge_base: true,
      };

      expect(createMessageRequest.messages).toHaveLength(1);
      expect(createMessageRequest.messages[0].content).toBe("This is a new message");
    });

    it("should allow different message content", () => {
      const messages: CreateChatMessageRequest[] = [
        { chatId: "chat123", messages: [{ role: "user", content: "Hello!" }], use_knowledge_base: true },
        { chatId: "chat123", messages: [{ role: "user", content: "How are you?" }], use_knowledge_base: true },
        { chatId: "chat123", messages: [{ role: "user", content: "I'm doing great, thanks!" }], use_knowledge_base: true },
      ];

      expect(messages).toHaveLength(3);
      expect(messages[1].messages[0].content).toBe("How are you?");
    });
  });

  describe("UpdateChatRequest", () => {
    it("should require id and allow partial Chat updates", () => {
      const updateRequest: UpdateChatRequest = {
        id: "chat-to-update",
        title: "Updated Chat Title",
      };

      expect(updateRequest.id).toBe("chat-to-update");
      expect(updateRequest.title).toBe("Updated Chat Title");
    });

    it("should allow updating only participants", () => {
      const updateParticipants: UpdateChatRequest = {
        id: "chat123",
      };

      expect(updateParticipants.id).toBe("chat123");
    });

    it("should allow updating multiple fields", () => {
      const multiUpdate: UpdateChatRequest = {
        id: "chat456",
        title: "New Title",
        messages: [
          {
            id: "msg1",
            role: "user",
            content: "Updated message",
            created: "2023-07-17T12:00:00Z",
          },
        ],
      };

      expect(multiUpdate.id).toBe("chat456");
      expect(multiUpdate.title).toBe("New Title");
      expect(multiUpdate.messages).toHaveLength(1);
    });
  });

  describe("Type Compatibility", () => {
    it("should allow ChatMessage to be created from CreateChatMessageRequest", () => {
      const createMessageRequest: CreateChatMessageRequest = {
        chatId: "chat123",
        messages: [{ role: "user", content: "Test message" }],
        use_knowledge_base: true,
      };

      const fullMessage: ChatMessage = {
        id: "generated-msg-id",
        role: "user",
        created: "2023-07-17T10:00:00Z",
        content: "Test message",
      };

      expect(fullMessage.role).toBe(createMessageRequest.messages[0].role);
      expect(fullMessage.content).toBe(createMessageRequest.messages[0].content);
      expect(fullMessage.id).toBe("generated-msg-id");
      expect(fullMessage.created).toBe("2023-07-17T10:00:00Z");
    });
  });

});
