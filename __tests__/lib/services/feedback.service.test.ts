import {
  getFeedbacks,
  getFeedback,
  submitFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} from '../../../src/lib/services/feedback.service';
import { httpClient } from '../../../src/lib/api';
import {
  BFF_FEEDBACKS,
  BFF_FEEDBACK,
} from '../../../src/lib/constants/api/bff-routes';
import {
  SubmitFeedbackRequest,
  SubmitFeedbackResponse,
} from '../../../src/lib/types/feedback';

// Mock the httpClient
jest.mock('../../../src/lib/api');
const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

const mockResponse = (data: unknown, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  ok: status >= 200 && status < 300,
});

describe('FeedbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFeedbacks', () => {
    it('should call httpClient.get with correct endpoint', async () => {
      const mockData = [
        { id: '1', message: 'Test feedback', category: 'general' },
        { id: '2', message: 'Another feedback', category: 'bug' },
      ];
      const response = mockResponse(mockData);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await getFeedbacks();

      expect(mockHttpClient.get).toHaveBeenCalledWith(BFF_FEEDBACKS);
      expect(result).toEqual(response);
    });

    it('should handle errors from httpClient', async () => {
      const mockError = new Error('Network error');
      mockHttpClient.get.mockRejectedValue(mockError);

      await expect(getFeedbacks()).rejects.toThrow('Network error');
      expect(mockHttpClient.get).toHaveBeenCalledWith(BFF_FEEDBACKS);
    });
  });

  describe('getFeedback', () => {
    it('should call httpClient.get with correct endpoint and id', async () => {
      const feedbackId = 'test-id';
      const mockData = {
        id: feedbackId,
        message: 'Test feedback',
        category: 'general',
      };
      const response = mockResponse(mockData);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await getFeedback(feedbackId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(BFF_FEEDBACK(feedbackId));
      expect(result).toEqual(response);
    });

    it('should encode special characters in id', async () => {
      const feedbackId = 'test id with spaces';
      const mockData = {
        id: feedbackId,
        message: 'Test feedback',
        category: 'general',
      };
      const response = mockResponse(mockData);
      mockHttpClient.get.mockResolvedValue(response);

      await getFeedback(feedbackId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(BFF_FEEDBACK(feedbackId));
    });
  });

  describe('submitFeedback', () => {
    it('should call httpClient.post with correct endpoint and payload', async () => {
      const payload: SubmitFeedbackRequest = {
        feedback: 'good',
        queryId: 'conv-123',
        query: 'User prompt',
        answer: 'Assistant answer',
        comments: 'Great response!',
      };
      const mockData: SubmitFeedbackResponse = {
        success: true,
        message: 'Feedback submitted successfully!',
      };
      const response = mockResponse(mockData, 201);
      mockHttpClient.post.mockResolvedValue(response);

      const result = await submitFeedback(payload);

      expect(mockHttpClient.post).toHaveBeenCalledWith(BFF_FEEDBACKS, payload);
      expect(result).toEqual(response);
    });

    it('should handle validation errors', async () => {
      const payload: SubmitFeedbackRequest = {
        feedback: 'bad',
        queryId: 'conv-456',
        query: 'Another user prompt',
        answer: 'Another assistant answer',
        comments: 'Needs improvement',
      };
      const mockError = new Error('Validation error');
      mockHttpClient.post.mockRejectedValue(mockError);

      await expect(submitFeedback(payload)).rejects.toThrow('Validation error');
      expect(mockHttpClient.post).toHaveBeenCalledWith(BFF_FEEDBACKS, payload);
    });
  });

  describe('createFeedback', () => {
    it('should call httpClient.post with correct endpoint and payload', async () => {
      const payload = { message: 'New feedback', category: 'feature' };
      const mockData = { id: 'new-id', ...payload };
      const response = mockResponse(mockData, 201);
      mockHttpClient.post.mockResolvedValue(response);

      const result = await createFeedback(payload);

      expect(mockHttpClient.post).toHaveBeenCalledWith(BFF_FEEDBACKS, payload);
      expect(result).toEqual(response);
    });

    it('should handle validation errors', async () => {
      const payload = { message: '', category: 'general' };
      const mockError = new Error('Validation error');
      mockHttpClient.post.mockRejectedValue(mockError);

      await expect(createFeedback(payload)).rejects.toThrow('Validation error');
      expect(mockHttpClient.post).toHaveBeenCalledWith(BFF_FEEDBACKS, payload);
    });
  });

  describe('updateFeedback', () => {
    it('should call httpClient.patch with correct endpoint and payload', async () => {
      const payload = { id: 'test-id', message: 'Updated feedback' };
      const mockData = {
        id: 'test-id',
        message: 'Updated feedback',
        category: 'general',
      };
      const response = mockResponse(mockData);
      mockHttpClient.patch.mockResolvedValue(response);

      const result = await updateFeedback(payload);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        BFF_FEEDBACK(payload.id),
        payload
      );
      expect(result).toEqual(response);
    });

    it('should handle non-existent feedback', async () => {
      const payload = { id: 'non-existent', message: 'Updated feedback' };
      const mockError = new Error('Feedback not found');
      mockHttpClient.patch.mockRejectedValue(mockError);

      await expect(updateFeedback(payload)).rejects.toThrow(
        'Feedback not found'
      );
      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        BFF_FEEDBACK(payload.id),
        payload
      );
    });
  });

  describe('deleteFeedback', () => {
    it('should call httpClient.delete with correct endpoint', async () => {
      const feedbackId = 'test-id';
      const response = mockResponse(undefined, 204);
      mockHttpClient.delete.mockResolvedValue(response);

      const result = await deleteFeedback(feedbackId);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        BFF_FEEDBACK(feedbackId)
      );
      expect(result).toEqual(response);
    });

    it('should handle delete errors', async () => {
      const feedbackId = 'test-id';
      const mockError = new Error('Delete failed');
      mockHttpClient.delete.mockRejectedValue(mockError);

      await expect(deleteFeedback(feedbackId)).rejects.toThrow('Delete failed');
      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        BFF_FEEDBACK(feedbackId)
      );
    });

    it('should encode special characters in delete id', async () => {
      const feedbackId = 'test@id.com';
      const response = mockResponse(undefined, 204);
      mockHttpClient.delete.mockResolvedValue(response);

      await deleteFeedback(feedbackId);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        BFF_FEEDBACK(feedbackId)
      );
    });
  });
});
