import { dataFetcher } from "@/lib/api";
import {
  getChats,
  getChat,
  createChat,
  updateChat,
  createChatMessage,
  updateMessageFeedback,
} from "@/lib/services/chats.service";
import {
  BotResponse,
  Chat,
  CreateChatMessageRequest,
  CreateChatRequest,
  UpdateChatRequest,
  VoteType,
} from "@/lib/types/chats";

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
  return dataFetcher.mutateData(
    ["create-chat-mutation"],
    (payload: CreateChatRequest) => createChat(payload),
    {
      invalidateQueries: [CHATS_KEY],
      onSuccess: (data) => {
        onSuccess?.(data);
      },
      onError: (error: Error) => {
        onError?.(error);
      },
    }
  );
};

export const useUpdateChat = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: Chat) => void;
  onError?: (error: Error) => void;
}) => {
  return dataFetcher.mutateData(
    ["update-chat-mutation"],
    (payload: UpdateChatRequest) => updateChat(payload),
    {
      invalidateQueries: [CHATS_KEY],
      onSuccess: (data) => {
        onSuccess?.(data);
      },
      onError: (error: Error) => {
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
  return dataFetcher.mutateData(
    ["send-chat-message-mutation"],
    (payload: CreateChatMessageRequest) => createChatMessage(payload),
    {
      invalidateQueries: [], // No need to invalidate any queries here
      onSuccess: (data) => {
        onSuccess?.(data);
      },
      onError: (error: Error) => {
        onError?.(error);
      },
    }
  );
};

export const useUpdateMessageFeedback = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation<void, { messageId: string; feedbackVote: VoteType }>(
    ({ messageId, feedbackVote }) =>
      updateMessageFeedback(messageId, feedbackVote).then((res) => res.data),
    {
      invalidateQueries: [], // No need to invalidate any queries here
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error) => {
        onError?.(error);
      },
    }
  );
};
