import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchInquiries, ApiError } from '@/services/api';
import type { Inquiry } from '@/types';

export function useInquiries(enabled = true, onUnauthorized?: () => void) {
  const [data, setData] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a stable ref for onUnauthorized to prevent callback identity changes
  // from triggering effect re-runs
  const onUnauthorizedRef = useRef(onUnauthorized);
  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

  // Track if a request is actively in-flight to prevent duplicate concurrent requests
  const inFlightRef = useRef(false);

  // Track whether an automatic load has already executed for the current enabled lifecycle
  const hasLoadedRef = useRef(false);

  // Core fetch execution with hard concurrency guard
  const executeFetch = useCallback(async () => {
    // Prevent duplicate concurrent requests
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const inquiries = await fetchInquiries();
      setData(inquiries);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setData([]);
        setError('Unauthorized session. Please log in again.');
        // Notify parent once; do not retry
        onUnauthorizedRef.current?.();
      } else {
        const message = err instanceof Error ? err.message : 'Failed to load inquiries';
        setError(message);
      }
      // Never perform automatic retry on any error (401, 403, 404, 429, 500, 502, 503, 504, etc.)
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  // Track enabled transitions
  useEffect(() => {
    if (!enabled) {
      // Reset the one-shot flag when disabled so that a future re-enable
      // (e.g. re-login) can perform exactly one fetch
      hasLoadedRef.current = false;
      setLoading(false);
      return;
    }

    // Hard guarantee: automatic loading happens at most ONCE for each enabled lifecycle
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      executeFetch();
    }
  }, [enabled, executeFetch]);

  // Manual reload for explicit user action (e.g. clicking the Refresh button)
  const reload = useCallback(async () => {
    await executeFetch();
  }, [executeFetch]);

  return { data, loading, error, reload };
}

