import { httpClient } from '@/lib/api';
import { HttpClientResponse } from '@/lib/types/api/http-client';
import { BFF_USER_METRICS } from '@/lib/constants/api/bff-routes';

export interface UserMetricsPayload {
  ConversationId: string;
  WorkflowId?: string; // ignore this - per requirements
  WorkflowName: string;
  SessionId: string;
  IsRecordableConversation: boolean;
  Query: string;
  Response: string;
  IrResults?: string; // optional, DON'T USE per requirements
  Source: 'TTYSC';
  SourceType?: string; // optional, DON'T USE per requirements
  UserBrowser: string;
  RephrasedQueries?: string; // optional, DON'T USE per requirements
  Category?: string; // optional, DON'T USE per requirements
  Subcategory?: string; // optional, DON'T USE per requirements
  Error?: string; // optional, DON'T USE per requirements
  TimeTaken?: string; // optional, DON'T USE per requirements
  AdditionalInfo?: string; // optional, DON'T USE per requirements
  Environment: 'dev' | 'stg' | 'prd';
  Username: string;
}

export interface UserMetricsResponse {
  success: boolean;
  message?: string;
}

export const submitUserMetrics = async (
  payload: UserMetricsPayload
): Promise<HttpClientResponse<UserMetricsResponse>> => {
  return await httpClient.post<UserMetricsResponse>(BFF_USER_METRICS, payload);
};
