// BFF (Next.js API routes) relative endpoints.
// Use these from the frontend so that Next.js acts as a proxy / backend-for-frontend
// adding auth headers, streaming handling, feature flags, etc.

// Settings
export const BFF_SETTINGS = '/api/settings';

// Definitions
export const BFF_DEFINITIONS = '/api/definitions';
export const BFF_DEFINITION = (id: string) =>
  `/api/definitions/${encodeURIComponent(id)}`;
export const BFF_DEFINITION_DETAILS = (id: string) =>
  `/api/definitions/${encodeURIComponent(id)}/details`;

// Tables / options
export const BFF_TABLES = '/api/options/tables';

// Feedback
export const BFF_FEEDBACKS = '/api/feedback';
export const BFF_FEEDBACK = (id: string) =>
  `/api/feedback/${encodeURIComponent(id)}`;

// Chats
export const BFF_CHATS = '/api/chats';
export const BFF_CHAT = (id: string) => `/api/chats/${encodeURIComponent(id)}`;
export const BFF_CHAT_MESSAGES = (id: string) =>
  `/api/chats/${encodeURIComponent(id)}/messages`;
export const BFF_CHAT_MESSAGE = '/api/chat';
export const BFF_CHAT_STREAM = '/api/chat/stream';
export const BFF_MESSAGE_FEEDBACK = (messageId: string) =>
  `/api/messages/${encodeURIComponent(messageId)}/feedback`;

// Cases
export const BFF_CASES = '/api/cases';
export const BFF_CASE_ANALYSIS = '/api/cases/analysis';
export const BFF_CASES_BY_ANALYSIS = (analysisNameType: string) =>
  `/api/cases?analysisNameType=${encodeURIComponent(analysisNameType)}`;

// Export
export const BFF_EXPORT_TABLE = (tableId: string, format: string) =>
  `/api/export/${encodeURIComponent(tableId)}?format=${encodeURIComponent(format)}`;

// Auxiliary charts
export const BFF_AUXILIARY_CHART = (chartId: string) =>
  `/api/auxiliary/chart/${encodeURIComponent(chartId)}`;
