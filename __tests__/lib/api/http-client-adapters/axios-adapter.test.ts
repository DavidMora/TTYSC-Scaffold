import { AxiosAdapter } from "../../../../src/lib/api/http-client-adapters/axios-adapter";
import axios from "axios";

// Mock axios
jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("AxiosAdapter", () => {
  let adapter: AxiosAdapter;
  let mockAxiosInstance: jest.Mocked<{
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
    delete: jest.Mock;
    patch: jest.Mock;
  }>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
    adapter = new AxiosAdapter();
  });

  it("should create an instance successfully", () => {
    expect(adapter).toBeInstanceOf(AxiosAdapter);
    expect(mockedAxios.create).toHaveBeenCalled();
  });

  it("should be exportable for conditional usage", () => {
    expect(AxiosAdapter).toBeDefined();
    expect(typeof AxiosAdapter).toBe("function");
  });

  it("should test the adapter with mocked Axios", async () => {
    const mockResponse = {
      data: { test: "data" },
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
    };

    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    const result = await adapter.get("/test");

    expect(result).toEqual({
      data: { test: "data" },
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
    });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith("/test", undefined);
  });

  it("should handle GET requests", async () => {
    const mockResponse = {
      data: { id: 1 },
      status: 200,
      statusText: "OK",
      headers: {},
    };

    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    const result = await adapter.get("/test", { timeout: 5000 });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith("/test", {
      timeout: 5000,
    });
    expect(result).toEqual({
      data: { id: 1 },
      status: 200,
      statusText: "OK",
      headers: {},
    });
  });

  it("should handle POST requests", async () => {
    const mockResponse = {
      data: { id: 1, name: "Created" },
      status: 201,
      statusText: "Created",
      headers: {},
    };

    mockAxiosInstance.post.mockResolvedValue(mockResponse);

    const testData = { name: "Test" };
    const result = await adapter.post("/test", testData, {
      timeout: 3000,
    });

    expect(mockAxiosInstance.post).toHaveBeenCalledWith("/test", testData, {
      timeout: 3000,
    });
    expect(result).toEqual({
      data: { id: 1, name: "Created" },
      status: 201,
      statusText: "Created",
      headers: {},
    });
  });

  it("should handle PUT requests", async () => {
    const mockResponse = {
      data: { id: 1, name: "Updated" },
      status: 200,
      statusText: "OK",
      headers: {},
    };

    mockAxiosInstance.put.mockResolvedValue(mockResponse);

    const testData = { name: "Updated Test" };
    const result = await adapter.put("/test/1", testData);

    expect(mockAxiosInstance.put).toHaveBeenCalledWith(
      "/test/1",
      testData,
      undefined
    );
    expect(result).toEqual({
      data: { id: 1, name: "Updated" },
      status: 200,
      statusText: "OK",
      headers: {},
    });
  });

  it("should handle DELETE requests", async () => {
    const mockResponse = {
      data: {},
      status: 204,
      statusText: "No Content",
      headers: {},
    };

    mockAxiosInstance.delete.mockResolvedValue(mockResponse);

    const result = await adapter.delete("/test/1");

    expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/test/1", undefined);
    expect(result).toEqual({
      data: {},
      status: 204,
      statusText: "No Content",
      headers: {},
    });
  });

  it("should handle PATCH requests", async () => {
    const mockResponse = {
      data: { id: 1, name: "Patched" },
      status: 200,
      statusText: "OK",
      headers: {},
    };

    mockAxiosInstance.patch.mockResolvedValue(mockResponse);

    const testData = { name: "Patched Test" };
    const result = await adapter.patch("/test/1", testData, {
      headers: { custom: "header" },
    });

    expect(mockAxiosInstance.patch).toHaveBeenCalledWith("/test/1", testData, {
      headers: { custom: "header" },
    });
    expect(result).toEqual({
      data: { id: 1, name: "Patched" },
      status: 200,
      statusText: "OK",
      headers: {},
    });
  });

  it("should export AxiosAdapter as default", async () => {
    const axiosAdapterModule = await import(
      "../../../../src/lib/api/http-client-adapters/axios-adapter"
    );
    expect(axiosAdapterModule.default).toBe(AxiosAdapter);
  });
});
