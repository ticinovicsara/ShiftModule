import { useCallback, useEffect, useMemo, useState } from "react";

interface UseFetchOptions {
  immediate?: boolean;
}

export interface UseFetchResult<TData> {
  data: TData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFetch<TData>(
  fetcher: () => Promise<TData>,
  options: UseFetchOptions = { immediate: true },
): UseFetchResult<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(Boolean(options.immediate));
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetcher();
      setData(response);
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Unexpected fetch error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (!options.immediate) {
      return;
    }

    void run();
  }, [options.immediate, run]);

  return useMemo(
    () => ({ data, loading, error, refetch: run }),
    [data, error, loading, run],
  );
}
