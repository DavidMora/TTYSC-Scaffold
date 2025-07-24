import { HttpClient } from "@/lib/api";

// Mock fetch for testing
global.fetch = jest.fn();

describe("API Client with Basic Authentication", () => {
  let apiClient: HttpClient;

  beforeAll(() => {
    // Set environment variables for the test
    process.env.NEXT_PUBLIC_API_USERNAME = "testuser";
    process.env.NEXT_PUBLIC_API_PASSWORD = "testpass";
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";

    // Create apiClient with auth config like in http-client.ts
    const authConfig = {
      username: process.env.NEXT_PUBLIC_API_USERNAME,
      password: process.env.NEXT_PUBLIC_API_PASSWORD,
    };

    apiClient = new HttpClient(undefined, {
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      auth: authConfig,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: (key: string) => {
          if (key === "content-type") return "application/json";
          return null;
        },
        forEach: (callback: (value: string, key: string) => void) => {
          callback("application/json", "content-type");
        },
      },
      json: () => Promise.resolve({ data: "test" }),
      text: () => Promise.resolve("test response"),
    });
  });

  it("should add Basic Auth header to requests", async () => {
    // Act
    await apiClient.get("/test");

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Basic .+$/),
        }),
      })
    );
  });

  it("should encode credentials correctly in Basic Auth header", async () => {
    // Act
    await apiClient.get("/test");

    // Assert
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const headers = fetchCall[1].headers;
    const authHeader = headers.Authorization;

    // Decode the base64 to verify credentials
    const base64Credentials = authHeader.replace("Basic ", "");
    const credentials = atob(base64Credentials);

    // Use the test credentials we set
    const expectedCredentials = "testuser:testpass";
    expect(credentials).toBe(expectedCredentials);
  });

  it("should make request to correct endpoint", async () => {
    // Act
    await apiClient.get("/chats");

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/chats"),
      expect.any(Object)
    );
  });
});
