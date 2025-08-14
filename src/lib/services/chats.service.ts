import { apiClient, httpClient } from '@/lib/api';
import {
  HttpClientResponse,
  HttpSSEEvent,
  HttpStreamResponse,
} from '@/lib/types/api/http-client';
import {
  CHATS,
  CHAT,
  CHAT_MESSAGE,
  MESSAGE_FEEDBACK,
} from '@/lib/constants/api/routes';
import {
  ChatResponse,
  ChatsResponse,
  CreateChatMessageRequest,
  BotResponse,
  UpdateChatRequest,
  Chat,
  CreateChatRequest,
  VoteType,
  ChatStreamChunk,
  ChatPromptRequest,
} from '@/lib/types/chats';

export const getChats = async (): Promise<
  HttpClientResponse<ChatsResponse>
> => {
  return await apiClient.get<ChatsResponse>(CHATS);
};

export const getChat = async (
  id: string
): Promise<HttpClientResponse<ChatResponse>> => {
  return await apiClient.get<ChatResponse>(CHAT(id));
};

export const createChat = async (
  payload: CreateChatRequest
): Promise<HttpClientResponse<Chat>> => {
  return await apiClient.post<Chat>(CHATS, payload);
};

export const updateChat = async (
  payload: UpdateChatRequest
): Promise<HttpClientResponse<Chat>> => {
  return await apiClient.patch<Chat>(CHAT(payload.id), payload);
};

export const deleteChat = async (
  id: string
): Promise<HttpClientResponse<void>> => {
  return await apiClient.delete<void>(CHAT(id));
};

export const createChatMessage = async (
  payload: CreateChatMessageRequest
): Promise<HttpClientResponse<BotResponse>> => {
  return await apiClient.post<BotResponse>(CHAT_MESSAGE, payload);
};

export const updateMessageFeedback = async (
  messageId: string,
  feedbackVote: VoteType
): Promise<HttpClientResponse<void>> => {
  return await apiClient.put<void>(MESSAGE_FEEDBACK(messageId), {
    feedbackVote,
  });
};

export const newChatMessageStream = async (
  payload: ChatPromptRequest,
  options?: { limit?: number; abortSignal?: AbortSignal }
): Promise<HttpStreamResponse<ChatStreamChunk>> => {
  const { limit, abortSignal } = options || {};

  const rawStream = await httpClient.stream<HttpSSEEvent>(
    'http://localhost:3000/api/chat/stream',
    {
      method: 'POST',
      body: payload,
      parser: 'sse',
      signal: abortSignal,
    }
  );

  let count = 0;

  async function* mapper(): AsyncGenerator<ChatStreamChunk, void, unknown> {
    for await (const evt of rawStream) {
      if (evt.data) {
        try {
          const obj = JSON.parse(evt.data) as ChatStreamChunk;
          yield obj;
          count++;
          if (limit && count >= limit) {
            rawStream.cancel();
            return;
          }
        } catch {
          // ignore malformed chunk
        }
      }
    }
  }

  const meta = {
    status: rawStream.status,
    statusText: rawStream.statusText,
    headers: rawStream.headers,
    ok: rawStream.ok,
  };

  const wrapped: HttpStreamResponse<ChatStreamChunk> = {
    [Symbol.asyncIterator]: () => mapper(),
    cancel: () => rawStream.cancel(),
    raw: rawStream.raw,
    ...meta,
  };

  return wrapped;
};
