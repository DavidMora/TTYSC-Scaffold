export const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const DEFINITIONS = `${BASE}/definitions`;
export const DEFINITION = (id: string) =>
  `${BASE}/definitions/${encodeURIComponent(id)}`;
export const DEFINITION_DETAILS = (id: string) =>
  `${BASE}/definitions/${encodeURIComponent(id)}/details`;

export const FEEDBACKS = `${BASE}/feedback`;
export const FEEDBACK = (id: string) =>
  `${BASE}/feedback/${encodeURIComponent(id)}`;

// Sidebar Navigation Items endpoints
export const CHATS = `${BASE}/chats`;
export const CHAT = (id: string) => `${BASE}/chats/${encodeURIComponent(id)}`;
export const CHAT_MESSAGES = (id: string) =>
  `${BASE}/chats/${encodeURIComponent(id)}/messages`;
export const CHAT_MESSAGE = `${BASE}/chat`;

// Cases endpoints
export const CASES = `${BASE}/cases`;
export const CASE_ANALYSIS = `${BASE}/cases/analysis`;
export const CASES_BY_ANALYSIS = (analysisNameType: string) =>
  `${BASE}/cases?analysisNameType=${analysisNameType}`;
