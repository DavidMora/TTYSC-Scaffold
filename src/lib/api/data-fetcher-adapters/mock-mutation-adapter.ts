import { HttpClientResponse } from "@/lib/types/api/http-client";
import {
  MutationAdapter,
  MutationOptions,
  MutationResponse,
} from "@/lib/types/api/data-fetcher";

export class MockMutationAdapter implements MutationAdapter {
  mutateData<TData = unknown, TVariables = unknown>(
    mutationKey: unknown[],
    mutationFn: (variables: TVariables) => Promise<HttpClientResponse<TData>>,
    options: MutationOptions<TData, TVariables> = {}
  ): MutationResponse<TData, TVariables> {
    let data: TData | undefined = undefined;
    let error: Error | undefined = undefined;
    let isLoading = false;

    const mutate = async (variables: TVariables): Promise<TData> => {
      isLoading = true;
      error = undefined;

      try {
        const response = await mutationFn(variables);
        data = response.data;

        if (options.onSuccess) {
          options.onSuccess(response.data, variables);
        }

        if (options.onSettled) {
          options.onSettled(response.data, null, variables);
        }

        return response.data;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("Mutation failed");
        error = errorObj;

        if (options.onError) {
          options.onError(errorObj, variables);
        }

        if (options.onSettled) {
          options.onSettled(undefined, errorObj, variables);
        }

        throw errorObj;
      } finally {
        isLoading = false;
      }
    };

    const mutateAsync = mutate;

    const reset = () => {
      data = undefined;
      error = undefined;
      isLoading = false;
    };

    return {
      mutate,
      mutateAsync,
      data,
      error,
      isLoading,
      isSuccess: !isLoading && !error && data !== undefined,
      isError: !isLoading && error !== undefined,
      isIdle: !isLoading && data === undefined && error === undefined,
      reset,
    };
  }
}

export default MockMutationAdapter;
