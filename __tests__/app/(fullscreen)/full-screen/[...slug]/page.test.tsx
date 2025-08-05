import { notFound } from "next/navigation";
import NotFoundPage from "@/app/(fullscreen)/full-screen/[...slug]/page";

// Mock Next.js notFound function
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

describe("NotFoundPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Functionality", () => {
    it("should call notFound() when the component is rendered", () => {
      // Render the component - this should trigger notFound()
      NotFoundPage();

      expect(notFound).toHaveBeenCalledTimes(1);
    });

    it("should call notFound() without any arguments", () => {
      NotFoundPage();

      expect(notFound).toHaveBeenCalledWith();
    });

    it("should be a function that returns void", () => {
      const result = NotFoundPage();

      expect(result).toBeUndefined();
    });
  });

  describe("Component Behavior", () => {
    it("should trigger Next.js 404 handling", () => {
      // This component is specifically designed to trigger 404 handling
      NotFoundPage();

      // Verify that notFound was called to trigger Next.js's 404 handling
      expect(notFound).toHaveBeenCalled();
    });

    it("should handle multiple calls consistently", () => {
      NotFoundPage();
      NotFoundPage();

      expect(notFound).toHaveBeenCalledTimes(2);
    });
  });

  describe("Integration", () => {
    it("should work as a catch-all route handler", () => {
      // This component serves as a catch-all for unmatched routes
      // under /full-screen/[...slug]

      // Mock the notFound function to not actually throw
      const mockNotFound = notFound as unknown as jest.Mock;
      mockNotFound.mockImplementation(() => {
        // In real Next.js, this would throw and trigger 404 handling
        // For testing, we just verify it was called
      });

      NotFoundPage();

      expect(notFound).toHaveBeenCalled();
    });
  });
});
