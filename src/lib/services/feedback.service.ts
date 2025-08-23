import { httpClient } from '@/lib/api';
import { HttpClientResponse } from '@/lib/types/api/http-client';
import { BFF_FEEDBACKS, BFF_FEEDBACK } from '@/lib/constants/api/bff-routes';
import {
  Feedback,
  SubmitFeedbackRequest,
  SubmitFeedbackResponse,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
} from '@/lib/types/feedback';

// Updated service to work with NVIDIA AI Factory feedback API
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

// New method for submitting feedback to NVIDIA AI Factory
export const submitFeedback = async (
  payload: SubmitFeedbackRequest
): Promise<HttpClientResponse<SubmitFeedbackResponse>> => {
  return await httpClient.post<SubmitFeedbackResponse>(BFF_FEEDBACKS, payload);
};

// Legacy methods (maintaining backward compatibility)
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
