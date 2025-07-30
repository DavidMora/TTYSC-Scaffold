import { MockMutationAdapter } from "@/lib/api/data-fetcher-adapters/mock-mutation-adapter";
import { HttpClientResponse } from "@/lib/types/api/http-client";

describe("MockMutationAdapter", () => {
  let adapter: MockMutationAdapter;

  beforeEach(() => {
    adapter = new MockMutationAdapter();
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

    it("should successfully mutate data and return result", async () => {
      const mockData = { id: 1, name: "test" };
      const mutationFn = jest.fn().mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<typeof mockData>);

      const response = adapter.mutateData(mutationFn);
      const variables = { name: "test" };

      const result = await response.mutate(variables);

      expect(result).toEqual(mockData);
      expect(mutationFn).toHaveBeenCalledWith(variables);
    });

    it("should handle mutation error", async () => {
      const error = new Error("Mutation failed");
      const mutationFn = jest.fn().mockRejectedValue(error);

      const response = adapter.mutateData(mutationFn);
      const variables = { name: "test" };

      await expect(response.mutate(variables)).rejects.toThrow(error);
    });

    it("should call onSuccess callback when provided", async () => {
      const mockData = { id: 1, name: "test" };
      const onSuccess = jest.fn();
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
      const mutationFn = jest.fn().mockRejectedValue(error);

      const response = adapter.mutateData(mutationFn, { onError });
      const variables = { name: "test" };

      await expect(response.mutate(variables)).rejects.toThrow();

      expect(onError).toHaveBeenCalledWith(error, variables);
    });

    it("should call onSettled callback on success", async () => {
      const mockData = { id: 1, name: "test" };
      const onSettled = jest.fn();
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
      const mutationFn = jest.fn().mockRejectedValue(error);

      const response = adapter.mutateData(mutationFn, { onSettled });
      const variables = { name: "test" };

      await expect(response.mutate(variables)).rejects.toThrow();

      expect(onSettled).toHaveBeenCalledWith(undefined, error, variables);
    });

    it("should reset state when reset is called", () => {
      const mutationFn = jest.fn();
      const response = adapter.mutateData(mutationFn);

      expect(typeof response.reset).toBe("function");
      expect(() => response.reset()).not.toThrow();
    });

    it("should work with mutateAsync", async () => {
      const mockData = { id: 1, name: "test" };
      const mutationFn = jest.fn().mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: "OK",
      } as HttpClientResponse<typeof mockData>);

      const response = adapter.mutateData(mutationFn);
      const variables = { name: "test" };

      const result = await response.mutateAsync(variables);

      expect(result).toEqual(mockData);
    });
  });
});
