import { submitUserMetrics } from '../../../src/lib/services/user-metrics.service';
import { httpClient } from '../../../src/lib/api';
import { BFF_USER_METRICS } from '../../../src/lib/constants/api/bff-routes';
import { UserMetricsPayload } from '../../../src/lib/services/user-metrics.service';

jest.mock('../../../src/lib/api');
const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('UserMetricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitUserMetrics', () => {
    it('should call httpClient.post with correct endpoint and payload', async () => {
      const mockPayload: UserMetricsPayload = {
        ConversationId: 'test-conversation-123',
        WorkflowName: 'ttysc',
        SessionId: 'user@example.com',
        IsRecordableConversation: false,
        Query: 'What is the weather today?',
        Response: 'The weather is sunny with a high of 75°F.',
        Source: 'TTYSC',
        UserBrowser: 'Chrome 120.0.0.0 on macOS',
        Environment: 'dev',
        Username: 'user@example.com',
      };

      const mockResponseData = {
        success: true,
        message: 'User metrics submitted successfully',
      };

      mockHttpClient.post.mockResolvedValue({
        data: mockResponseData,
        status: 201,
        statusText: 'Created',
        headers: {},
        ok: true,
      });

      const result = await submitUserMetrics(mockPayload);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        BFF_USER_METRICS,
        mockPayload
      );
      expect(result.data).toEqual(mockResponseData);
    });

    it('should handle network errors gracefully', async () => {
      const mockPayload: UserMetricsPayload = {
        ConversationId: 'test-conversation-456',
        WorkflowName: 'ttysc',
        SessionId: 'user2@example.com',
        IsRecordableConversation: false,
        Query: 'Show me sales data',
        Response: 'Here is the sales data analysis...',
        Source: 'TTYSC',
        UserBrowser: 'Firefox 121.0 on Windows',
        Environment: 'stg',
        Username: 'user2@example.com',
      };

      const mockError = new Error('Network error');
      mockHttpClient.post.mockRejectedValue(mockError);

      await expect(submitUserMetrics(mockPayload)).rejects.toThrow(
        'Network error'
      );
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        BFF_USER_METRICS,
        mockPayload
      );
    });

    it('should handle validation errors from backend', async () => {
      const mockPayload: UserMetricsPayload = {
        ConversationId: 'test-conversation-789',
        WorkflowName: 'custom-workflow',
        SessionId: 'user3@example.com',
        IsRecordableConversation: false,
        Query: 'Invalid query',
        Response: '',
        Source: 'TTYSC',
        UserBrowser: 'Safari 17.1 on iOS',
        Environment: 'prd',
        Username: 'user3@example.com',
      };

      const mockError = new Error(
        'Validation failed: Response cannot be empty'
      );
      mockHttpClient.post.mockRejectedValue(mockError);

      await expect(submitUserMetrics(mockPayload)).rejects.toThrow(
        'Validation failed: Response cannot be empty'
      );
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        BFF_USER_METRICS,
        mockPayload
      );
    });

    it('should handle server errors (5xx) gracefully', async () => {
      const mockPayload: UserMetricsPayload = {
        ConversationId: 'test-conversation-999',
        WorkflowName: 'ttysc',
        SessionId: 'user4@example.com',
        IsRecordableConversation: false,
        Query: 'Test query',
        Response: 'Test response',
        Source: 'TTYSC',
        UserBrowser: 'Edge 120.0.0.0 on Windows',
        Environment: 'dev',
        Username: 'user4@example.com',
      };

      mockHttpClient.post.mockResolvedValue({
        data: { error: 'Internal server error' },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        ok: false,
      });

      const result = await submitUserMetrics(mockPayload);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        BFF_USER_METRICS,
        mockPayload
      );
      expect(result.status).toBe(500);
    });
  });
});
