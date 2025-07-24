import { HttpClient, FetchAdapter } from "../../../src/lib/api";

describe("HttpClient with FetchAdapter", () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient(new FetchAdapter());
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("GET requests", () => {
    it("should make a successful GET request", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: jest.fn().mockResolvedValue({ data: "test" }),
        text: jest.fn().mockResolvedValue(JSON.stringify({ data: "test" })),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await httpClient.get("/test");

      expect(global.fetch).toHaveBeenCalledWith(
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

    it("should handle GET request errors", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(httpClient.get("/test")).rejects.toThrow(
        "HTTP 404: Not Found"
      );
    });
  });

  describe("POST requests", () => {
    it("should make a successful POST request with data", async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: "Created",
        headers: new Headers({ "content-type": "application/json" }),
        json: jest.fn().mockResolvedValue({ id: 1, name: "Test" }),
        text: jest
          .fn()
          .mockResolvedValue(JSON.stringify({ id: 1, name: "Test" })),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const testData = { name: "Test" };
      const result = await httpClient.post("/test", testData);

      expect(global.fetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(testData),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );

      expect(result).toEqual({
        data: { id: 1, name: "Test" },
        status: 201,
        ok: true,
        statusText: "Created",
        headers: { "content-type": "application/json" },
      });
    });
  });

  describe("Configuration", () => {
    it("should use baseURL when configured", async () => {
      const customClient = new HttpClient(
        new FetchAdapter({
          baseURL: "https://api.example.com",
        })
      );

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await customClient.get("/users");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.any(Object)
      );
    });

    it("should include custom headers", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await httpClient.get("/users", {
        headers: {
          Authorization: "Bearer token123",
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/users",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer token123",
          }),
        })
      );
    });
  });

  describe("HTTP Methods", () => {
    beforeEach(() => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(JSON.stringify({})),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    });

    it("should make PUT requests", async () => {
      const testData = { id: 1, name: "Updated" };
      await httpClient.put("/test/1", testData);

      expect(global.fetch).toHaveBeenCalledWith(
        "/test/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(testData),
        })
      );
    });

    it("should make DELETE requests", async () => {
      await httpClient.delete("/test/1");

      expect(global.fetch).toHaveBeenCalledWith(
        "/test/1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    it("should make PATCH requests", async () => {
      const testData = { name: "Patched" };
      await httpClient.patch("/test/1", testData);

      expect(global.fetch).toHaveBeenCalledWith(
        "/test/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(testData),
        })
      );
    });
  });
});
