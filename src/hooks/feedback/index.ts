import { dataFetcher } from '@/lib/api';
import { getFeedbacks, getFeedback } from '@/lib/services/feedback.service';

export const FEEDBACKS_KEY = 'feedbacks';
export const FEEDBACK_KEY = (id: string) => `feedback-${id}`;

export const useFeedbacks = () => {
  return dataFetcher.fetchData(FEEDBACKS_KEY, () => getFeedbacks(), {
    revalidateOnFocus: false,
  });
};

export const useFeedback = (id: string) => {
  return dataFetcher.fetchData(FEEDBACK_KEY(id), () => getFeedback(id), {
    revalidateOnFocus: false,
  });
};
