import { POST } from "@/app/api/feature-flags/reload/route";

// Mock the feature flags module
jest.mock("@/lib/utils/feature-flags", () => ({
  clearFeatureFlagsCache: jest.fn(),
  getFeatureFlags: jest.fn(),
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data: any, options?: any) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      ok: true,
    })),
  },
  NextRequest: jest.fn(),
}));

import { NextResponse, NextRequest } from "next/server";
import { clearFeatureFlagsCache, getFeatureFlags } from "@/lib/utils/feature-flags";

const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;
const mockClearFeatureFlagsCache = clearFeatureFlagsCache as jest.MockedFunction<typeof clearFeatureFlagsCache>;
const mockGetFeatureFlags = getFeatureFlags as jest.MockedFunction<typeof getFeatureFlags>;

describe("/api/feature-flags/reload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClearFeatureFlagsCache.mockReset();
    mockGetFeatureFlags.mockReset();
  });

  it("should clear cache and return fresh flags successfully", async () => {
    // Arrange
    const mockFlags = {
      enableAuthentication: false,
    };
    
    mockGetFeatureFlags.mockResolvedValue(mockFlags);
    const mockRequest = {} as NextRequest;

    // Act
    await POST(mockRequest);

    // Assert
    expect(mockClearFeatureFlagsCache).toHaveBeenCalledTimes(1);
    expect(mockGetFeatureFlags).toHaveBeenCalledTimes(1);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Feature flags cache cleared successfully",
        flags: mockFlags,
      },
      { status: 200 }
    );
  });

  it("should return error when clearFeatureFlagsCache throws an error", async () => {
    // Arrange
    mockClearFeatureFlagsCache.mockImplementation(() => {
      throw new Error("Cache clear failed");
    });
    const mockRequest = {} as NextRequest;

    // Act
    await POST(mockRequest);

    // Assert
    expect(mockClearFeatureFlagsCache).toHaveBeenCalledTimes(1);
    expect(mockGetFeatureFlags).not.toHaveBeenCalled();
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: "Failed to clear feature flags cache" },
      { status: 500 }
    );
  });

  it("should return error when getFeatureFlags throws an error", async () => {
    // Arrange
    mockGetFeatureFlags.mockRejectedValue(new Error("Failed to fetch flags"));
    const mockRequest = {} as NextRequest;

    // Act
    await POST(mockRequest);

    // Assert
    expect(mockClearFeatureFlagsCache).toHaveBeenCalledTimes(1);
    expect(mockGetFeatureFlags).toHaveBeenCalledTimes(1);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: "Failed to clear feature flags cache" },
      { status: 500 }
    );
  });

  it("should handle non-Error exceptions from getFeatureFlags", async () => {
    // Arrange
    mockGetFeatureFlags.mockRejectedValue("String error");
    const mockRequest = {} as NextRequest;

    // Act
    await POST(mockRequest);

    // Assert
    expect(mockClearFeatureFlagsCache).toHaveBeenCalledTimes(1);
    expect(mockGetFeatureFlags).toHaveBeenCalledTimes(1);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: "Failed to clear feature flags cache" },
      { status: 500 }
    );
  });

  it("should handle successful cache clear with different flag values", async () => {
    // Arrange
    const mockFlags = {
      enableAuthentication: true,
    };
    
    mockGetFeatureFlags.mockResolvedValue(mockFlags);
    const mockRequest = {} as NextRequest;

    // Act
    await POST(mockRequest);

    // Assert
    expect(mockClearFeatureFlagsCache).toHaveBeenCalledTimes(1);
    expect(mockGetFeatureFlags).toHaveBeenCalledTimes(1);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Feature flags cache cleared successfully",
        flags: mockFlags,
      },
      { status: 200 }
    );
  });

  it("should handle cache clear when clearFeatureFlagsCache returns void", async () => {
    // Arrange
    const mockFlags = {
      enableAuthentication: false,
    };
    
    mockClearFeatureFlagsCache.mockReturnValue(undefined);
    mockGetFeatureFlags.mockResolvedValue(mockFlags);
    const mockRequest = {} as NextRequest;

    // Act
    await POST(mockRequest);

    // Assert
    expect(mockClearFeatureFlagsCache).toHaveBeenCalledTimes(1);
    expect(mockGetFeatureFlags).toHaveBeenCalledTimes(1);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        message: "Feature flags cache cleared successfully",
        flags: mockFlags,
      },
      { status: 200 }
    );
  });
});
