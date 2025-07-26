import { apiClient } from "@/lib/api";
import { HttpClientResponse } from "@/lib/types/api/http-client";
import { CHATS, CHAT, CHAT_MESSAGE } from "@/lib/constants/api/routes";
import {
  ChatResponse,
  ChatsResponse,
  CreateChatMessageRequest,
  BotResponse,
  UpdateChatRequest,
  Chat,
  CreateChatRequest,
} from "@/lib/types/chats";

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
