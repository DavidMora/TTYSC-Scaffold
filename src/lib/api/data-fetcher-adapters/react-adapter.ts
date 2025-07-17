import { useState, useEffect, useCallback } from "react";
import { HttpClientResponse } from "@/lib/types/api/http-client";
import {
  DataFetcherAdapter,
  DataFetcherOptions,
  DataFetcherResponse,
} from "@/lib/types/api/data-fetcher";

export class ReactAdapter implements DataFetcherAdapter {
  fetchData<T = unknown>(
    key: string,
    fetcher: () => Promise<HttpClientResponse<T>>,
    options: DataFetcherOptions = {}
  ): DataFetcherResponse<T> {
    // This is a hook-like implementation that should be used inside React components
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [data, setData] = useState<T | undefined>(undefined);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [error, setError] = useState<Error | undefined>(undefined);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const mutate = useCallback(
      (newData?: T) => {
        if (newData !== undefined) {
          setData(newData);
        } else {
          // Refetch data
          setIsLoading(true);
          fetcher()
            .then((response) => {
              setData(response.data);
              setError(undefined);
            })
            .catch((err) => {
              setError(err instanceof Error ? err : new Error("Unknown error"));
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      },
      [fetcher]
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (options.enabled === false) {
        setIsLoading(false);
        return;
      }

      let isCancelled = false;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          setError(undefined);

          const response = await fetcher();

          if (!isCancelled) {
            setData(response.data);
          }
        } catch (err) {
          if (!isCancelled) {
            setError(err instanceof Error ? err : new Error("Unknown error"));
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      };

      fetchData();

      // Set up refresh interval if specified
      let intervalId: NodeJS.Timeout | undefined;
      if (options.refreshInterval && options.refreshInterval > 0) {
        intervalId = setInterval(fetchData, options.refreshInterval);
      }

      return () => {
        isCancelled = true;
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [key, fetcher, options.enabled, options.refreshInterval]);

    return {
      data,
      error,
      isLoading,
      mutate,
    };
  }
}

export default ReactAdapter;
