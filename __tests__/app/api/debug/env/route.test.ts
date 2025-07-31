import { GET } from "@/app/api/debug/env/route";

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

// Import the mocked NextResponse to get the mock function
import { NextResponse, NextRequest } from "next/server";
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe("/api/debug/env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.env to original state before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  it("should return environment variables with default values", async () => {
    // Arrange
    const mockRequest = {} as NextRequest;

    // Act
    await GET(mockRequest);

    // Assert
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        "FEATURE_FLAG_ENABLE_AUTHENTICATION": undefined,
        "ENABLE_AUTHENTICATION": undefined,
        "NODE_ENV": process.env.NODE_ENV,
        "allEnvVars": [],
      },
      { status: 200 }
    );
  });

  it("should return specific environment variables when set", async () => {
    // Arrange
    process.env.FEATURE_FLAG_ENABLE_AUTHENTICATION = "true";
    process.env.ENABLE_AUTHENTICATION = "azure";
    process.env.FEATURE_FLAG_TEST = "value";
    
    const mockRequest = {} as NextRequest;

    // Act
    await GET(mockRequest);

    // Assert
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        "FEATURE_FLAG_ENABLE_AUTHENTICATION": "true",
        "ENABLE_AUTHENTICATION": "azure",
        "NODE_ENV": process.env.NODE_ENV,
        "allEnvVars": ["FEATURE_FLAG_ENABLE_AUTHENTICATION", "ENABLE_AUTHENTICATION", "FEATURE_FLAG_TEST"],
      },
      { status: 200 }
    );
  });

  it("should filter environment variables correctly", async () => {
    // Arrange
    process.env.FEATURE_FLAG_CUSTOM = "custom_value";
    process.env.ENABLE_AUTH_PROVIDER = "provider";
    process.env.UNRELATED_VAR = "unrelated";
    process.env.ANOTHER_FEATURE_FLAG = "another";
    
    const mockRequest = {} as NextRequest;

    // Act
    await GET(mockRequest);

    // Assert
    const call = mockNextResponse.json.mock.calls[0];
    const responseData = call[0] as any;
    
    expect(responseData.allEnvVars).toEqual(
      expect.arrayContaining(["FEATURE_FLAG_CUSTOM", "ENABLE_AUTH_PROVIDER", "ANOTHER_FEATURE_FLAG"])
    );
    expect(responseData.allEnvVars).not.toContain("UNRELATED_VAR");
  });

  it("should return empty array when no matching environment variables exist", async () => {
    // Arrange
    const originalNodeEnv = process.env.NODE_ENV;
    delete process.env.FEATURE_FLAG_ENABLE_AUTHENTICATION;
    delete process.env.ENABLE_AUTHENTICATION;
    process.env.SOME_OTHER_VAR = "value";
    const mockRequest = {} as NextRequest;

    // Act
    await GET(mockRequest);

    // Assert
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        "FEATURE_FLAG_ENABLE_AUTHENTICATION": undefined,
        "ENABLE_AUTHENTICATION": undefined,
        "NODE_ENV": originalNodeEnv,
        "allEnvVars": [],
      },
      { status: 200 }
    );
  });

  it("should handle empty environment gracefully", async () => {
    // Arrange
    const originalNodeEnv = process.env.NODE_ENV;
    delete process.env.FEATURE_FLAG_ENABLE_AUTHENTICATION;
    delete process.env.ENABLE_AUTHENTICATION;
    const mockRequest = {} as NextRequest;

    // Act
    await GET(mockRequest);

    // Assert
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        "FEATURE_FLAG_ENABLE_AUTHENTICATION": undefined,
        "ENABLE_AUTHENTICATION": undefined,
        "NODE_ENV": originalNodeEnv,
        "allEnvVars": [],
      },
      { status: 200 }
    );
  });
});
