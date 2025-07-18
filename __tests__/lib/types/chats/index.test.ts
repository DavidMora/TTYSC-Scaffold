import {
  ChatParticipant,
  ChatMessage,
  Chat,
  CreateChatRequest,
  CreateChatMessageRequest,
  CreateChatParticipantRequest,
  UpdateChatRequest,
  CreateChatResponse,
  CreateChatMessageResponse,
  CreateChatParticipantResponse,
} from "@/lib/types/chats";

describe("Chat Types", () => {
  describe("ChatParticipant", () => {
    it("should define correct interface structure", () => {
      const participant: ChatParticipant = {
        id: "user123",
        name: "John Doe",
      };

      expect(participant.id).toBe("user123");
      expect(participant.name).toBe("John Doe");
      expect(typeof participant.id).toBe("string");
      expect(typeof participant.name).toBe("string");
    });

    it("should allow different participant data", () => {
      const participants: ChatParticipant[] = [
        { id: "user1", name: "Alice Smith" },
        { id: "user2", name: "Bob Johnson" },
        { id: "user3", name: "Charlie Brown" },
      ];

      expect(participants).toHaveLength(3);
      expect(participants[0].name).toBe("Alice Smith");
      expect(participants[1].id).toBe("user2");
    });
  });

  describe("ChatMessage", () => {
    it("should define correct interface structure", () => {
      const message: ChatMessage = {
        id: "msg123",
        sender: "user456",
        timestamp: "2023-07-17T10:30:00Z",
        content: "Hello, this is a test message!",
      };

      expect(message.id).toBe("msg123");
      expect(message.sender).toBe("user456");
      expect(message.timestamp).toBe("2023-07-17T10:30:00Z");
      expect(message.content).toBe("Hello, this is a test message!");
      expect(typeof message.id).toBe("string");
      expect(typeof message.sender).toBe("string");
      expect(typeof message.timestamp).toBe("string");
      expect(typeof message.content).toBe("string");
    });

    it("should allow array of messages", () => {
      const messages: ChatMessage[] = [
        {
          id: "msg1",
          sender: "user1",
          timestamp: "2023-07-17T10:00:00Z",
          content: "First message",
        },
        {
          id: "msg2",
          sender: "user2",
          timestamp: "2023-07-17T10:01:00Z",
          content: "Second message",
        },
      ];

      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe("First message");
      expect(messages[1].sender).toBe("user2");
    });
  });

  describe("Chat", () => {
    it("should define correct interface structure", () => {
      const chat: Chat = {
        id: "chat123",
        date: "2023-07-17",
        participants: [
          { id: "user1", name: "John Doe" },
          { id: "user2", name: "Jane Smith" },
        ],
        title: "Team Meeting",
        messages: [
          {
            id: "msg1",
            sender: "user1",
            timestamp: "2023-07-17T10:00:00Z",
            content: "Hello everyone!",
          },
        ],
      };

      expect(chat.id).toBe("chat123");
      expect(chat.date).toBe("2023-07-17");
      expect(chat.title).toBe("Team Meeting");
      expect(chat.participants).toHaveLength(2);
      expect(chat.messages).toHaveLength(1);
      expect(typeof chat.id).toBe("string");
      expect(typeof chat.date).toBe("string");
      expect(typeof chat.title).toBe("string");
      expect(Array.isArray(chat.participants)).toBe(true);
      expect(Array.isArray(chat.messages)).toBe(true);
    });

    it("should allow empty participants and messages", () => {
      const emptyChat: Chat = {
        id: "empty-chat",
        date: "2023-07-17",
        participants: [],
        title: "Empty Chat",
        messages: [],
      };

      expect(emptyChat.participants).toHaveLength(0);
      expect(emptyChat.messages).toHaveLength(0);
    });
  });

  describe("CreateChatRequest", () => {
    it("should omit id, date, and messages from Chat", () => {
      const createRequest: CreateChatRequest = {
        participants: [
          { id: "user1", name: "John Doe" },
          { id: "user2", name: "Jane Smith" },
        ],
        title: "New Team Meeting",
      };

      expect(createRequest.title).toBe("New Team Meeting");
      expect(createRequest.participants).toHaveLength(2);
      expect(createRequest.participants[0].name).toBe("John Doe");

      // These properties should not exist in CreateChatRequest
      expect("id" in createRequest).toBe(false);
      expect("date" in createRequest).toBe(false);
      expect("messages" in createRequest).toBe(false);
    });

    it("should allow minimal chat creation", () => {
      const minimalChat: CreateChatRequest = {
        title: "Quick Chat",
        participants: [{ id: "user1", name: "Solo User" }],
      };

      expect(minimalChat.title).toBe("Quick Chat");
      expect(minimalChat.participants).toHaveLength(1);
    });
  });

  describe("CreateChatMessageRequest", () => {
    it("should omit id and timestamp from ChatMessage", () => {
      const createMessageRequest: CreateChatMessageRequest = {
        sender: "user123",
        content: "This is a new message",
      };

      expect(createMessageRequest.sender).toBe("user123");
      expect(createMessageRequest.content).toBe("This is a new message");

      // These properties should not exist in CreateChatMessageRequest
      expect("id" in createMessageRequest).toBe(false);
      expect("timestamp" in createMessageRequest).toBe(false);
    });

    it("should allow different message content", () => {
      const messages: CreateChatMessageRequest[] = [
        { sender: "user1", content: "Hello!" },
        { sender: "user2", content: "How are you?" },
        { sender: "user1", content: "I'm doing great, thanks!" },
      ];

      expect(messages).toHaveLength(3);
      expect(messages[1].content).toBe("How are you?");
    });
  });

  describe("CreateChatParticipantRequest", () => {
    it("should omit id from ChatParticipant", () => {
      const createParticipantRequest: CreateChatParticipantRequest = {
        name: "New Participant",
      };

      expect(createParticipantRequest.name).toBe("New Participant");

      // This property should not exist in CreateChatParticipantRequest
      expect("id" in createParticipantRequest).toBe(false);
    });

    it("should allow multiple participant creation requests", () => {
      const newParticipants: CreateChatParticipantRequest[] = [
        { name: "Alice Johnson" },
        { name: "Bob Smith" },
        { name: "Charlie Wilson" },
      ];

      expect(newParticipants).toHaveLength(3);
      expect(newParticipants[0].name).toBe("Alice Johnson");
      expect(newParticipants[2].name).toBe("Charlie Wilson");
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
        participants: [
          { id: "user1", name: "John Doe" },
          { id: "user2", name: "Jane Smith" },
          { id: "user3", name: "Bob Johnson" },
        ],
      };

      expect(updateParticipants.id).toBe("chat123");
      expect(updateParticipants.participants).toHaveLength(3);
      expect("title" in updateParticipants).toBe(false);
      expect("date" in updateParticipants).toBe(false);
      expect("messages" in updateParticipants).toBe(false);
    });

    it("should allow updating multiple fields", () => {
      const multiUpdate: UpdateChatRequest = {
        id: "chat456",
        title: "New Title",
        participants: [{ id: "user1", name: "Only User" }],
        messages: [
          {
            id: "msg1",
            sender: "user1",
            timestamp: "2023-07-17T12:00:00Z",
            content: "Updated message",
          },
        ],
      };

      expect(multiUpdate.id).toBe("chat456");
      expect(multiUpdate.title).toBe("New Title");
      expect(multiUpdate.participants).toHaveLength(1);
      expect(multiUpdate.messages).toHaveLength(1);
    });
  });

  describe("Response Types", () => {
    describe("CreateChatResponse", () => {
      it("should define correct response structure for success", () => {
        const successResponse: CreateChatResponse = {
          success: true,
          data: {
            id: "new-chat-id",
            date: "2023-07-17",
            title: "Created Chat",
            participants: [{ id: "user1", name: "Creator" }],
            messages: [],
          },
          message: "Chat created successfully",
        };

        expect(successResponse.success).toBe(true);
        expect(successResponse.data.id).toBe("new-chat-id");
        expect(successResponse.message).toBe("Chat created successfully");
      });

      it("should allow response without message", () => {
        const responseWithoutMessage: CreateChatResponse = {
          success: true,
          data: {
            id: "chat-id",
            date: "2023-07-17",
            title: "Chat",
            participants: [],
            messages: [],
          },
        };

        expect(responseWithoutMessage.success).toBe(true);
        expect("message" in responseWithoutMessage).toBe(false);
      });

      it("should handle error response", () => {
        const errorResponse: CreateChatResponse = {
          success: false,
          data: {} as Chat, // Empty chat object for error case
          message: "Failed to create chat",
        };

        expect(errorResponse.success).toBe(false);
        expect(errorResponse.message).toBe("Failed to create chat");
      });
    });

    describe("CreateChatMessageResponse", () => {
      it("should define correct response structure", () => {
        const messageResponse: CreateChatMessageResponse = {
          success: true,
          data: {
            id: "new-msg-id",
            sender: "user123",
            timestamp: "2023-07-17T10:30:00Z",
            content: "New message created",
          },
          message: "Message created successfully",
        };

        expect(messageResponse.success).toBe(true);
        expect(messageResponse.data.content).toBe("New message created");
        expect(messageResponse.message).toBe("Message created successfully");
      });
    });

    describe("CreateChatParticipantResponse", () => {
      it("should define correct response structure", () => {
        const participantResponse: CreateChatParticipantResponse = {
          success: true,
          data: {
            id: "new-participant-id",
            name: "New Participant",
          },
          message: "Participant added successfully",
        };

        expect(participantResponse.success).toBe(true);
        expect(participantResponse.data.name).toBe("New Participant");
        expect(participantResponse.message).toBe(
          "Participant added successfully"
        );
      });
    });
  });

  describe("Type Compatibility", () => {
    it("should allow Chat to be created from CreateChatRequest", () => {
      const createRequest: CreateChatRequest = {
        title: "Test Chat",
        participants: [{ id: "user1", name: "Test User" }],
      };

      const fullChat: Chat = {
        id: "generated-id",
        date: "2023-07-17",
        messages: [],
        ...createRequest,
      };

      expect(fullChat.title).toBe(createRequest.title);
      expect(fullChat.participants).toBe(createRequest.participants);
      expect(fullChat.id).toBe("generated-id");
      expect(fullChat.date).toBe("2023-07-17");
      expect(fullChat.messages).toHaveLength(0);
    });

    it("should allow ChatMessage to be created from CreateChatMessageRequest", () => {
      const createMessageRequest: CreateChatMessageRequest = {
        sender: "user1",
        content: "Test message",
      };

      const fullMessage: ChatMessage = {
        id: "generated-msg-id",
        timestamp: "2023-07-17T10:00:00Z",
        ...createMessageRequest,
      };

      expect(fullMessage.sender).toBe(createMessageRequest.sender);
      expect(fullMessage.content).toBe(createMessageRequest.content);
      expect(fullMessage.id).toBe("generated-msg-id");
      expect(fullMessage.timestamp).toBe("2023-07-17T10:00:00Z");
    });

    it("should allow ChatParticipant to be created from CreateChatParticipantRequest", () => {
      const createParticipantRequest: CreateChatParticipantRequest = {
        name: "Test Participant",
      };

      const fullParticipant: ChatParticipant = {
        id: "generated-participant-id",
        ...createParticipantRequest,
      };

      expect(fullParticipant.name).toBe(createParticipantRequest.name);
      expect(fullParticipant.id).toBe("generated-participant-id");
    });
  });
});
