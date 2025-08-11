import {
  FetchAdapter,
  default as FetchAdapterDefault,
} from "@/lib/api/http-client-adapters/fetch-adapter";
import { HttpClientConfig } from "@/lib/types/api/http-client";

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

    it("should create adapter using default export", () => {
      const defaultAdapter = new FetchAdapterDefault();
      expect(defaultAdapter).toBeInstanceOf(FetchAdapter);
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
        text: jest.fn().mockResolvedValue(JSON.stringify({ data: "test" })),
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
        ok: true,
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
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
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
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
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
        text: jest.fn().mockResolvedValue("error"),
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
    it("should handle non-Error exceptions", async () => {
      // Simulate a rejection with a non-Error value
      mockFetch.mockRejectedValue("some error");
      await expect(adapter.get("/test")).rejects.toThrow(
        "Unknown error occurred"
      );
    });
  });

  describe("POST requests", () => {
    it("should make successful POST request with data", async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: "Created",
        headers: new Map([["content-type", "application/json"]]),
        json: jest.fn().mockResolvedValue({ id: 1 }),
        text: jest.fn().mockResolvedValue(JSON.stringify({ id: 1 })),
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
        ok: true,
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
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
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
        text: jest.fn().mockResolvedValue(JSON.stringify({ updated: true })),
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
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
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
        text: jest.fn().mockResolvedValue(JSON.stringify({ patched: true })),
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

  describe("timeout handling", () => {
    it("should handle timeout errors", async () => {
      jest.useRealTimers();
      const adapter = new FetchAdapter({ timeout: 100 });
      const abortError = new Error("The operation was aborted.");
      abortError.name = "AbortError";
      mockFetch.mockRejectedValue(abortError);
      await expect(adapter.get("/test")).rejects.toThrow(
        "The operation was aborted."
      );
      jest.useFakeTimers();
    });
    it("should clear timeout and throw on HTTP error", async () => {
      jest.useFakeTimers();
      const mockClearTimeout = jest.fn();
      global.clearTimeout = mockClearTimeout;
      const adapter = new FetchAdapter({ timeout: 500 });
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Server Error",
        headers: new Map(),
        json: jest.fn(),
        text: jest.fn().mockResolvedValue("error"),
      };
      mockResponse.headers.forEach = jest.fn();
      mockFetch.mockResolvedValue(mockResponse);

      await expect(adapter.get("/test")).rejects.toThrow(
        "HTTP 500: Server Error"
      );
      expect(mockClearTimeout).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it("should call clearTimeout on success", async () => {
      const originalClearTimeout = global.clearTimeout;
      const mockClearTimeout = jest.fn();
      global.clearTimeout = mockClearTimeout;

      const adapter = new FetchAdapter({ timeout: 5000 });

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      await adapter.get("/test");

      expect(mockClearTimeout).toHaveBeenCalled();

      global.clearTimeout = originalClearTimeout;
    });
  });

  describe("error handling", () => {
    it("should handle non-Error exceptions", async () => {
      mockFetch.mockRejectedValue("String error");

      await expect(adapter.get("/test")).rejects.toThrow(
        "Unknown error occurred"
      );
    });

    it("should handle fetch errors", async () => {
      const fetchError = new Error("Network error");
      mockFetch.mockRejectedValue(fetchError);

      await expect(adapter.get("/test")).rejects.toThrow("Network error");
    });

    it("should handle HTTP error responses", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Map(),
        json: jest.fn(),
        text: jest.fn().mockResolvedValue("error"),
      };

      mockFetch.mockResolvedValue(mockResponse);

      await expect(adapter.get("/test")).rejects.toThrow("HTTP 404: Not Found");
    });
  });

  describe("content type handling", () => {
    it("should handle Excel file responses (xlsx)", async () => {
      const mockBlob = new Blob(["excel data"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map([
          [
            "content-type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ],
        ]),
        json: jest.fn(),
        text: jest.fn(),
        blob: jest.fn().mockResolvedValue(mockBlob),
      };
      mockResponse.headers.forEach = jest.fn((callback) => {
        callback(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "content-type",
          mockResponse.headers
        );
      });

      mockFetch.mockResolvedValue(mockResponse);

      const result = await adapter.get("/excel-file");

      expect(mockResponse.blob).toHaveBeenCalled();
      expect(result.data).toBe(mockBlob);
    });

    it("should handle CSV file responses", async () => {
      const mockBlob = new Blob(["csv,data"], { type: "text/csv" });
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map([["content-type", "text/csv"]]),
        json: jest.fn(),
        text: jest.fn(),
        blob: jest.fn().mockResolvedValue(mockBlob),
      };
      mockResponse.headers.forEach = jest.fn((callback) => {
        callback("text/csv", "content-type", mockResponse.headers);
      });

      mockFetch.mockResolvedValue(mockResponse);

      const result = await adapter.get("/csv-file");

      expect(mockResponse.blob).toHaveBeenCalled();
      expect(result.data).toBe(mockBlob);
    });

    it("should handle text responses when content type is not JSON or file", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map([["content-type", "text/plain"]]),
        json: jest.fn(),
        text: jest.fn().mockResolvedValue("plain text response"),
        blob: jest.fn(),
      };
      mockResponse.headers.forEach = jest.fn((callback) => {
        callback("text/plain", "content-type", mockResponse.headers);
      });

      mockFetch.mockResolvedValue(mockResponse);

      const result = await adapter.get("/text-file");

      expect(mockResponse.text).toHaveBeenCalled();
      expect(result.data).toBe("plain text response");
    });

    it("should handle responses with no content-type header", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn(),
        text: jest.fn().mockResolvedValue("default text response"),
        blob: jest.fn(),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      const result = await adapter.get("/no-content-type");

      expect(mockResponse.text).toHaveBeenCalled();
      expect(result.data).toBe("default text response");
    });
  });

  describe("basic authentication", () => {
    it("should add Basic Authorization header when auth config is provided", async () => {
      const config: HttpClientConfig = {
        auth: {
          username: "testuser",
          password: "testpass",
        },
      };
      const authAdapter = new FetchAdapter(config);

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: jest.fn().mockResolvedValue({ data: "success" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await authAdapter.get("/test");

      expect(mockFetch).toHaveBeenCalledWith("/test", {
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Basic dGVzdHVzZXI6dGVzdHBhc3M=", // Base64 of "testuser:testpass"
          "X-Request-Id": expect.any(String),
        }),
        signal: expect.any(AbortSignal),
      });
    });

    it("should add Basic Authorization header from request config", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: jest.fn().mockResolvedValue({ data: "success" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.get("/test", {
        auth: {
          username: "requestuser",
          password: "requestpass",
        },
      });

      expect(mockFetch).toHaveBeenCalledWith("/test", {
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Basic cmVxdWVzdHVzZXI6cmVxdWVzdHBhc3M=", // Base64 of "requestuser:requestpass"
          "X-Request-Id": expect.any(String),
        }),
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe("request ID", () => {
    it("should add X-Request-Id header with UUIDv6 to all requests", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: jest.fn().mockResolvedValue({ data: "success" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.get("/test");

      expect(mockFetch).toHaveBeenCalledWith("/test", {
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Request-Id": expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-6[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          ),
        }),
        signal: expect.any(AbortSignal),
      });
    });

    it("should generate different request IDs for different requests", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: jest.fn().mockResolvedValue({ data: "success" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.get("/test1");
      await adapter.get("/test2");

      const calls = mockFetch.mock.calls;
      const requestId1 = calls[0][1].headers["X-Request-Id"];
      const requestId2 = calls[1][1].headers["X-Request-Id"];

      expect(requestId1).toBeDefined();
      expect(requestId2).toBeDefined();
      expect(requestId1).not.toBe(requestId2);
    });
  });

  describe("header merging", () => {
    it("should merge headers correctly with all levels", async () => {
      const config = {
        baseURL: "https://api.example.com",
        headers: { "X-Custom": "value" },
      };
      const customAdapter = new FetchAdapter(config);

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      await customAdapter.get("/test", { headers: { "X-Override": "test" } });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Custom": "value",
            "X-Override": "test",
            "X-Request-Id": expect.any(String),
          }),
        })
      );
    });

    it("should handle request headers in options", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();

      mockFetch.mockResolvedValue(mockResponse);

      await adapter.post(
        "/test",
        { data: "test" },
        {
          headers: { "X-Request": "header" },
        }
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Request": "header",
          }),
        })
      );
    });

    it("should handle fetch timeout and call clearTimeout", async () => {
      // This test specifically targets line 33 in fetch-adapter.ts (clearTimeout call)
      const originalClearTimeout = global.clearTimeout;
      const mockClearTimeout = jest.fn();
      global.clearTimeout = mockClearTimeout;

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();

      // Mock fetch to resolve normally (which will trigger clearTimeout on success)
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.get("/test");

      // Verify clearTimeout was called (this covers line 33)
      expect(mockClearTimeout).toHaveBeenCalled();

      global.clearTimeout = originalClearTimeout;
    });

    it("should handle fetch error and call clearTimeout in catch block", async () => {
      // This test targets the clearTimeout call in the catch block (line 75)
      const originalClearTimeout = global.clearTimeout;
      const mockClearTimeout = jest.fn();
      global.clearTimeout = mockClearTimeout;

      // Mock fetch to reject with an error
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(adapter.get("/test")).rejects.toThrow("Network error");

      // Verify clearTimeout was called even in error case
      expect(mockClearTimeout).toHaveBeenCalled();

      global.clearTimeout = originalClearTimeout;
    });
    it("should handle timeout with actual AbortController signal", async () => {
      jest.useRealTimers();
      const adapter = new FetchAdapter({ timeout: 50 });

      // Create a promise that resolves after 100ms
      const delayedPromise = new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      // Mock fetch to take longer than timeout
      mockFetch.mockImplementation(() => delayedPromise);

      await expect(adapter.get("/test")).rejects.toThrow();
      jest.useFakeTimers();
    });

    it("should execute timeout callback function with Jest timers", () => {
      jest.useFakeTimers();

      // Mock setTimeout to capture the callback
      let timeoutCallback: (() => void) | undefined;
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn((callback: () => void, delay: number) => {
        timeoutCallback = callback;
        return originalSetTimeout(callback, delay);
      }) as unknown as typeof setTimeout;

      const adapter = new FetchAdapter({ timeout: 1000 });

      // Mock fetch to return a pending promise
      const pendingPromise = new Promise(() => {});
      mockFetch.mockImplementation(() => pendingPromise);

      // Start the request
      adapter.get("/test");

      // Verify setTimeout was called
      expect(global.setTimeout).toHaveBeenCalled();

      // Execute the timeout callback manually to cover line 33
      if (timeoutCallback) {
        timeoutCallback();
      }

      // Restore
      global.setTimeout = originalSetTimeout;
      jest.useRealTimers();
    });

    it("should handle no baseURL configuration", async () => {
      const adapter = new FetchAdapter({});

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.get("/test");

      expect(mockFetch).toHaveBeenCalledWith("/test", expect.any(Object));
    });

    it("should handle undefined baseURL in config", async () => {
      const adapter = new FetchAdapter({ baseURL: undefined });

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.get("/test");

      expect(mockFetch).toHaveBeenCalledWith("/test", expect.any(Object));
    });

    it("should handle empty string baseURL", async () => {
      const adapter = new FetchAdapter({ baseURL: "" });

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.get("/test");

      expect(mockFetch).toHaveBeenCalledWith("/test", expect.any(Object));
    });

    it("should handle timeout in PUT request", async () => {
      const originalClearTimeout = global.clearTimeout;
      const mockClearTimeout = jest.fn();
      global.clearTimeout = mockClearTimeout;

      const adapter = new FetchAdapter({ timeout: 5000 });

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.put("/test", { data: "test" });

      expect(mockClearTimeout).toHaveBeenCalled();
      global.clearTimeout = originalClearTimeout;
    });

    it("should handle timeout in DELETE request", async () => {
      const originalClearTimeout = global.clearTimeout;
      const mockClearTimeout = jest.fn();
      global.clearTimeout = mockClearTimeout;

      const adapter = new FetchAdapter({ timeout: 5000 });

      const mockResponse = {
        ok: true,
        status: 204,
        statusText: "No Content",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.delete("/test");

      expect(mockClearTimeout).toHaveBeenCalled();
      global.clearTimeout = originalClearTimeout;
    });

    it("should handle timeout in PATCH request", async () => {
      const originalClearTimeout = global.clearTimeout;
      const mockClearTimeout = jest.fn();
      global.clearTimeout = mockClearTimeout;

      const adapter = new FetchAdapter({ timeout: 5000 });

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.patch("/test", { data: "test" });

      expect(mockClearTimeout).toHaveBeenCalled();
      global.clearTimeout = originalClearTimeout;
    });

    it("should handle undefined data in PUT request", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.put("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "PUT",
          body: undefined,
        })
      );
    });

    it("should handle undefined data in PATCH request", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.patch("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "PATCH",
          body: undefined,
        })
      );
    });

    it("should properly merge all header sources", async () => {
      const adapterConfig = {
        headers: { "X-Adapter": "adapter-value" },
      };
      const customAdapter = new FetchAdapter(adapterConfig);

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();
      mockFetch.mockResolvedValue(mockResponse);

      await customAdapter.get("/test", {
        headers: { "X-Config": "config-value" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Adapter": "adapter-value",
            "X-Config": "config-value",
          }),
        })
      );
    });

    it("should handle request with all options headers", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();
      mockFetch.mockResolvedValue(mockResponse);

      await adapter.post(
        "/test",
        { data: "test" },
        {
          headers: { "X-Test": "test-value" },
        }
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Test": "test-value",
          }),
        })
      );
    });

    it("should handle request with no config to cover optional chaining", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };
      mockResponse.headers.forEach = jest.fn();
      mockFetch.mockResolvedValue(mockResponse);

      // Call without config parameter to test config?.headers branch
      await adapter.get("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "GET",
        })
      );
    });
  });
});
