import { dataFetcher } from '@/lib/api';
import {
  getChats,
  getChat,
  createChat,
  updateChat,
  createChatMessage,
} from '@/lib/services/chats.service';
import { submitFeedback } from '@/lib/services/feedback.service';
import {
  BotResponse,
  Chat,
  ChatResponse,
  CreateChatMessageRequest,
  CreateChatRequest,
  UpdateChatRequest,
  VoteType,
} from '@/lib/types/chats';
import { SubmitFeedbackRequest } from '@/lib/types/feedback';

export const CHATS_KEY = 'chatHistory';
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
  onSuccess?: (data: ChatResponse) => void;
  onError?: (error: Error) => void;
}) => {
  return dataFetcher.mutateData(
    ['create-chat-mutation'],
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
    ['update-chat-mutation'],
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
    ['send-chat-message-mutation'],
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
  return dataFetcher.mutateData(
    ['update-message-feedback-mutation'],
    async ({
      messageId,
      feedbackVote,
      query,
      answer,
    }: {
      messageId: string;
      feedbackVote: VoteType;
      query?: string;
      answer?: string;
    }) => {
      let feedbackValue: 'good' | 'bad' | 'feedback provided';
      switch (feedbackVote) {
        case 'up':
          feedbackValue = 'good';
          break;
        case 'down':
          feedbackValue = 'bad';
          break;
        default:
          feedbackValue = 'feedback provided';
          break;
      }

      const feedbackPayload: SubmitFeedbackRequest = {
        feedback: feedbackValue,
        queryId: messageId,
        query: query || '',
        answer: answer || '',
        comments: '',
      };

      // Call the service with separate arguments as expected by the tests
      // return await updateMessageFeedback(messageId, feedbackVote);
      return await submitFeedback(feedbackPayload);
    },
    {
      invalidateQueries: [], // No need to invalidate any queries here
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error: Error) => {
        onError?.(error);
      },
    }
  );
};
