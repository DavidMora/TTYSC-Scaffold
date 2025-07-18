import { httpClient } from "@/lib/api";
import { HttpClientResponse } from "@/lib/types/api/http-client";
import { CHATS, CHAT } from "@/lib/constants/api/routes";
import { Chat, CreateChatRequest, UpdateChatRequest } from "@/lib/types/chats";

export const getChats = async (): Promise<HttpClientResponse<Chat[]>> => {
  return await httpClient.get<Chat[]>(CHATS);
};

export const getChat = async (
  id: string
): Promise<HttpClientResponse<Chat>> => {
  return await httpClient.get<Chat>(CHAT(id));
};

export const createChat = async (
  payload: CreateChatRequest
): Promise<HttpClientResponse<Chat>> => {
  return await httpClient.post<Chat>(CHATS, payload);
};

export const updateChat = async (
  payload: UpdateChatRequest
): Promise<HttpClientResponse<Chat>> => {
  return await httpClient.patch<Chat>(CHAT(payload.id), payload);
};

export const deleteChat = async (
  id: string
): Promise<HttpClientResponse<void>> => {
  return await httpClient.delete<void>(CHAT(id));
};
