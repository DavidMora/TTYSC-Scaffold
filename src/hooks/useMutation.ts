import { useState } from "react";
import { mutate } from "swr";

// ESTO ESTÁ MAL

interface MutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  invalidateQueries?: string[];
}

interface MutationResult<T, TVariables> {
  mutate: (variables: TVariables) => Promise<T>;
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  reset: () => void;
}

export const useMutation = <T, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<T>,
  options: MutationOptions<T> = {}
): MutationResult<T, TVariables> => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const executeQuery = async (variables: TVariables): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      setData(result);

      options.onSuccess?.(result);

      if (options.invalidateQueries) {
        await Promise.all(
          options.invalidateQueries.map((queryKey) => mutate(queryKey))
        );
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Mutation failed");
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  };

  return {
    mutate: executeQuery,
    data,
    error,
    isLoading,
    reset,
  };
};
