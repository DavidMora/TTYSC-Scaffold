// Standalone helpers for coverage
export function getIsSuccess(
  isMutating: boolean,
  error: unknown,
  data: unknown
) {
  return !isMutating && !error && data !== undefined;
}
export function getIsError(isMutating: boolean, error: unknown) {
  return !isMutating && error !== undefined;
}
export function getIsIdle(isMutating: boolean, data: unknown, error: unknown) {
  return !isMutating && data === undefined && error === undefined;
}
import { HttpClientResponse } from "@/lib/types/api/http-client";
import {
  MutationAdapter,
  MutationOptions,
  MutationResponse,
} from "@/lib/types/api/data-fetcher";
import useSWRMutation from "swr/mutation";

interface SWRMutationResult<T> {
  data: T | undefined;
  error: Error | undefined;
  isMutating: boolean;
  trigger: (variables?: unknown) => Promise<T>;
  reset: () => void;
}

type UseSWRMutationHook = <T, TVariables>(
  key: string | readonly unknown[] | null,
  fetcher: (key: string, options: { arg: TVariables }) => Promise<T>
) => SWRMutationResult<T>;

export class SWRMutationAdapter implements MutationAdapter {
  private readonly useSWRMutation: UseSWRMutationHook;

  constructor(swrMutationHook?: UseSWRMutationHook) {
    this.useSWRMutation = swrMutationHook || useSWRMutation;
  }

  // Expose swrMutationFn for test coverage if requested
  mutateData<TData = unknown, TVariables = unknown>(
    mutationFn: (variables: TVariables) => Promise<HttpClientResponse<TData>>,
    options: MutationOptions<TData, TVariables> = {},
    __testExposeInternal?: {
      swrMutationFn?: (
        fn: (key: string, opts: { arg: TVariables }) => Promise<TData>
      ) => void;
    }
  ): MutationResponse<TData, TVariables> {
    const swrMutationFn = async (
      key: string,
      { arg }: { arg: TVariables }
    ): Promise<TData> => {
      const response = await mutationFn(arg);
      return response.data;
    };
    __testExposeInternal?.swrMutationFn?.(swrMutationFn);

    const { data, error, isMutating, trigger, reset } = this.useSWRMutation(
      "mutation-key", // SWR Mutation doesn't require a specific key
      swrMutationFn
    );

    const mutate = async (variables: TVariables): Promise<TData> => {
      try {
        const result = await trigger(variables);

        if (options.onSuccess) {
          options.onSuccess(result, variables);
        }

        if (options.onSettled) {
          options.onSettled(result, null, variables);
        }

        // Invalidate queries if specified
        if (options.invalidateQueries) {
          const { mutate: swrMutate } = await import("swr");
          await Promise.all(
            options.invalidateQueries.map((queryKey) => swrMutate(queryKey))
          );
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Mutation failed");

        if (options.onError) {
          options.onError(error, variables);
        }

        if (options.onSettled) {
          options.onSettled(undefined, error, variables);
        }

        throw error;
      }
    };

    const mutateAsync = mutate;

    // Use getter properties for isSuccess and isError for better coverage
    return {
      mutate,
      mutateAsync,
      data,
      error,
      isLoading: isMutating,
      isSuccess: getIsSuccess(isMutating, error, data),
      isError: getIsError(isMutating, error),
      isIdle: getIsIdle(isMutating, data, error),
      reset,
    };
  }
}

export default SWRMutationAdapter;
