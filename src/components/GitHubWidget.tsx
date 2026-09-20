import { motion } from 'framer-motion';
import { Github, GitCommit, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useGitHubMetrics } from '@/hooks/useGitHubMetrics';
import AnimatedCounter from './AnimatedCounter';

export default function GitHubWidget() {
  const { data, loading, error } = useGitHubMetrics();
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // Check if element is already within viewport on mount
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsInView(true);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  if (loading && !data) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-5 w-40 bg-surface-border rounded mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-surface-border rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="card p-6 border-red-500/20">
        <p className="text-sm text-red-300">Unable to load GitHub metrics. {error}</p>
      </div>
    );
  }

  const topLanguages = Array.isArray(data?.topLanguages) ? data.topLanguages : [];
  const topLanguageName = topLanguages.length > 0 ? topLanguages[0].language : '—';
  const syncedDate = data?.lastSyncedAt && !isNaN(new Date(data.lastSyncedAt).getTime())
    ? new Date(data.lastSyncedAt).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-accent-primary" />
          <h3 className="text-base font-semibold text-slate-100">GitHub Activity</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <RefreshCw className="w-3 h-3" />
          Synced {syncedDate}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg bg-surface-light p-4">
          <p className="text-xs text-muted mb-1">Total Repos</p>
          <p className="text-2xl font-bold text-slate-100">
            <AnimatedCounter value={data?.totalRepos ?? 0} />
          </p>
        </div>
        <div className="rounded-lg bg-surface-light p-4">
          <p className="text-xs text-muted mb-1">Commits (90d)</p>
          <p className="text-2xl font-bold text-accent-success-400">
            <AnimatedCounter value={data?.totalCommitsLast90Days ?? 0} />
          </p>
        </div>
        <div className="rounded-lg bg-surface-light p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted mb-1">Top Language</p>
          <p className="text-2xl font-bold text-slate-100">
            {topLanguageName}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <GitCommit className="w-3.5 h-3.5 text-muted" />
          <p className="text-xs font-medium text-muted">Language Distribution</p>
        </div>
        <div className="space-y-2.5">
          {topLanguages.map((lang, idx) => {
            const rawPct = typeof lang.percentage === 'number' && !isNaN(lang.percentage) ? lang.percentage : 0;
            const clampedPct = Math.max(0, Math.min(100, Math.round(rawPct * 10) / 10));

            return (
              <div key={lang.language}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-mono text-slate-200">{lang.language}</span>
                  <span className="text-muted tabular-nums">
                    {isInView ? (
                      <AnimatedCounter value={clampedPct} suffix="%" duration={0.8} />
                    ) : (
                      `${clampedPct}%`
                    )}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-border overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: isInView ? `${clampedPct}%` : '0%' }}
                    transition={{ duration: 0.8, delay: 0.1 + idx * 0.1, ease: 'easeOut' }}
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
