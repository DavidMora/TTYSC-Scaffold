import { httpClient } from '@/lib/api';
import { HttpClientResponse } from '@/lib/types/api/http-client';
import { BFF_FEEDBACKS, BFF_FEEDBACK } from '@/lib/constants/api/bff-routes';
import {
  Feedback,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
} from '@/lib/types/feedback';

export const getFeedbacks = async (): Promise<
  HttpClientResponse<Feedback[]>
> => {
  return await httpClient.get<Feedback[]>(BFF_FEEDBACKS);
};

export const getFeedback = async (
  id: string
): Promise<HttpClientResponse<Feedback>> => {
  return await httpClient.get<Feedback>(BFF_FEEDBACK(id));
};

export const createFeedback = async (
  payload: CreateFeedbackRequest
): Promise<HttpClientResponse<Feedback>> => {
  return await httpClient.post<Feedback>(BFF_FEEDBACKS, payload);
};

export const updateFeedback = async (
  payload: UpdateFeedbackRequest
): Promise<HttpClientResponse<Feedback>> => {
  return await httpClient.patch<Feedback>(BFF_FEEDBACK(payload.id), payload);
};

export const deleteFeedback = async (
  id: string
): Promise<HttpClientResponse<void>> => {
  return await httpClient.delete<void>(BFF_FEEDBACK(id));
};
