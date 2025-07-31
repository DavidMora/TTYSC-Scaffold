import { NextRequest } from "next/server";
import { GET } from "@/app/api/feature-flags/route";
import { getAllFeatureFlags } from "@/lib/utils/feature-flags";

// Mock the feature flags utility
jest.mock("@/lib/utils/feature-flags", () => ({
  getAllFeatureFlags: jest.fn(),
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      data,
      init,
      status: init?.status || 200,
      headers: init?.headers || {},
    })),
  },
}));

const mockGetAllFeatureFlags = getAllFeatureFlags as jest.MockedFunction<typeof getAllFeatureFlags>;

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

describe("/api/feature-flags GET", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {} as NextRequest;
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("successful requests", () => {
    it("returns feature flags successfully", async () => {
      const mockFlags = {
        enableAuthentication: true,
        enableNewFeature: false,
        enableBetaFeatures: true,
      };

      mockGetAllFeatureFlags.mockReturnValue(mockFlags);

      const response = await GET(mockRequest);

      expect(mockGetAllFeatureFlags).toHaveBeenCalledTimes(1);
      expect(response.data).toEqual(mockFlags);
      expect(response.status).toBe(200);
      expect(response.headers["Cache-Control"]).toBe("public, max-age=300");
    });

    it("returns default flags when getAllFeatureFlags returns minimal flags", async () => {
      const mockFlags = {
        enableAuthentication: false,
      };

      mockGetAllFeatureFlags.mockReturnValue(mockFlags);

      const response = await GET(mockRequest);

      expect(mockGetAllFeatureFlags).toHaveBeenCalledTimes(1);
      expect(response.data).toEqual(mockFlags);
      expect(response.status).toBe(200);
      expect(response.headers["Cache-Control"]).toBe("public, max-age=300");
    });

    it("includes correct cache headers", async () => {
      const mockFlags = { enableAuthentication: true };
      mockGetAllFeatureFlags.mockReturnValue(mockFlags);

      const response = await GET(mockRequest);

      expect(response.headers["Cache-Control"]).toBe("public, max-age=300");
    });

    it("handles empty flags object", async () => {
      const mockFlags = {};
      mockGetAllFeatureFlags.mockReturnValue(mockFlags);

      const response = await GET(mockRequest);

      expect(response.data).toEqual({});
      expect(response.status).toBe(200);
    });
  });

  describe("error handling", () => {
    it("returns default flags when getAllFeatureFlags throws an error", async () => {
      const error = new Error("Failed to read feature flags file");
      mockGetAllFeatureFlags.mockImplementation(() => {
        throw error;
      });

      const response = await GET(mockRequest);

      expect(mockConsoleError).toHaveBeenCalledWith("Error serving feature flags:", error);
      expect(response.data).toEqual({
        enableAuthentication: true,
      });
      expect(response.status).toBe(200);
    });

    it("handles file system errors gracefully", async () => {
      const error = new Error("ENOENT: no such file or directory");
      mockGetAllFeatureFlags.mockImplementation(() => {
        throw error;
      });

      const response = await GET(mockRequest);

      expect(mockConsoleError).toHaveBeenCalledWith("Error serving feature flags:", error);
      expect(response.data).toEqual({
        enableAuthentication: true,
      });
      expect(response.status).toBe(200);
    });

    it("handles JSON parsing errors gracefully", async () => {
      const error = new SyntaxError("Unexpected token in JSON");
      mockGetAllFeatureFlags.mockImplementation(() => {
        throw error;
      });

      const response = await GET(mockRequest);

      expect(mockConsoleError).toHaveBeenCalledWith("Error serving feature flags:", error);
      expect(response.data).toEqual({
        enableAuthentication: true,
      });
      expect(response.status).toBe(200);
    });

    it("handles unknown errors gracefully", async () => {
      const error = "Unknown error string";
      mockGetAllFeatureFlags.mockImplementation(() => {
        throw error;
      });

      const response = await GET(mockRequest);

      expect(mockConsoleError).toHaveBeenCalledWith("Error serving feature flags:", error);
      expect(response.data).toEqual({
        enableAuthentication: true,
      });
      expect(response.status).toBe(200);
    });
  });

  describe("request handling", () => {
    it("ignores request parameter as expected", async () => {
      const mockFlags = { enableAuthentication: true };
      mockGetAllFeatureFlags.mockReturnValue(mockFlags);

      // The function should work the same regardless of request content
      const mockRequestWithData = {
        url: "http://localhost:3000/api/feature-flags",
        method: "GET",
        headers: new Headers(),
      } as NextRequest;

      const response = await GET(mockRequestWithData);

      expect(response.data).toEqual(mockFlags);
      expect(response.status).toBe(200);
    });
  });

  describe("caching behavior", () => {
    it("sets appropriate cache control headers for client caching", async () => {
      const mockFlags = { enableAuthentication: true };
      mockGetAllFeatureFlags.mockReturnValue(mockFlags);

      const response = await GET(mockRequest);

      // Should cache for 5 minutes (300 seconds)
      expect(response.headers["Cache-Control"]).toBe("public, max-age=300");
      expect(response.status).toBe(200);
    });
  });
});
