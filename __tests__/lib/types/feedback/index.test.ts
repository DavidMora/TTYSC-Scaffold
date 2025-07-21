import {
  Feedback,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  FeedbackResponse,
  FeedbackListResponse,
} from "../../../src/lib/types/feedback";

describe("Feedback Types", () => {
  describe("Feedback interface", () => {
    it("should have all required properties", () => {
      const feedback: Feedback = {
        id: "test-id",
        userId: "user-123",
        message: "This is a test feedback",
        timestamp: "2024-01-01T00:00:00Z",
        status: "active",
        category: "general",
      };

      expect(feedback.id).toBe("test-id");
      expect(feedback.userId).toBe("user-123");
      expect(feedback.message).toBe("This is a test feedback");
      expect(feedback.timestamp).toBe("2024-01-01T00:00:00Z");
      expect(feedback.status).toBe("active");
      expect(feedback.category).toBe("general");
    });

    it("should allow different feedback categories", () => {
      const categories = ["general", "bug", "feature", "improvement"];

      categories.forEach((category) => {
        const feedback: Feedback = {
          id: `test-${category}`,
          userId: "user-123",
          message: `Test ${category} feedback`,
          timestamp: "2024-01-01T00:00:00Z",
          status: "active",
          category,
        };

        expect(feedback.category).toBe(category);
      });
    });

    it("should allow different status values", () => {
      const statuses = ["active", "resolved", "pending", "archived"];

      statuses.forEach((status) => {
        const feedback: Feedback = {
          id: `test-${status}`,
          userId: "user-123",
          message: `Test feedback with ${status} status`,
          timestamp: "2024-01-01T00:00:00Z",
          status,
          category: "general",
        };

        expect(feedback.status).toBe(status);
      });
    });
  });

  describe("CreateFeedbackRequest type", () => {
    it("should omit system-generated fields from Feedback", () => {
      const createRequest: CreateFeedbackRequest = {
        message: "New feedback",
        category: "feature",
      };

      expect(createRequest.message).toBe("New feedback");
      expect(createRequest.category).toBe("feature");

      // These properties should not exist in CreateFeedbackRequest
      expect("id" in createRequest).toBe(false);
      expect("userId" in createRequest).toBe(false);
      expect("timestamp" in createRequest).toBe(false);
      expect("status" in createRequest).toBe(false);
    });

    it("should allow all valid categories", () => {
      const categories = [
        "general",
        "bug",
        "feature",
        "improvement",
        "ui",
        "performance",
      ];

      categories.forEach((category) => {
        const createRequest: CreateFeedbackRequest = {
          message: `Test ${category} feedback`,
          category,
        };

        expect(createRequest.category).toBe(category);
      });
    });
  });

  describe("UpdateFeedbackRequest type", () => {
    it("should require id and allow partial updates", () => {
      const updateRequest: UpdateFeedbackRequest = {
        id: "test-id",
        message: "Updated feedback message",
      };

      expect(updateRequest.id).toBe("test-id");
      expect(updateRequest.message).toBe("Updated feedback message");
    });

    it("should allow updating individual fields", () => {
      const updateMessage: UpdateFeedbackRequest = {
        id: "test-id",
        message: "New message",
      };

      const updateCategory: UpdateFeedbackRequest = {
        id: "test-id",
        category: "bug",
      };

      const updateStatus: UpdateFeedbackRequest = {
        id: "test-id",
        status: "resolved",
      };

      expect(updateMessage.message).toBe("New message");
      expect(updateCategory.category).toBe("bug");
      expect(updateStatus.status).toBe("resolved");
    });

    it("should allow updating multiple fields at once", () => {
      const updateRequest: UpdateFeedbackRequest = {
        id: "test-id",
        message: "Updated message",
        category: "improvement",
        status: "resolved",
      };

      expect(updateRequest.id).toBe("test-id");
      expect(updateRequest.message).toBe("Updated message");
      expect(updateRequest.category).toBe("improvement");
      expect(updateRequest.status).toBe("resolved");
    });
  });

  describe("FeedbackResponse interface", () => {
    it("should have correct structure for successful response", () => {
      const response: FeedbackResponse = {
        success: true,
        data: {
          id: "test-id",
          userId: "user-123",
          message: "Test feedback",
          timestamp: "2024-01-01T00:00:00Z",
          status: "active",
          category: "general",
        },
        message: "Feedback created successfully",
      };

      expect(response.success).toBe(true);
      expect(response.data.id).toBe("test-id");
      expect(response.message).toBe("Feedback created successfully");
    });

    it("should allow response without message", () => {
      const response: FeedbackResponse = {
        success: true,
        data: {
          id: "test-id",
          userId: "user-123",
          message: "Test feedback",
          timestamp: "2024-01-01T00:00:00Z",
          status: "active",
          category: "general",
        },
      };

      expect(response.success).toBe(true);
      expect(response.data.id).toBe("test-id");
      expect(response.message).toBeUndefined();
    });

    it("should handle error response", () => {
      const response: FeedbackResponse = {
        success: false,
        data: {
          id: "",
          userId: "",
          message: "",
          timestamp: "",
          status: "",
          category: "",
        },
        message: "Failed to create feedback",
      };

      expect(response.success).toBe(false);
      expect(response.message).toBe("Failed to create feedback");
    });
  });

  describe("FeedbackListResponse interface", () => {
    it("should have correct structure for successful list response", () => {
      const response: FeedbackListResponse = {
        success: true,
        data: [
          {
            id: "1",
            userId: "user-1",
            message: "First feedback",
            timestamp: "2024-01-01T00:00:00Z",
            status: "active",
            category: "general",
          },
          {
            id: "2",
            userId: "user-2",
            message: "Second feedback",
            timestamp: "2024-01-02T00:00:00Z",
            status: "resolved",
            category: "bug",
          },
        ],
        totalCount: 2,
        message: "Feedbacks retrieved successfully",
      };

      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
      expect(response.totalCount).toBe(2);
      expect(response.message).toBe("Feedbacks retrieved successfully");
    });

    it("should handle empty list response", () => {
      const response: FeedbackListResponse = {
        success: true,
        data: [],
        totalCount: 0,
      };

      expect(response.success).toBe(true);
      expect(response.data.length).toBe(0);
      expect(response.totalCount).toBe(0);
      expect(response.message).toBeUndefined();
    });

    it("should handle error list response", () => {
      const response: FeedbackListResponse = {
        success: false,
        data: [],
        totalCount: 0,
        message: "Failed to retrieve feedbacks",
      };

      expect(response.success).toBe(false);
      expect(response.data.length).toBe(0);
      expect(response.totalCount).toBe(0);
      expect(response.message).toBe("Failed to retrieve feedbacks");
    });

    it("should handle large datasets", () => {
      const largeFeedbackArray: Feedback[] = Array.from(
        { length: 100 },
        (_, index) => ({
          id: `feedback-${index + 1}`,
          userId: `user-${index + 1}`,
          message: `Feedback message ${index + 1}`,
          timestamp: `2024-01-${String(index + 1).padStart(2, "0")}T00:00:00Z`,
          status: index % 2 === 0 ? "active" : "resolved",
          category: ["general", "bug", "feature"][index % 3],
        })
      );

      const response: FeedbackListResponse = {
        success: true,
        data: largeFeedbackArray,
        totalCount: 100,
      };

      expect(response.success).toBe(true);
      expect(response.data.length).toBe(100);
      expect(response.totalCount).toBe(100);
      expect(response.data[0].id).toBe("feedback-1");
      expect(response.data[99].id).toBe("feedback-100");
    });
  });
});
