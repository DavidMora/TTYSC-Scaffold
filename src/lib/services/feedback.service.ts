import { httpClient } from "@/lib/api";
import { HttpClientResponse } from "@/lib/types/api/http-client";
import { FEEDBACKS, FEEDBACK } from "@/lib/constants/api/routes";
import {
  Feedback,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
} from "@/lib/types/feedback";

export const getFeedbacks = async (): Promise<
  HttpClientResponse<Feedback[]>
> => {
  return await httpClient.get<Feedback[]>(FEEDBACKS);
};

export const getFeedback = async (
  id: string
): Promise<HttpClientResponse<Feedback>> => {
  return await httpClient.get<Feedback>(FEEDBACK(id));
};

export const createFeedback = async (
  payload: CreateFeedbackRequest
): Promise<HttpClientResponse<Feedback>> => {
  return await httpClient.post<Feedback>(FEEDBACKS, payload);
};

export const updateFeedback = async (
  payload: UpdateFeedbackRequest
): Promise<HttpClientResponse<Feedback>> => {
  return await httpClient.patch<Feedback>(FEEDBACK(payload.id), payload);
};

export const deleteFeedback = async (
  id: string
): Promise<HttpClientResponse<void>> => {
  return await httpClient.delete<void>(FEEDBACK(id));
};
