import { useEffect, useState } from 'react';
import { fetchInquiries } from '@/services/api';
import type { Inquiry } from '@/types';

export function useInquiries(enabled = true) {
  const [data, setData] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const inquiries = await fetchInquiries();
      setData(inquiries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    load();
  }, [enabled]);

  return { data, loading, error, reload: load };
}
