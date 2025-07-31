import { GET } from "@/app/api/feature-flags/route";

// Mock the feature flags module
jest.mock("@/lib/utils/feature-flags", () => ({
  getFeatureFlags: jest.fn(),
  DEFAULT_FLAGS: {
    enableAuthentication: true,
  },
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
import { getFeatureFlags, DEFAULT_FLAGS } from "@/lib/utils/feature-flags";

const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;
const mockGetFeatureFlags = getFeatureFlags as jest.MockedFunction<typeof getFeatureFlags>;

describe("/api/feature-flags", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return feature flags successfully", async () => {
    // Arrange
    const mockFlags = {
      enableAuthentication: true,
    };
    
    mockGetFeatureFlags.mockResolvedValue(mockFlags);
    const mockRequest = {} as NextRequest;

    // Act
    await GET(mockRequest);

    // Assert
    expect(mockGetFeatureFlags).toHaveBeenCalledTimes(1);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      mockFlags,
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300",
        },
      }
    );
  });

  it("should return default flags when getFeatureFlags throws an error", async () => {
    // Arrange
    mockGetFeatureFlags.mockRejectedValue(new Error("Failed to fetch flags"));
    const mockRequest = {} as NextRequest;

    // Act
    await GET(mockRequest);

    // Assert
    expect(mockGetFeatureFlags).toHaveBeenCalledTimes(1);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      DEFAULT_FLAGS,
      { status: 200 }
    );
  });

  it("should return default flags when getFeatureFlags throws non-Error", async () => {
    // Arrange
    mockGetFeatureFlags.mockRejectedValue("String error");
    const mockRequest = {} as NextRequest;

    // Act
    await GET(mockRequest);

    // Assert
    expect(mockGetFeatureFlags).toHaveBeenCalledTimes(1);
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      DEFAULT_FLAGS,
      { status: 200 }
    );
  });

  it("should include proper cache headers on successful response", async () => {
    // Arrange
    const mockFlags = { enableAuthentication: false };
    mockGetFeatureFlags.mockResolvedValue(mockFlags);
    const mockRequest = {} as NextRequest;

    // Act
    await GET(mockRequest);

    // Assert
    const call = mockNextResponse.json.mock.calls[0];
    const [data, options] = call;
    
    expect(data).toBe(mockFlags);
    expect(options).toEqual({
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  });

  it("should handle minimal flags object", async () => {
    // Arrange
    const minimalFlags = { enableAuthentication: true };
    mockGetFeatureFlags.mockResolvedValue(minimalFlags);
    const mockRequest = {} as NextRequest;

    // Act
    await GET(mockRequest);

    // Assert
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      minimalFlags,
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300",
        },
      }
    );
  });

  it("should handle timeout or network errors", async () => {
    // Arrange
    mockGetFeatureFlags.mockRejectedValue(new Error("Network timeout"));
    const mockRequest = {} as NextRequest;

    // Act
    await GET(mockRequest);

    // Assert
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      DEFAULT_FLAGS,
      { status: 200 }
    );
  });
});
