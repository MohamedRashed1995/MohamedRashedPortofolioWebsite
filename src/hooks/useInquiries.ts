import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchInquiries, ApiError } from '@/services/api';
import type { Inquiry } from '@/types';

export function useInquiries(enabled = true, onUnauthorized?: () => void) {
  const [data, setData] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUnauthorizedRef = useRef(onUnauthorized);
  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const inquiries = await fetchInquiries();
      setData(inquiries);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setData([]);
        setError('Unauthorized session. Please log in again.');
        onUnauthorizedRef.current?.();
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load inquiries');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    load();
  }, [enabled, load]);

  return { data, loading, error, reload: load };
}
