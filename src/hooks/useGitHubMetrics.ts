import { useEffect, useState } from 'react';
import { fetchGithubMetrics } from '@/services/api';
import type { GitHubMetrics } from '@/types';

const FALLBACK_GITHUB_METRICS: GitHubMetrics = {
  totalRepos: 18,
  topLanguages: [
    { language: 'C#', percentage: 65 },
    { language: 'TypeScript', percentage: 20 },
    { language: 'SQL', percentage: 10 },
    { language: 'Docker / YAML', percentage: 5 },
  ],
  totalCommitsLast90Days: 142,
  lastSyncedAt: new Date().toISOString(),
};

export function useGitHubMetrics() {
  const [data, setData] = useState<GitHubMetrics | null>(FALLBACK_GITHUB_METRICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGithubMetrics()
      .then((res) => {
        if (res && typeof res === 'object') {
          setData(res as GitHubMetrics);
        }
        setError(null);
      })
      .catch(() => {
        setData(FALLBACK_GITHUB_METRICS);
        setError(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
