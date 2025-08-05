import { HttpClientResponse } from "@/lib/types/api/http-client";
import {
  MutationAdapter,
  MutationOptions,
  MutationResponse,
} from "@/lib/types/api/data-fetcher";
import {
  useMutation as useTanStackMutation,
  useQueryClient,
} from "@tanstack/react-query";

type UseMutationHook = typeof useTanStackMutation;
type UseQueryClientHook = typeof useQueryClient;

export class TanStackMutationAdapter implements MutationAdapter {
  private readonly useMutation: UseMutationHook;
  private readonly useQueryClient: UseQueryClientHook;

  constructor(
    useMutationHook = useTanStackMutation,
    useQueryClientHook = useQueryClient
  ) {
    this.useMutation = useMutationHook;
    this.useQueryClient = useQueryClientHook;
  }

  mutateData<TData = unknown, TVariables = unknown>(
    mutationKey: unknown[],
    mutationFn: (variables: TVariables) => Promise<HttpClientResponse<TData>>,
    options: MutationOptions<TData, TVariables> = {}
  ): MutationResponse<TData, TVariables> {
    const queryClient = this.useQueryClient();

    const tanStackMutationFn = async (
      variables: TVariables
    ): Promise<TData> => {
      const response = await mutationFn(variables);
      return response.data;
    };

    const {
      mutate: tanStackMutate,
      mutateAsync: tanStackMutateAsync,
      data,
      error,
      isPending: isLoading,
      isSuccess,
      isError,
      reset,
    } = this.useMutation({
      mutationKey,
      mutationFn: tanStackMutationFn,
      onSuccess: (result, variables) => {
        options.onSuccess?.(result, variables);

        // Invalidate queries if specified
        options.invalidateQueries?.forEach((queryKey) => {
          const normalizedKey = Array.isArray(queryKey)
            ? queryKey
            : [queryKey];
          queryClient.invalidateQueries({ queryKey: normalizedKey });
        });
      },
      onError: (error, variables) => {
        options.onError?.(error, variables);
      },
      onSettled: (data, error, variables) => {
        options.onSettled?.(data, error, variables);
      },
    });

    // Wrap the mutate functions to return Promise<TData>
    const mutate = async (variables: TVariables): Promise<TData> => {
      return new Promise<TData>((resolve, reject) => {
        tanStackMutate(variables, {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error),
        });
      });
    };

    const mutateAsync = async (variables: TVariables): Promise<TData> => {
      return tanStackMutateAsync(variables);
    };

    return {
      mutate,
      mutateAsync,
      data,
      error: error || undefined,
      isLoading,
      isSuccess,
      isError,
      isIdle: !isLoading && !isSuccess && !isError,
      reset,
    };
  }
}

export default TanStackMutationAdapter;
