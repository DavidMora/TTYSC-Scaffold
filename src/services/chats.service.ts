import { apiClient } from "@/lib/api";
import { HttpClientResponse } from "@/lib/types/api/http-client";
import { CHATS, CHAT } from "@/lib/constants/api/routes";
import {
  ChatResponse,
  ChatsResponse,
  CreateChatRequest,
  UpdateChatRequest,
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
): Promise<HttpClientResponse<ChatResponse>> => {
  return await apiClient.post<ChatResponse>(CHATS, payload);
};

export const updateChat = async (
  payload: UpdateChatRequest
): Promise<HttpClientResponse<ChatResponse>> => {
  return await apiClient.patch<ChatResponse>(CHAT(payload.id), payload);
};

export const deleteChat = async (
  id: string
): Promise<HttpClientResponse<void>> => {
  return await apiClient.delete<void>(CHAT(id));
};
