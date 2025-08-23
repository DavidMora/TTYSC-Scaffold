// NVIDIA AI Factory Feedback Types
export interface AIFactoryFeedbackPayload {
  WorkflowName: string;
  Feedback: 'good' | 'bad' | 'feedback provided';
  QueryId: string;
  Query: string;
  Answer: string;
  Comments: string;
  UserConsent: boolean;
  Username: string;
  Environment: 'dev' | 'stg' | 'prd';
}

export interface AIFactoryFeedbackResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

// Legacy feedback types (for backward compatibility)
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
  'id' | 'userId' | 'timestamp' | 'status'
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

// Request types for frontend
export interface SubmitFeedbackRequest {
  feedback: 'good' | 'bad' | 'feedback provided';
  queryId: string;
  query: string;
  answer: string;
  comments: string;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  message?: string;
}
