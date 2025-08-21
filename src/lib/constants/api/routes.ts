// Backend (upstream) absolute base URL resolution.
// Priority:
// 1. Explicit BACKEND_BASE_URL (real backend)
// 2. Explicit MOCK_BACKEND_BASE_URL (mock backend)
// 3. Fallback to localhost mock default
// NOTE: Frontend code should prefer BFF routes (see bff-routes.ts) for new features.
export const BASE =
  process.env.BACKEND_BASE_URL ||
  process.env.MOCK_BACKEND_BASE_URL ||
  'http://localhost:5000';

export const SETTINGS = `${BASE}/settings`;

export const DEFINITIONS = `${BASE}/definitions`;
export const DEFINITION = (id: string) =>
  `${BASE}/definitions/${encodeURIComponent(id)}`;
export const DEFINITION_DETAILS = (id: string) =>
  `${BASE}/definitions/${encodeURIComponent(id)}/details`;

export const TABLES = `${BASE}/options/tables`;

export const FEEDBACKS = `${BASE}/feedback`;
export const FEEDBACK = (id: string) =>
  `${BASE}/feedback/${encodeURIComponent(id)}`;

// Sidebar Navigation Items endpoints
export const CHATS = `${BASE}/chats`;
export const CHAT = (id: string) => `${BASE}/chats/${encodeURIComponent(id)}`;
export const CHAT_MESSAGES = (id: string) =>
  `${BASE}/chats/${encodeURIComponent(id)}/messages`;
export const CHAT_MESSAGE = `${BASE}/chat`;
export const MESSAGE_FEEDBACK = (messageId: string) =>
  `${BASE}/messages/${encodeURIComponent(messageId)}/feedback`;

// Cases endpoints
export const CASES = `${BASE}/cases`;
export const CASE_ANALYSIS = `${BASE}/cases/analysis`;
export const CASES_BY_ANALYSIS = (analysisNameType: string) =>
  `${BASE}/cases?analysisNameType=${analysisNameType}`;

// Export endpoints
export const EXPORT_TABLE = (tableId: string, format: string) =>
  `${BASE}/export/${encodeURIComponent(tableId)}?format=${encodeURIComponent(
    format
  )}`;

export const AUXILIARY_CHART = (chartId: string) =>
  `${BASE}/auxiliary/chart/${encodeURIComponent(chartId)}`;
