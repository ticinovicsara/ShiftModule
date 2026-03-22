import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseMutationResult<TArgs extends unknown[], TResult> {
  execute: (...args: TArgs) => Promise<TResult>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useMutation<TArgs extends unknown[], TResult>(
  mutator: (...args: TArgs) => Promise<TResult>,
): UseMutationResult<TArgs, TResult> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);

      try {
        const result = await mutator(...args);
        return result;
      } catch (unknownError) {
        const message =
          unknownError instanceof Error
            ? unknownError.message
            : "Unexpected mutation error";
        if (mountedRef.current) {
          setError(message);
        }
        throw unknownError;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [mutator],
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(
    () => ({ execute, loading, error, reset }),
    [error, execute, loading, reset],
  );
}
