import { POST } from "@/app/api/feature-flags/reload/route";

// Mock NextResponse first
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data: any) => ({
      json: () => Promise.resolve(data),
      status: 200,
      ok: true,
    })),
  },
}));

// Mock the feature flags utility
jest.mock("@/lib/utils/feature-flags", () => ({
  clearFeatureFlagsCache: jest.fn(),
  getAllFeatureFlags: jest.fn(),
}));

// Import after mocking
import { clearFeatureFlagsCache, getAllFeatureFlags } from "@/lib/utils/feature-flags";
import { NextResponse } from "next/server";

const mockClearFeatureFlagsCache = clearFeatureFlagsCache as jest.MockedFunction<typeof clearFeatureFlagsCache>;
const mockGetAllFeatureFlags = getAllFeatureFlags as jest.MockedFunction<typeof getAllFeatureFlags>;
const mockNextResponseJson = NextResponse.json as jest.MockedFunction<typeof NextResponse.json>;

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

describe("/api/feature-flags/reload POST", () => {
  const mockRequest = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockClearFeatureFlagsCache.mockImplementation(() => {});
    mockGetAllFeatureFlags.mockImplementation(() => ({ enableAuthentication: true }));
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("successful requests", () => {
    it("clears cache and returns fresh flags successfully", async () => {
      const mockFlags = {
        enableAuthentication: true,
      };

      mockGetAllFeatureFlags.mockReturnValue(mockFlags);

      await POST(mockRequest);

      expect(mockClearFeatureFlagsCache).toHaveBeenCalledTimes(1);
      expect(mockGetAllFeatureFlags).toHaveBeenCalledTimes(1);
      expect(mockNextResponseJson).toHaveBeenCalledWith({
        message: "Feature flags cache cleared successfully",
        flags: mockFlags,
      }, { status: 200 });
    });

    it("clears cache and returns minimal flags", async () => {
      const mockFlags = {
        enableAuthentication: false,
      };

      mockGetAllFeatureFlags.mockReturnValue(mockFlags);

      await POST(mockRequest);

      expect(mockClearFeatureFlagsCache).toHaveBeenCalledTimes(1);
      expect(mockGetAllFeatureFlags).toHaveBeenCalledTimes(1);
      expect(mockNextResponseJson).toHaveBeenCalledWith({
        message: "Feature flags cache cleared successfully",
        flags: mockFlags,
      }, { status: 200 });
    });

    it("calls functions in correct order", async () => {
      const mockFlags = { enableAuthentication: true };
      const callOrder: string[] = [];
      
      mockClearFeatureFlagsCache.mockImplementation(() => {
        callOrder.push("clearCache");
      });
      mockGetAllFeatureFlags.mockImplementation(() => {
        callOrder.push("getAllFlags");
        return mockFlags;
      });

      await POST(mockRequest);

      expect(callOrder).toEqual(["clearCache", "getAllFlags"]);
    });
  });

  describe("error handling", () => {
    it("returns 500 error when clearFeatureFlagsCache throws an error", async () => {
      const error = new Error("Failed to clear cache");
      mockClearFeatureFlagsCache.mockImplementation(() => {
        throw error;
      });

      await POST(mockRequest);

      expect(mockConsoleError).toHaveBeenCalledWith("Error clearing feature flags cache:", error);
      expect(mockNextResponseJson).toHaveBeenCalledWith({
        error: "Failed to clear feature flags cache",
      }, { status: 500 });
    });

    it("returns 500 error when getAllFeatureFlags throws an error", async () => {
      const error = new Error("Failed to read feature flags");
      // Reset clearFeatureFlagsCache to not throw
      mockClearFeatureFlagsCache.mockImplementation(() => {});
      mockGetAllFeatureFlags.mockImplementation(() => {
        throw error;
      });

      await POST(mockRequest);

      expect(mockConsoleError).toHaveBeenCalledWith("Error clearing feature flags cache:", error);
      expect(mockNextResponseJson).toHaveBeenCalledWith({
        error: "Failed to clear feature flags cache",
      }, { status: 500 });
      // Clear cache should still be called even if getAllFeatureFlags fails
      expect(mockClearFeatureFlagsCache).toHaveBeenCalledTimes(1);
    });

    it("handles file system errors gracefully", async () => {
      const error = new Error("ENOENT: no such file or directory");
      mockClearFeatureFlagsCache.mockImplementation(() => {
        throw error;
      });

      await POST(mockRequest);

      expect(mockConsoleError).toHaveBeenCalledWith("Error clearing feature flags cache:", error);
      expect(mockNextResponseJson).toHaveBeenCalledWith({
        error: "Failed to clear feature flags cache",
      }, { status: 500 });
    });

    it("handles unknown errors gracefully", async () => {
      const error = "Unknown error string";
      mockClearFeatureFlagsCache.mockImplementation(() => {
        throw error;
      });

      await POST(mockRequest);

      expect(mockConsoleError).toHaveBeenCalledWith("Error clearing feature flags cache:", error);
      expect(mockNextResponseJson).toHaveBeenCalledWith({
        error: "Failed to clear feature flags cache",
      }, { status: 500 });
    });
  });

  describe("cache behavior", () => {
    it("always clears cache before getting fresh flags", async () => {
      const mockFlags = { enableAuthentication: true };
      // Ensure clean mock implementations
      mockClearFeatureFlagsCache.mockImplementation(() => {});
      mockGetAllFeatureFlags.mockImplementation(() => mockFlags);

      await POST(mockRequest);

      expect(mockClearFeatureFlagsCache).toHaveBeenCalledTimes(1);
      expect(mockGetAllFeatureFlags).toHaveBeenCalledTimes(1);
    });

    it("provides success message and fresh flags in response", async () => {
      const mockFlags = {
        enableAuthentication: false,
      };
      // Ensure clean mock implementations
      mockClearFeatureFlagsCache.mockImplementation(() => {});
      mockGetAllFeatureFlags.mockImplementation(() => mockFlags);

      await POST(mockRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith({
        message: "Feature flags cache cleared successfully",
        flags: mockFlags,
      }, { status: 200 });
    });
  });
});
