export const BASE = "http://localhost:5000";

export const DEFINITIONS = `${BASE}/definitions`;
export const DEFINITION = (id: string) => `${BASE}/definitions/${id}`;
export const DEFINITION_DETAILS = (id: string) =>
  `${BASE}/definitions/${id}/details`;

// Sidebar Navigation Items endpoints
export const CHATS = `${BASE}/chats`;
export const CHAT = (id: string) => `${BASE}/chats/${id}`;
export const CHAT_MESSAGES = (id: string) => `${BASE}/chats/${id}/messages`;
export const CHAT_MESSAGE = (chatId: string, messageId: string) =>
  `${BASE}/chats/${chatId}/messages/${messageId}`;
