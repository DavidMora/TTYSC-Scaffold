import { GET } from "@/app/api/auth/config/route";

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

// Import the mocked NextResponse to get the mock function
import { NextResponse } from "next/server";
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe("/api/auth/config", () => {
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

  it("should return default config when no environment variables are set", async () => {
    // Remove auth-related env vars
    delete process.env.AUTH_PROCESS;
    delete process.env.AUTO_LOGIN;

    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: false,
    });
  });

  it("should return azure auth process when AUTH_PROCESS is set to azure", async () => {
    process.env.AUTH_PROCESS = 'azure';
    process.env.AUTO_LOGIN = 'false';

    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: false,
    });
  });

  it("should return disabled auth when AUTH_PROCESS is none", async () => {
    process.env.AUTH_PROCESS = 'none';
    process.env.AUTO_LOGIN = 'false';

    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'none',
      isAuthDisabled: true,
      autoLogin: false,
    });
  });

  it("should return auto login when AUTO_LOGIN is true", async () => {
    process.env.AUTH_PROCESS = 'azure';
    process.env.AUTO_LOGIN = 'true';

    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: true,
    });
  });

  it("should handle different AUTH_PROCESS values", async () => {
    process.env.AUTH_PROCESS = 'custom';
    process.env.AUTO_LOGIN = 'false';

    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'custom',
      isAuthDisabled: false,
      autoLogin: false,
    });
  });

  it("should handle AUTO_LOGIN with non-true values", async () => {
    process.env.AUTH_PROCESS = 'azure';
    process.env.AUTO_LOGIN = 'false';

    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: false,
    });

    // Test with empty string
    process.env.AUTO_LOGIN = '';
    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: false,
    });
  });
});
