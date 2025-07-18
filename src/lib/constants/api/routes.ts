export const BASE =
  process.env.TTYSC_BACKEND_API_BASE_URL || "http://localhost:5000";

export const DEFINITIONS = `${BASE}/definitions`;
export const DEFINITION = (id: string) =>
  `${BASE}/definitions/${encodeURIComponent(id)}`;
export const DEFINITION_DETAILS = (id: string) =>
  `${BASE}/definitions/${encodeURIComponent(id)}/details`;

// Sidebar Navigation Items endpoints
export const CHATS = `${BASE}/chats`;
export const CHAT = (id: string) => `${BASE}/chats/${encodeURIComponent(id)}`;
export const CHAT_MESSAGES = (id: string) =>
  `${BASE}/chats/${encodeURIComponent(id)}/messages`;
export const CHAT_MESSAGE = (chatId: string, messageId: string) =>
  `${BASE}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(
    messageId
  )}`;
