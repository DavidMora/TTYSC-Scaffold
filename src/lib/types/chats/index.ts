export interface ChatParticipant {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  timestamp: string;
  content: string;
}

export interface Chat {
  id: string;
  date: string;
  participants: ChatParticipant[];
  title: string;
  messages: ChatMessage[];
}

// Create payloads
export type CreateChatRequest = Omit<Chat, "id" | "date" | "messages">;
export type CreateChatMessageRequest = Omit<ChatMessage, "id" | "timestamp">;
export type CreateChatParticipantRequest = Omit<ChatParticipant, "id">;
export type UpdateChatRequest = Partial<Chat> & { id: string };

// Response types
export interface CreateChatResponse {
  success: boolean;
  data: Chat;
  message?: string;
}

export interface CreateChatMessageResponse {
  success: boolean;
  data: ChatMessage;
  message?: string;
}

export interface CreateChatParticipantResponse {
  success: boolean;
  data: ChatParticipant;
  message?: string;
}
