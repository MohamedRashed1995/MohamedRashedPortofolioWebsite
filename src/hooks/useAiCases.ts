import { useEffect, useState } from 'react';
import { SEED_AI_CASES } from '@/data/seed';
import type { AiEvaluationCase } from '@/types';

export function useAiCases() {
  const [data, setData] = useState<AiEvaluationCase[]>(SEED_AI_CASES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/v1/ai-cases');
        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
          const result = await response.json();
          if (Array.isArray(result) && result.length > 0) {
            setData(result);
          }
        }
      } catch {
        setData(SEED_AI_CASES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { data, loading, error };
}
