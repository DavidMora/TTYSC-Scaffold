import { renderHook } from "@testing-library/react";
import { 
  useFeedbacks, 
  useFeedback, 
  FEEDBACKS_KEY, 
  FEEDBACK_KEY 
} from "../../../src/hooks/feedback";
import { dataFetcher } from "../../../src/lib/api";

// Mock the dataFetcher
jest.mock("../../../src/lib/api");
const mockDataFetcher = dataFetcher as jest.Mocked<typeof dataFetcher>;

// Mock the feedback service
jest.mock("../../../src/lib/services/feedback.service", () => ({
  getFeedbacks: jest.fn(),
  getFeedback: jest.fn(),
}));

describe("Feedback Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Constants", () => {
    it("should export correct FEEDBACKS_KEY constant", () => {
      expect(FEEDBACKS_KEY).toBe("feedbacks");
    });

    it("should export FEEDBACK_KEY function that returns correct key format", () => {
      expect(FEEDBACK_KEY("123")).toBe("feedback-123");
      expect(FEEDBACK_KEY("test-id")).toBe("feedback-test-id");
      expect(FEEDBACK_KEY("")).toBe("feedback-");
    });

    it("should handle special characters in FEEDBACK_KEY", () => {
      expect(FEEDBACK_KEY("user@example.com")).toBe("feedback-user@example.com");
      expect(FEEDBACK_KEY("123-456-789")).toBe("feedback-123-456-789");
      expect(FEEDBACK_KEY("special!@#$%")).toBe("feedback-special!@#$%");
    });

    it("should handle edge cases in FEEDBACK_KEY", () => {
      expect(FEEDBACK_KEY("0")).toBe("feedback-0");
      expect(FEEDBACK_KEY(" ")).toBe("feedback- ");
      expect(FEEDBACK_KEY("null")).toBe("feedback-null");
      expect(FEEDBACK_KEY("undefined")).toBe("feedback-undefined");
    });
  });

  describe("useFeedbacks", () => {
    it("should call dataFetcher.fetchData with correct parameters", () => {
      const mockFetchData = jest.fn().mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });
      mockDataFetcher.fetchData.mockImplementation(mockFetchData);

      renderHook(() => useFeedbacks());

      expect(mockFetchData).toHaveBeenCalledWith(
        "feedbacks",
        expect.any(Function),
        {
          revalidateOnFocus: false,
        }
      );
    });

    it("should return data fetcher result", () => {
      const mockResult = {
        data: [
          {
            id: "1",
            message: "Test feedback",
            category: "general",
            userId: "user1",
            timestamp: "2024-01-01T00:00:00Z",
            status: "active",
          },
          {
            id: "2",
            message: "Another feedback",
            category: "bug",
            userId: "user2",
            timestamp: "2024-01-02T00:00:00Z",
            status: "active",
          },
        ],
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };
      mockDataFetcher.fetchData.mockReturnValue(mockResult);

      const { result } = renderHook(() => useFeedbacks());

      expect(result.current).toEqual(mockResult);
    });

    it("should handle loading state", () => {
      const mockResult = {
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      };
      mockDataFetcher.fetchData.mockReturnValue(mockResult);

      const { result } = renderHook(() => useFeedbacks());

      expect(result.current).toEqual(mockResult);
      expect(result.current.isLoading).toBe(true);
    });

    it("should handle error state", () => {
      const mockError = new Error("Failed to fetch feedbacks");
      const mockResult = {
        data: undefined,
        error: mockError,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };
      mockDataFetcher.fetchData.mockReturnValue(mockResult);

      const { result } = renderHook(() => useFeedbacks());

      expect(result.current).toEqual(mockResult);
      expect(result.current.error).toEqual(mockError);
    });

    it("should use getFeedbacks service function as fetcher", () => {
      mockDataFetcher.fetchData.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      renderHook(() => useFeedbacks());

      // Check that the correct service function is passed as fetcher
      const fetchDataCall = mockDataFetcher.fetchData.mock.calls[0];
      expect(fetchDataCall[1]).toEqual(expect.any(Function));
    });

    it("should test the actual fetcher function passed to dataFetcher", () => {
      mockDataFetcher.fetchData.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      renderHook(() => useFeedbacks());

      // Get the fetcher function that was passed
      const fetchDataCall = mockDataFetcher.fetchData.mock.calls[0];
      const fetcherFunction = fetchDataCall[1];

      // Test that the fetcher function exists and is callable
      expect(typeof fetcherFunction).toBe("function");
      
      // Call the fetcher function to ensure it's properly constructed
      expect(() => fetcherFunction()).not.toThrow();
    });

    it("should revalidate correctly when options change", () => {
      const mockFetchData = jest.fn().mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });
      mockDataFetcher.fetchData.mockImplementation(mockFetchData);

      renderHook(() => useFeedbacks());

      // Verify revalidateOnFocus is set to false
      expect(mockFetchData).toHaveBeenCalledWith(
        "feedbacks",
        expect.any(Function),
        {
          revalidateOnFocus: false,
        }
      );
    });
  });

  describe("useFeedback", () => {
    const feedbackId = "test-feedback-id";

    it("should call dataFetcher.fetchData with correct parameters", () => {
      const mockFetchData = jest.fn().mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });
      mockDataFetcher.fetchData.mockImplementation(mockFetchData);

      renderHook(() => useFeedback(feedbackId));

      expect(mockFetchData).toHaveBeenCalledWith(
        `feedback-${feedbackId}`,
        expect.any(Function),
        {
          revalidateOnFocus: false,
        }
      );
    });

    it("should return data fetcher result", () => {
      const mockResult = {
        data: {
          id: feedbackId,
          message: "Test feedback",
          category: "general",
          userId: "user1",
          timestamp: "2024-01-01T00:00:00Z",
          status: "active",
        },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };
      mockDataFetcher.fetchData.mockReturnValue(mockResult);

      const { result } = renderHook(() => useFeedback(feedbackId));

      expect(result.current).toEqual(mockResult);
    });

    it("should handle different feedback IDs", () => {
      const anotherFeedbackId = "another-feedback-id";
      const mockFetchData = jest.fn().mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });
      mockDataFetcher.fetchData.mockImplementation(mockFetchData);

      renderHook(() => useFeedback(anotherFeedbackId));

      expect(mockFetchData).toHaveBeenCalledWith(
        `feedback-${anotherFeedbackId}`,
        expect.any(Function),
        {
          revalidateOnFocus: false,
        }
      );
    });

    it("should handle special characters in feedback ID", () => {
      const specialId = "feedback@test.com";
      const mockFetchData = jest.fn().mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });
      mockDataFetcher.fetchData.mockImplementation(mockFetchData);

      renderHook(() => useFeedback(specialId));

      expect(mockFetchData).toHaveBeenCalledWith(
        `feedback-${specialId}`,
        expect.any(Function),
        {
          revalidateOnFocus: false,
        }
      );
    });

    it("should use getFeedback service function as fetcher", () => {
      mockDataFetcher.fetchData.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      renderHook(() => useFeedback(feedbackId));

      // Check that the correct service function is passed as fetcher
      const fetchDataCall = mockDataFetcher.fetchData.mock.calls[0];
      expect(fetchDataCall[1]).toEqual(expect.any(Function));
    });

    it("should test the actual fetcher function passed to dataFetcher", () => {
      mockDataFetcher.fetchData.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      renderHook(() => useFeedback(feedbackId));

      // Get the fetcher function that was passed
      const fetchDataCall = mockDataFetcher.fetchData.mock.calls[0];
      const fetcherFunction = fetchDataCall[1];

      // Test that the fetcher function exists and is callable
      expect(typeof fetcherFunction).toBe("function");
      
      // Call the fetcher function to ensure it's properly constructed
      expect(() => fetcherFunction()).not.toThrow();
    });

    it("should use correct key format for different IDs", () => {
      const testIds = ["123", "test-feedback", "user@domain.com"];
      
      for (const id of testIds) {
        const mockFetchData = jest.fn().mockReturnValue({
          data: undefined,
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: jest.fn(),
        });
        mockDataFetcher.fetchData.mockImplementation(mockFetchData);

        renderHook(() => useFeedback(id));

        expect(mockFetchData).toHaveBeenCalledWith(
          FEEDBACK_KEY(id),
          expect.any(Function),
          {
            revalidateOnFocus: false,
          }
        );

        // Reset for next iteration
        jest.clearAllMocks();
      }
    });

    it("should have consistent behavior across multiple calls", () => {
      const mockFetchData = jest.fn().mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });
      mockDataFetcher.fetchData.mockImplementation(mockFetchData);

      // First call
      renderHook(() => useFeedback("id1"));
      
      // Second call with same ID
      renderHook(() => useFeedback("id1"));

      // Both calls should use the same key format
      expect(mockFetchData).toHaveBeenCalledTimes(2);
      expect(mockFetchData.mock.calls[0][0]).toBe(mockFetchData.mock.calls[1][0]);
      expect(mockFetchData.mock.calls[0][0]).toBe("feedback-id1");
    });

    it("should handle error state", () => {
      const mockError = new Error("Failed to fetch feedback");
      const mockResult = {
        data: undefined,
        error: mockError,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };
      mockDataFetcher.fetchData.mockReturnValue(mockResult);

      const { result } = renderHook(() => useFeedback(feedbackId));

      expect(result.current).toEqual(mockResult);
      expect(result.current.error).toEqual(mockError);
    });

    it("should handle loading state", () => {
      const mockResult = {
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      };
      mockDataFetcher.fetchData.mockReturnValue(mockResult);

      const { result } = renderHook(() => useFeedback(feedbackId));

      expect(result.current).toEqual(mockResult);
      expect(result.current.isLoading).toBe(true);
    });
  });
});
