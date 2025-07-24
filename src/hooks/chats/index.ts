import { dataFetcher } from "@/lib/api";
import { getChats, getChat } from "@/services/chats.service";

export const CHATS_KEY = "chatHistory";
export const CHAT_KEY = (id: string) => `chat-${id}`;

export const useChats = () => {
  const fetcher = dataFetcher.fetchData(CHATS_KEY, () => getChats(), {
    revalidateOnFocus: false,
  });
  return {
    ...fetcher,
    data: fetcher.data?.data,
  };
};

export const useChat = (id: string) => {
  const fetcher = dataFetcher.fetchData(CHAT_KEY(id), () => getChat(id), {
    revalidateOnFocus: false,
  });

  return {
    ...fetcher,
    data: fetcher.data?.data,
  };
};
