import { useEffect, useState } from 'react';
import { SEED_AI_CASES } from '@/data/seed';
import { fetchAiCases } from '@/services/api';
import type { AiEvaluationCase } from '@/types';

export function useAiCases() {
  const [data, setData] = useState<AiEvaluationCase[]>(SEED_AI_CASES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchAiCases();
        if (isMounted) {
          setData(Array.isArray(result) && result.length > 0 ? result : SEED_AI_CASES);
        }
      } catch (err) {
        if (isMounted) {
          setData(SEED_AI_CASES);
          setError(err instanceof Error ? err.message : 'Failed to load AI cases');
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
