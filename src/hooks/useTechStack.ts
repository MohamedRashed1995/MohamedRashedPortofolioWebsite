import { useEffect, useState } from 'react';
import { SEED_TECH_STACK } from '@/data/seed';
import { fetchTechStack } from '@/services/api';
import type { TechStackCategory } from '@/types';

export function useTechStack() {
  const [data, setData] = useState<TechStackCategory[]>(SEED_TECH_STACK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchTechStack();
        if (isMounted) {
          setData(Array.isArray(result) && result.length > 0 ? result : SEED_TECH_STACK);
        }
      } catch (err) {
        if (isMounted) {
          setData(SEED_TECH_STACK);
          setError(err instanceof Error ? err.message : 'Failed to load tech stack');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}
