import { dataFetcher } from '@/lib/api';
import {
  submitUserMetrics,
  UserMetricsPayload,
} from '@/lib/services/user-metrics.service';
import { useAuth } from '@/hooks/useAuth';
import { getUserBrowser, getEnvironment } from '@/lib/utils/user-browser';

export const USER_METRICS_KEY = 'userMetrics';

export interface UseUserMetricsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for submitting user metrics to NVIDIA AI Factory
 */
export const useSubmitUserMetrics = ({
  onSuccess,
  onError,
}: UseUserMetricsOptions = {}) => {
  return dataFetcher.mutateData(
    [USER_METRICS_KEY],
    async (payload: UserMetricsPayload) => submitUserMetrics(payload),
    {
      invalidateQueries: [], // No cache invalidation needed
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error: Error) => {
        onError?.(error);
      },
    }
  );
};

/**
 * Helper function to construct user metrics payload
 */
export const buildUserMetricsPayload = (params: {
  conversationId: string;
  query: string;
  response?: string;
  sessionId?: string;
  username?: string;
  error?: string;
  additionalInfo?: string;
}): UserMetricsPayload => {
  const workflowName = process.env.USER_METRICS_WORKFLOW_NAME || 'ttysc';
  const environment = getEnvironment();

  return {
    ConversationId: params.conversationId,
    WorkflowName: workflowName,
    SessionId: params.sessionId || 'unknown-session',
    IsRecordableConversation: false,
    Query: params.query,
    Response: params.response || '',
    Error: params.error,
    AdditionalInfo: params.additionalInfo,
    Source: 'TTYSC',
    UserBrowser: getUserBrowser(),
    Environment: environment,
    Username: params.username || 'unknown-user',
  };
};

/**
 * Hook that provides user metrics submission with session data
 */
export const useUserMetricsWithSession = () => {
  const { session } = useAuth();
  const { mutate: submitMetrics } = useSubmitUserMetrics();

  const submitWithSession = async (params: {
    conversationId: string;
    query: string;
    response?: string;
    error?: string;
    additionalInfo?: string;
  }) => {
    const payload = buildUserMetricsPayload({
      ...params,
      sessionId: session?.user?.email || 'anonymous-session',
      username: session?.user?.email || 'anonymous-user',
    });

    await submitMetrics(payload);
  };

  return {
    submitUserMetrics: submitWithSession,
    buildUserMetricsPayload,
  };
};
