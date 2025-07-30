import { TanStackMutationAdapter } from "@/lib/api/data-fetcher-adapters/tanstack-mutation-adapter";
import { HttpClientResponse } from "@/lib/types/api/http-client";

// Mock TanStack Query hooks
const mockMutate = jest.fn();
const mockMutateAsync = jest.fn();
const mockReset = jest.fn();
const mockInvalidateQueries = jest.fn();

const mockUseMutation = jest.fn().mockReturnValue({
  mutate: mockMutate,
  mutateAsync: mockMutateAsync,
  data: undefined,
  error: undefined,
  isPending: false,
  isSuccess: false,
  isError: false,
  reset: mockReset,
});

const mockUseQueryClient = jest.fn().mockReturnValue({
  invalidateQueries: mockInvalidateQueries,
});

describe("TanStackMutationAdapter", () => {
  let adapter: TanStackMutationAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new TanStackMutationAdapter(mockUseMutation, mockUseQueryClient);
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

    it("should call useMutation with correct configuration", () => {
      const mutationFn = jest.fn();
      adapter.mutateData(mutationFn);

      expect(mockUseMutation).toHaveBeenCalledWith({
        mutationKey: expect.any(Array),
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
        onSettled: expect.any(Function),
      });
    });

    it("should execute mutation successfully", async () => {
      const mockData = { id: 1, name: "test" };
      const mutationFn = jest.fn().mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<typeof mockData>);

      adapter.mutateData(mutationFn);
      const variables = { name: "test" };

      // Test the mutation function
      const mutationConfig = mockUseMutation.mock.calls[0][0];
      const actualMutationFn = mutationConfig.mutationFn;
      const result = await actualMutationFn(variables);
      expect(result).toEqual(mockData);
      expect(mutationFn).toHaveBeenCalledWith(variables);
    });

    it("should handle mutation error", async () => {
      const error = new Error("Mutation failed");
      const mutationFn = jest.fn().mockRejectedValue(error);

      adapter.mutateData(mutationFn);
      const variables = { name: "test" };

      // Test the mutation function throws error
      const mutationConfig = mockUseMutation.mock.calls[0][0];
      const actualMutationFn = mutationConfig.mutationFn;
      await expect(actualMutationFn(variables)).rejects.toThrow(error);
    });

    it("should invalidate queries on success", async () => {
      const mockData = { id: 1, name: "test" };
      const mutationFn = jest.fn().mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<typeof mockData>);

      adapter.mutateData(mutationFn, {
        invalidateQueries: ["query1", ["query2", "param"]],
      });

      const mutationConfig = mockUseMutation.mock.calls[0][0];
      const actualOnSuccess = mutationConfig.onSuccess;

      await actualOnSuccess(mockData, {});
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["query1"],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["query2", "param"],
      });
    });

    it("should work without callbacks", () => {
      const mutationFn = jest.fn();
      const response = adapter.mutateData(mutationFn);

      expect(response).toBeDefined();
      expect(mockUseMutation).toHaveBeenCalled();
    });

    it("should handle empty invalidateQueries", async () => {
      const mockData = { id: 1, name: "test" };
      const mutationFn = jest.fn().mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<typeof mockData>);

      adapter.mutateData(mutationFn, {
        invalidateQueries: [],
      });

      const mutationConfig = mockUseMutation.mock.calls[0][0];
      const actualOnSuccess = mutationConfig.onSuccess;

      await actualOnSuccess(mockData, {});
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it("should call onSuccess callback when provided", async () => {
      const mockData = { id: 1, name: "test" };
      const mutationFn = jest.fn().mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<typeof mockData>);

      const onSuccess = jest.fn();
      adapter.mutateData(mutationFn, { onSuccess });

      const mutationConfig = mockUseMutation.mock.calls[0][0];
      const actualOnSuccess = mutationConfig.onSuccess;

      await actualOnSuccess(mockData, {});
      expect(onSuccess).toHaveBeenCalled();
    });

    it("should call onError callback when provided", async () => {
      const error = new Error("Mutation failed");
      const mutationFn = jest.fn().mockRejectedValue(error);
      const onError = jest.fn();

      adapter.mutateData(mutationFn, { onError });

      const mutationConfig = mockUseMutation.mock.calls[0][0];
      const actualOnError = mutationConfig.onError;

      await actualOnError(error, {});
      expect(onError).toHaveBeenCalled();
    });

    it("should call onSettled callback when provided", async () => {
      const mockData = { id: 1, name: "test" };
      const mutationFn = jest.fn().mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<typeof mockData>);

      const onSettled = jest.fn();
      adapter.mutateData(mutationFn, { onSettled });

      const mutationConfig = mockUseMutation.mock.calls[0][0];
      const actualOnSettled = mutationConfig.onSettled;

      await actualOnSettled(mockData, null, {});
      expect(onSettled).toHaveBeenCalled();
    });
  });
});
