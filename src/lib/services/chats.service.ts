import { httpClient } from '@/lib/api';
import {
  HttpClientResponse,
  HttpSSEEvent,
  HttpStreamResponse,
} from '@/lib/types/api/http-client';
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

import {
  BFF_CHATS,
  BFF_CHAT,
  BFF_CHAT_MESSAGE,
  BFF_MESSAGE_FEEDBACK,
  BFF_CHAT_STREAM,
} from '@/lib/constants/api/bff-routes';

export const getChats = async (): Promise<
  HttpClientResponse<ChatsResponse>
> => {
  return await httpClient.get<ChatsResponse>(BFF_CHATS);
};

export const getChat = async (
  id: string
): Promise<HttpClientResponse<ChatResponse>> => {
  return await httpClient.get<ChatResponse>(BFF_CHAT(id));
};

export const createChat = async (
  payload: CreateChatRequest
): Promise<HttpClientResponse<Chat>> => {
  return await httpClient.post<Chat>(BFF_CHATS, payload);
};

export const updateChat = async (
  payload: UpdateChatRequest
): Promise<HttpClientResponse<Chat>> => {
  return await httpClient.patch<Chat>(BFF_CHAT(payload.id), payload);
};

export const deleteChat = async (
  id: string
): Promise<HttpClientResponse<void>> => {
  return await httpClient.delete<void>(BFF_CHAT(id));
};

export const createChatMessage = async (
  payload: CreateChatMessageRequest
): Promise<HttpClientResponse<BotResponse>> => {
  return await httpClient.post<BotResponse>(BFF_CHAT_MESSAGE, payload);
};

export const updateMessageFeedback = async (
  messageId: string,
  feedbackVote: VoteType
): Promise<HttpClientResponse<void>> => {
  return await httpClient.put<void>(BFF_MESSAGE_FEEDBACK(messageId), {
    feedbackVote,
  });
};

export const newChatMessageStream = async (
  payload: ChatPromptRequest,
  options?: { limit?: number; abortSignal?: AbortSignal }
): Promise<HttpStreamResponse<ChatStreamChunk>> => {
  const { limit, abortSignal } = options || {};

  const rawStream = await httpClient.stream<HttpSSEEvent>(BFF_CHAT_STREAM, {
    method: 'POST',
    body: payload,
    parser: 'sse',
    signal: abortSignal,
  });

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
    raw: rawStream,
    ...meta,
  };

  return wrapped;
};
