import { useEffect, useState, useCallback } from 'react';
import { fetchInquiries, ApiError } from '@/services/api';
import type { Inquiry } from '@/types';

export function useInquiries(enabled = true, onUnauthorized?: () => void) {
  const [data, setData] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        onUnauthorized?.();
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load inquiries');
      }
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    load();
  }, [enabled, load]);

  return { data, loading, error, reload: load };
}
