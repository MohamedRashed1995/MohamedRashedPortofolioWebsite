import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  Bug,
  ShieldCheck,
  Wrench,
  ScanSearch,
  Code2,
} from 'lucide-react';
import { codeReviewSnippets, SEED_AI_CASES } from '@/data/seed';
import { useAiCases } from '@/hooks/useAiCases';
import PageHeader from '@/components/PageHeader';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/context/LanguageContext';
import type { CodeAnnotation } from '@/types';

const categoryIcons: Record<string, typeof Bug> = {
  Hallucination: Bug,
  Security: ShieldCheck,
  Correctness: AlertCircle,
  'Over-engineering': Wrench,
};

const severityConfig: Record<
  CodeAnnotation['severity'],
  { icon: typeof AlertTriangle; badgeClass: string; cardClass: string }
> = {
  critical: {
    icon: AlertTriangle,
    badgeClass: 'bg-red-500/10 text-red-500 border-red-500/30',
    cardClass: 'border-red-500/30 bg-red-500/5',
  },
  warning: {
    icon: AlertCircle,
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    cardClass: 'border-amber-500/30 bg-amber-500/5',
  },
  info: {
    icon: Info,
    badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    cardClass: 'border-blue-500/30 bg-blue-500/5',
  },
};

export default function AiLab() {
  const { data: aiEvaluationCases, loading, error } = useAiCases();
  const { t, isRTL } = useLanguage();
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(
    codeReviewSnippets[0]?.id || null
  );

  const safeCases =
    Array.isArray(aiEvaluationCases) && aiEvaluationCases.length > 0
      ? aiEvaluationCases
      : SEED_AI_CASES;

  const selectedSnippet =
    codeReviewSnippets.find((s) => s.id === selectedSnippetId) || codeReviewSnippets[0];

  return (
    <PageTransition title="AI Evaluation Lab — Mohamed Rashed Abdelazim">
      <PageHeader
        title={t('aiLab.title')}
        subtitle={t('aiLab.subtitle')}
      />

      {/* Case Studies Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="border-b border-theme-border pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-theme-text">
              {isRTL ? 'دراسات الحالة: قبل وبعد التدقيق' : 'Empirical Case Studies: Flawed vs. Corrected'}
            </h2>
            <p className="text-sm text-theme-muted mt-1">
              {t('aiLab.introDesc')}
            </p>
          </div>

          {loading && <div className="card p-8 animate-pulse h-40 bg-theme-card" />}
          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="grid lg:grid-cols-2 gap-6">
            {safeCases.map((caseItem, i) => {
              const Icon = categoryIcons[caseItem.category] ?? ScanSearch;
              return (
                <motion.article
                  key={caseItem.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="card p-6 bg-theme-card border border-theme-border hover:border-theme-accent/40 transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-theme-accent-light border border-theme-border flex items-center justify-center">
                        <Icon className="w-4 h-4 text-theme-accent" />
                      </div>
                      <span className="badge badge-accent">{caseItem.category}</span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-theme-text mb-4">
                    {caseItem.title}
                  </h3>

                  <div className="space-y-3.5 text-xs sm:text-sm">
                    <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-3.5">
                      <p className="text-xs font-bold text-red-500 mb-1 tracking-wider uppercase">
                        {isRTL ? 'إجابة الذكاء الاصطناعي المعيبة' : 'Flawed AI Model Output'}
                      </p>
                      <p className="text-theme-text-sec leading-relaxed font-mono text-xs">
                        {caseItem.flawedResponse}
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5">
                      <p className="text-xs font-bold text-amber-500 mb-1 tracking-wider uppercase">
                        {isRTL ? 'الخلل المرصود والتحليل' : 'Identified Architectural Flaw'}
                      </p>
                      <p className="text-theme-text-sec leading-relaxed">
                        {caseItem.identifiedFlaw}
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3.5">
                      <p className="text-xs font-bold text-emerald-500 mb-1 flex items-center gap-1 tracking-wider uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'التقييم المصحح والهندسة الصحيحة' : 'Corrected Engineering Evaluation'}</span>
                      </p>
                      <p className="text-theme-text-sec leading-relaxed">
                        {caseItem.correctedEvaluation}
                      </p>
                    </div>

                    <div className="flex items-start gap-2 pt-1 border-t border-theme-border">
                      <Info className="w-4 h-4 text-theme-accent shrink-0 mt-0.5" />
                      <p className="text-xs text-theme-muted italic">{caseItem.takeaway}</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Code Review Micro-tool */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 border-t border-theme-border pt-12 bg-theme-bg-sec/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-theme-text">
              {isRTL ? 'محاكي تدقيق الأكواد بالذكاء الاصطناعي' : 'Interactive AI Code Auditor Simulation'}
            </h2>
            <p className="text-sm text-theme-muted mt-1 max-w-2xl">
              {isRTL
                ? 'اختر مقطعاً برمجياً بـ #C للاطلاع على الملاحظات والتدقيق الأمني والمعماري المفصل.'
                : 'Select an enterprise C# code snippet below to inspect categorized annotations, security warnings, and performance flags.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Snippet selector */}
            <div className="lg:col-span-1 space-y-2.5">
              {codeReviewSnippets.map((snippet) => {
                const isSelected = selectedSnippet?.id === snippet.id;
                return (
                  <button
                    key={snippet.id}
                    type="button"
                    onClick={() => setSelectedSnippetId(snippet.id)}
                    className={`w-full text-start p-4 rounded-xl border transition-all duration-200 shadow-sm ${
                      isSelected
                        ? 'border-theme-accent bg-theme-accent-light text-theme-text font-medium'
                        : 'border-theme-border bg-theme-card text-theme-text-sec hover:border-theme-accent/40'
                    }`}
                  >
                    <p className="text-sm font-bold text-theme-text">{snippet.label}</p>
                    <p className="text-xs text-theme-muted mt-1 font-mono">
                      {snippet.annotations.length} {isRTL ? 'ملاحظات تدقيق' : 'annotations'}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Review panel */}
            <div className="lg:col-span-2">
              {selectedSnippet && (
                <motion.div
                  key={selectedSnippet.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="card overflow-hidden bg-theme-card border border-theme-border shadow-md"
                >
                  <div className="px-4 py-2.5 border-b border-theme-border bg-theme-bg-sec flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-theme-accent" />
                      <span className="text-xs font-mono text-theme-text font-semibold">
                        {selectedSnippet.label}.cs
                      </span>
                    </div>
                    <span className="text-[10px] text-theme-muted font-mono uppercase bg-theme-bg px-2 py-0.5 rounded border border-theme-border">
                      C# 12 / .NET 8
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed bg-theme-bg/60 text-theme-text border-b border-theme-border">
                      <code>{selectedSnippet.code}</code>
                    </pre>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3 bg-theme-card">
                    <p className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                      {isRTL ? 'الملاحظات والتشخيص الأمني' : 'Diagnostic Annotations & Code Fixes'}
                    </p>
                    {selectedSnippet.annotations.map((ann, idx) => {
                      const config = severityConfig[ann.severity] || severityConfig.info;
                      const Icon = config.icon;
                      return (
                        <div
                          key={idx}
                          className={`rounded-xl border p-3.5 transition-all ${config.cardClass}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase">{ann.severity}</span>
                            </div>
                            <span className="text-xs font-mono opacity-70">
                              {isRTL ? `السطر ${ann.line}` : `Line ${ann.line}`}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-theme-text leading-relaxed">
                            {ann.comment}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
