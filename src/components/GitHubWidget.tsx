import { motion } from 'framer-motion';
import { Github, GitCommit, RefreshCw } from 'lucide-react';
import { useGitHubMetrics } from '@/hooks/useGitHubMetrics';
import AnimatedCounter from './AnimatedCounter';

export default function GitHubWidget() {
  const { data, loading, error } = useGitHubMetrics();

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-5 w-40 bg-surface-border rounded mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-surface-border rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card p-6 border-red-500/20">
        <p className="text-sm text-red-300">Unable to load GitHub metrics. {error}</p>
      </div>
    );
  }

  const maxPct = Math.max(...data.topLanguages.map((l) => l.percentage));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: 'transform, opacity' }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-accent-primary" />
          <h3 className="text-base font-semibold text-slate-100">GitHub Activity</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <RefreshCw className="w-3 h-3" />
          Synced {new Date(data.lastSyncedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg bg-surface-light p-4">
          <p className="text-xs text-muted mb-1">Total Repos</p>
          <p className="text-2xl font-bold text-slate-100">
            <AnimatedCounter value={data.totalRepos} />
          </p>
        </div>
        <div className="rounded-lg bg-surface-light p-4">
          <p className="text-xs text-muted mb-1">Commits (90d)</p>
          <p className="text-2xl font-bold text-accent-success-400">
            <AnimatedCounter value={data.totalCommitsLast90Days} />
          </p>
        </div>
        <div className="rounded-lg bg-surface-light p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted mb-1">Top Language</p>
          <p className="text-2xl font-bold text-slate-100">
            {data.topLanguages[0]?.language || (data.topLanguages[0] as { name?: string })?.name || '—'}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <GitCommit className="w-3.5 h-3.5 text-muted" />
          <p className="text-xs font-medium text-muted">Language Distribution</p>
        </div>
        <div className="space-y-2.5">
          {data.topLanguages.map((lang, idx) => {
            const langName = lang.language || (lang as { name?: string }).name || `Language ${idx + 1}`;
            return (
              <div key={langName || idx}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-mono text-slate-200">{langName}</span>
                  <span className="text-muted">{lang.percentage}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-border overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(lang.percentage / maxPct) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    style={{ willChange: 'width' }}
                    className="h-full rounded-full bg-gradient-to-r from-accent-primary-500 to-accent-primary-300"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
