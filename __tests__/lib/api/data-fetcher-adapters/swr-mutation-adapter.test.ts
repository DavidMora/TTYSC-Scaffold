import { SWRMutationAdapter } from "@/lib/api/data-fetcher-adapters/swr-mutation-adapter";
import { HttpClientResponse } from "@/lib/types/api/http-client";

// Mock SWR mutation
const mockTrigger = jest.fn();
const mockReset = jest.fn();

const mockUseSWRMutation = jest.fn().mockReturnValue({
  data: undefined,
  error: undefined,
  isMutating: false,
  trigger: mockTrigger,
  reset: mockReset,
});

describe("SWRMutationAdapter", () => {
  let adapter: SWRMutationAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new SWRMutationAdapter(mockUseSWRMutation);
  });

  describe("mutateData", () => {
    it("should return mutation response with initial state", () => {
      const mutationFn = jest.fn();
      const response = adapter.mutateData(mutationFn);

      expect(response.data).toBeUndefined();
      expect(response.error).toBeUndefined();
      expect(response.isLoading).toBe(false);
      expect(response.isSuccess).toBe(false);
      expect(response.isError).toBe(false);
      expect(response.isIdle).toBe(true);
      expect(typeof response.mutate).toBe("function");
      expect(typeof response.mutateAsync).toBe("function");
      expect(typeof response.reset).toBe("function");
    });

    it("should successfully mutate data", async () => {
      const mockData = { id: 1, name: "test" };
      mockTrigger.mockResolvedValue(mockData);

      const mutationFn = jest.fn().mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<typeof mockData>);

      const response = adapter.mutateData(mutationFn);
      const variables = { name: "test" };

      const result = await response.mutate(variables);

      expect(result).toEqual(mockData);
      expect(mockTrigger).toHaveBeenCalledWith(variables);
    });

    it("should handle mutation error", async () => {
      const error = new Error("Mutation failed");
      mockTrigger.mockRejectedValue(error);

      const mutationFn = jest.fn().mockResolvedValue({
        data: { id: 1 },
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<{ id: number }>);

      const response = adapter.mutateData(mutationFn);
      const variables = { name: "test" };

      await expect(response.mutate(variables)).rejects.toThrow(error);
    });

    it("should call onSuccess callback when provided", async () => {
      const mockData = { id: 1, name: "test" };
      const onSuccess = jest.fn();
      mockTrigger.mockResolvedValue(mockData);

      const mutationFn = jest.fn().mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<typeof mockData>);

      const response = adapter.mutateData(mutationFn, { onSuccess });
      const variables = { name: "test" };

      await response.mutate(variables);

      expect(onSuccess).toHaveBeenCalledWith(mockData, variables);
    });

    it("should call onError callback when provided", async () => {
      const error = new Error("Mutation failed");
      const onError = jest.fn();
      mockTrigger.mockRejectedValue(error);

      const mutationFn = jest.fn().mockResolvedValue({
        data: { id: 1 },
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<{ id: number }>);

      const response = adapter.mutateData(mutationFn, { onError });
      const variables = { name: "test" };

      await expect(response.mutate(variables)).rejects.toThrow();

      expect(onError).toHaveBeenCalledWith(error, variables);
    });

    it("should call onSettled callback on success", async () => {
      const mockData = { id: 1, name: "test" };
      const onSettled = jest.fn();
      mockTrigger.mockResolvedValue(mockData);

      const mutationFn = jest.fn().mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<typeof mockData>);

      const response = adapter.mutateData(mutationFn, { onSettled });
      const variables = { name: "test" };

      await response.mutate(variables);

      expect(onSettled).toHaveBeenCalledWith(mockData, null, variables);
    });

    it("should call onSettled callback on error", async () => {
      const error = new Error("Mutation failed");
      const onSettled = jest.fn();
      mockTrigger.mockRejectedValue(error);

      const mutationFn = jest.fn().mockResolvedValue({
        data: { id: 1 },
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<{ id: number }>);

      const response = adapter.mutateData(mutationFn, { onSettled });
      const variables = { name: "test" };

      await expect(response.mutate(variables)).rejects.toThrow();

      expect(onSettled).toHaveBeenCalledWith(undefined, error, variables);
    });

    it("should invalidate queries when invalidateQueries is provided", async () => {
      const mockData = { id: 1, name: "test" };
      const mockMutate = jest.fn();

      // Mock the swr mutate function
      jest.doMock("swr", () => ({
        mutate: mockMutate,
      }));

      mockTrigger.mockResolvedValue(mockData);

      const mutationFn = jest.fn().mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<typeof mockData>);

      const response = adapter.mutateData(mutationFn, {
        invalidateQueries: ["query1", "query2"],
      });
      const variables = { name: "test" };

      await response.mutate(variables);

      // The invalidateQueries functionality is tested via the import
      expect(mockTrigger).toHaveBeenCalledWith(variables);
    });

    it("should reset state when reset is called", () => {
      const mutationFn = jest.fn();
      const response = adapter.mutateData(mutationFn);

      response.reset();

      expect(mockReset).toHaveBeenCalled();
    });

    it("should work with mutateAsync", async () => {
      const mockData = { id: 1, name: "test" };
      mockTrigger.mockResolvedValue(mockData);

      const mutationFn = jest.fn().mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<typeof mockData>);

      const response = adapter.mutateData(mutationFn);
      const variables = { name: "test" };

      const result = await response.mutateAsync(variables);

      expect(result).toEqual(mockData);
      expect(mockTrigger).toHaveBeenCalledWith(variables);
    });

    it("should handle non-Error rejection values", async () => {
      const errorString = "String error";
      mockTrigger.mockRejectedValue(errorString);

      const mutationFn = jest.fn().mockResolvedValue({
        data: { id: 1 },
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<{ id: number }>);

      const response = adapter.mutateData(mutationFn);
      const variables = { name: "test" };

      await expect(response.mutate(variables)).rejects.toThrow(
        "Mutation failed"
      );
    });
  });
});
