/**
 * Integration tests for the entire API module
 * Tests the interaction between different components
 */

import {
  httpClient,
  HttpClient,
  dataFetcher,
  DataFetcher,
  FetchAdapter,
  MockAdapter,
} from "../../../src/lib/api";

// Mock fetch globally for integration tests
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("API Module Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("HttpClient and DataFetcher integration", () => {
    it("should work together in a typical usage scenario", async () => {
      // Setup mock response
      const mockData = [
        { id: 1, title: "Test Post 1", body: "Content 1" },
        { id: 2, title: "Test Post 2", body: "Content 2" },
      ];

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map([["content-type", "application/json"]]),
        json: jest.fn().mockResolvedValue(mockData),
      };
      mockResponse.headers.forEach = jest.fn((callback) => {
        callback("application/json", "content-type", mockResponse.headers);
      });

      mockFetch.mockResolvedValue(mockResponse);

      // Create a fetcher function that uses httpClient
      const fetchPosts = () => httpClient.get("/posts");

      // Use dataFetcher with the httpClient fetcher
      const result = dataFetcher.fetchData("posts", fetchPosts);

      // Verify the structure is correct
      expect(result).toEqual({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: expect.any(Function),
      });

      // Verify fetch was not called yet (MockAdapter doesn't actually fetch)
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should allow custom adapter combinations", () => {
      // Create custom HTTP client with specific configuration
      const customHttpClient = new HttpClient(
        new FetchAdapter({
          baseURL: "https://api.custom.com",
          timeout: 5000,
          headers: {
            Authorization: "Bearer test-token",
          },
        })
      );

      // Create custom data fetcher with mock adapter
      const customDataFetcher = new DataFetcher(new MockAdapter());

      // Verify they work together
      const fetchData = () => customHttpClient.get("/data");
      const result = customDataFetcher.fetchData("test-data", fetchData);

      expect(result.isLoading).toBe(true);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it("should handle errors properly in integration", async () => {
      // Mock fetch to throw an error
      mockFetch.mockRejectedValue(new Error("Network error"));

      const customHttpClient = new HttpClient(new FetchAdapter());

      // This should work with MockAdapter (which doesn't actually call the fetcher)
      const fetchData = () => customHttpClient.get("/error");
      const result = dataFetcher.fetchData("error-data", fetchData);

      // MockAdapter always returns loading state regardless of fetcher behavior
      expect(result.isLoading).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("Real-world usage patterns", () => {
    it("should support multiple concurrent requests", () => {
      const fetchUsers = () => httpClient.get("/users");
      const fetchPosts = () => httpClient.get("/posts");
      const fetchComments = () => httpClient.get("/comments");

      const usersResult = dataFetcher.fetchData("users", fetchUsers);
      const postsResult = dataFetcher.fetchData("posts", fetchPosts);
      const commentsResult = dataFetcher.fetchData("comments", fetchComments);

      // All should have the same structure from MockAdapter
      [usersResult, postsResult, commentsResult].forEach((result) => {
        expect(result).toEqual({
          data: undefined,
          error: undefined,
          isLoading: true,
          isValidating: false,
          mutate: expect.any(Function),
        });
      });
    });

    it("should handle different HTTP methods", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      // Test different HTTP methods
      await expect(httpClient.get("/test")).resolves.toBeDefined();
      await expect(
        httpClient.post("/test", { data: "value" })
      ).resolves.toBeDefined();
      await expect(
        httpClient.put("/test/1", { data: "updated" })
      ).resolves.toBeDefined();
      await expect(httpClient.delete("/test/1")).resolves.toBeDefined();
      await expect(
        httpClient.patch("/test/1", { field: "value" })
      ).resolves.toBeDefined();

      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it("should work with generic types", () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      interface Post {
        id: number;
        title: string;
        body: string;
        userId: number;
      }

      const fetchUsers = () => httpClient.get<User[]>("/users");
      const fetchPosts = () => httpClient.get<Post[]>("/posts");

      const usersResult = dataFetcher.fetchData<User[]>("users", fetchUsers);
      const postsResult = dataFetcher.fetchData<Post[]>("posts", fetchPosts);

      // Type checking should work correctly
      expect(usersResult.data).toBeUndefined(); // MockAdapter returns undefined
      expect(postsResult.data).toBeUndefined(); // MockAdapter returns undefined
    });
  });

  describe("Error scenarios", () => {
    it("should handle network failures gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("Network failure"));

      await expect(httpClient.get("/test")).rejects.toThrow("Network failure");
    });

    it("should handle HTTP error responses", async () => {
      const errorResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Map(),
        json: jest.fn(),
      };

      mockFetch.mockResolvedValue(errorResponse);

      await expect(httpClient.get("/test")).rejects.toThrow(
        "HTTP 404: Not Found"
      );
    });

    it("should handle malformed JSON responses", async () => {
      const badResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      };
      badResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(badResponse);

      await expect(httpClient.get("/test")).rejects.toThrow("Invalid JSON");
    });
  });

  describe("Configuration and customization", () => {
    it("should respect configuration hierarchy", async () => {
      const adapterConfig = {
        baseURL: "https://api.example.com",
        headers: { "X-API-Key": "adapter-key" },
      };

      const requestConfig = {
        headers: { "X-Request-ID": "request-123" },
      };

      const customAdapter = new FetchAdapter(adapterConfig);
      const customClient = new HttpClient(customAdapter);

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      await customClient.get("/test", requestConfig);

      // The headers should include Content-Type from defaults, adapter config, and request config
      const callArgs = mockFetch.mock.calls[0];
      const options = callArgs[1];

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          method: "GET",
        })
      );

      // Verify all headers are present
      expect(options.headers).toEqual(
        expect.objectContaining({
          "Content-Type": "application/json", // From default config
          "X-API-Key": "adapter-key", // From adapter config
          "X-Request-ID": "request-123", // From request config
        })
      );
    });

    it("should allow adapter swapping", () => {
      const fetchAdapter = new FetchAdapter({ timeout: 5000 });
      const mockAdapter = new MockAdapter();

      const clientWithFetch = new HttpClient(fetchAdapter);
      const fetcherWithMock = new DataFetcher(mockAdapter);

      expect(clientWithFetch).toBeInstanceOf(HttpClient);
      expect(fetcherWithMock).toBeInstanceOf(DataFetcher);

      // Should be able to use them independently
      const result = fetcherWithMock.fetchData("test", () =>
        clientWithFetch.get("/test")
      );
      expect(result.isLoading).toBe(true);
    });
  });
});
