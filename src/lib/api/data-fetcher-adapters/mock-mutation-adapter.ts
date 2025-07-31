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
    const state = {
      data: undefined as TData | undefined,
      error: undefined as Error | undefined,
      isLoading: false,
    };

    const mutate = async (variables: TVariables): Promise<TData> => {
      state.isLoading = true;
      state.error = undefined;

      try {
        const response = await mutationFn(variables);
        state.data = response.data;

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
        state.error = errorObj;

        if (options.onError) {
          options.onError(errorObj, variables);
        }

        if (options.onSettled) {
          options.onSettled(undefined, errorObj, variables);
        }

        throw errorObj;
      } finally {
        state.isLoading = false;
      }
    };

    const mutateAsync = mutate;

    const reset = () => {
      state.data = undefined;
      state.error = undefined;
      state.isLoading = false;
    };

    return {
      mutate,
      mutateAsync,
      get data() {
        return state.data;
      },
      get error() {
        return state.error;
      },
      get isLoading() {
        return state.isLoading;
      },
      get isSuccess() {
        return !state.isLoading && !state.error && state.data !== undefined;
      },
      get isError() {
        return !state.isLoading && state.error !== undefined;
      },
      get isIdle() {
        return (
          !state.isLoading &&
          state.data === undefined &&
          state.error === undefined
        );
      },
      reset,
    };
  }
}

export default MockMutationAdapter;
