export interface Feedback {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  status: string;
  category: string;
}

export type CreateFeedbackRequest = Omit<
  Feedback,
  "id" | "userId" | "timestamp" | "status"
>;

export type UpdateFeedbackRequest = Partial<Feedback> & { id: string };

export interface FeedbackResponse {
  success: boolean;
  data: Feedback;
  message?: string;
}

export interface FeedbackListResponse {
  success: boolean;
  data: Feedback[];
  totalCount: number;
  message?: string;
}
