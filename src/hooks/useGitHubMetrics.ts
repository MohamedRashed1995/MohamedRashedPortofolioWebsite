import { useEffect, useState } from 'react';
import { fetchGithubMetrics, normalizeGithubMetrics } from '@/services/api';
import type { GitHubMetrics } from '@/types';
import { githubMetrics as SEED_GITHUB_METRICS } from '@/data/seed';

export function useGitHubMetrics() {
  const [data, setData] = useState<GitHubMetrics>(() => normalizeGithubMetrics(SEED_GITHUB_METRICS));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchGithubMetrics()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setData(normalizeGithubMetrics(SEED_GITHUB_METRICS));
          setError(err instanceof Error ? err.message : null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}
