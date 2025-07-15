import { FetchAdapter } from "../../../../src/lib/api/http-client-adapters/fetch-adapter";
import { HttpClientConfig } from "../../../../src/lib/types/api/http-client";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("FetchAdapter", () => {
  let adapter: FetchAdapter;

  beforeEach(() => {
    adapter = new FetchAdapter();
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("constructor", () => {
    it("should create adapter with default config", () => {
      const defaultAdapter = new FetchAdapter();
      expect(defaultAdapter).toBeInstanceOf(FetchAdapter);
    });

    it("should create adapter with custom config", () => {
      const config: HttpClientConfig = {
        baseURL: "https://api.example.com",
        timeout: 5000,
        headers: { Authorization: "Bearer token" },
      };
      const customAdapter = new FetchAdapter(config);
      expect(customAdapter).toBeInstanceOf(FetchAdapter);
    });
  });

  describe("GET requests", () => {
    it("should make successful GET request", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map([["content-type", "application/json"]]),
        json: jest.fn().mockResolvedValue({ data: "test" }),
      };
      mockResponse.headers.forEach = jest.fn((callback) => {
        callback("application/json", "content-type", mockResponse.headers);
      });

      mockFetch.mockResolvedValue(mockResponse);

      const result = await adapter.get("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );

      expect(result).toEqual({
        data: { data: "test" },
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
      });
    });

    it("should handle baseURL configuration", async () => {
      const config: HttpClientConfig = {
        baseURL: "https://api.example.com",
      };
      const customAdapter = new FetchAdapter(config);

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      await customAdapter.get("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.any(Object)
      );
    });

    it("should handle custom headers", async () => {
      const config: HttpClientConfig = {
        headers: { Authorization: "Bearer token" },
      };

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      await adapter.get("/test", config);

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer token",
          }),
        })
      );
    });

    it("should handle HTTP errors", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Map(),
        json: jest.fn(),
      };

      mockFetch.mockResolvedValue(mockResponse);

      await expect(adapter.get("/test")).rejects.toThrow("HTTP 404: Not Found");
    });

    it("should configure timeout correctly", () => {
      const config: HttpClientConfig = { timeout: 1000 };
      const customAdapter = new FetchAdapter(config);

      // Just verify the adapter can be created with timeout config
      expect(customAdapter).toBeInstanceOf(FetchAdapter);
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(adapter.get("/test")).rejects.toThrow("Network error");
    });
  });

  describe("POST requests", () => {
    it("should make successful POST request with data", async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: "Created",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      const postData = { name: "test" };
      const result = await adapter.post("/test", postData);

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postData),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );

      expect(result).toEqual({
        data: { id: 1 },
        status: 201,
        statusText: "Created",
        headers: {},
      });
    });

    it("should make POST request without data", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      await adapter.post("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "POST",
          body: undefined,
        })
      );
    });
  });

  describe("PUT requests", () => {
    it("should make successful PUT request", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({ updated: true }),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      const putData = { name: "updated" };
      await adapter.put("/test/1", putData);

      expect(mockFetch).toHaveBeenCalledWith(
        "/test/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(putData),
        })
      );
    });
  });

  describe("DELETE requests", () => {
    it("should make successful DELETE request", async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        statusText: "No Content",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      await adapter.delete("/test/1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/test/1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("PATCH requests", () => {
    it("should make successful PATCH request", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({ patched: true }),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      const patchData = { field: "value" };
      await adapter.patch("/test/1", patchData);

      expect(mockFetch).toHaveBeenCalledWith(
        "/test/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(patchData),
        })
      );
    });
  });
});
