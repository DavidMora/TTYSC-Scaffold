import { dataFetcher } from "@/lib/api";
import {
  getChats,
  getChat,
  createChat,
  updateChat,
  createChatMessage,
} from "@/lib/services/chats.service";
import { BotResponse, Chat, CreateChatMessageRequest } from "@/lib/types/chats";
import { useMutation } from "../useMutation";

export const CHATS_KEY = "chatHistory";
export const CHAT_KEY = (id: string) => `chat-${id}`;

export const useChats = () => {
  return dataFetcher.fetchData(CHATS_KEY, () => getChats(), {
    revalidateOnFocus: false,
  });
};

export const useChat = (id: string) => {
  return dataFetcher.fetchData(CHAT_KEY(id), () => getChat(id), {
    revalidateOnFocus: false,
  });
};

export const useCreateChat = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: Chat) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation(() => createChat(), {
    invalidateQueries: [CHATS_KEY],
    onSuccess: (data) => {
      onSuccess?.(data.data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
};

export const useRenameChat = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: { title: string }) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation(
    ({ id, data }: { id: string; data: { title: string } }) =>
      updateChat({ id, title: data.title }),
    {
      invalidateQueries: [CHATS_KEY],
      onSuccess: (data) => {
        onSuccess?.(data.data);
      },
      onError: (error) => {
        onError?.(error);
      },
    }
  );
};

export const useSendChatMessage = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: BotResponse) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation<BotResponse, CreateChatMessageRequest>(
    (payload) => createChatMessage(payload).then((res) => res.data),
    {
      invalidateQueries: [], // No need to invalidate any queries here
      onSuccess: (data) => {
        onSuccess?.(data);
      },
      onError: (error) => {
        onError?.(error);
      },
    }
  );
};
