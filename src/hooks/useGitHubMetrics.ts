import { useEffect, useState } from 'react';
import { fetchGithubMetrics } from '@/services/api';
import type { GitHubMetrics } from '@/types';

const FALLBACK_GITHUB_METRICS: GitHubMetrics = {
  totalRepos: 12,
  totalStars: 5,
  totalCommits: 450,
  contributionsThisYear: 320,
  topLanguages: [
    { name: 'C#', percentage: 55 },
    { name: 'TypeScript', percentage: 25 },
    { name: 'JavaScript', percentage: 12 },
    { name: 'HTML/CSS', percentage: 8 },
  ],
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
