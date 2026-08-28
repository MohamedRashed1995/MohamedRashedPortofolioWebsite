import { useEffect, useState } from 'react';
import { SEED_TECH_STACK } from '@/data/seed';
import type { TechStackCategory } from '@/types';

export function useTechStack() {
  const [data, setData] = useState<TechStackCategory[]>(SEED_TECH_STACK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/v1/tech-stack');
        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
          const result = await response.json();
          if (Array.isArray(result) && result.length > 0) {
            setData(result);
          }
        }
      } catch {
        setData(SEED_TECH_STACK);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { data, loading, error };
}
