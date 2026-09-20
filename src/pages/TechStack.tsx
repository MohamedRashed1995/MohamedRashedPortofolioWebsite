import { motion } from 'framer-motion';
import { useTechStack } from '@/hooks/useTechStack';
import PageHeader from '@/components/PageHeader';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/context/LanguageContext';

export default function TechStack() {
  const { data: techStack, loading, error } = useTechStack();
  const { t } = useLanguage();

  return (
    <PageTransition title="Tech Stack — Mohamed Rashed Abdelazim">
      <PageHeader
        title={t('techStack.title')}
        subtitle={t('techStack.subtitle')}
      />

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {loading && <div className="card p-8 animate-pulse h-40 bg-theme-card" />}
            {error && <p className="text-sm text-red-400">{error}</p>}
            {!loading && !error && techStack.length === 0 && (
              <p className="text-sm text-theme-muted">No technologies published yet.</p>
            )}
            {techStack.map((category, catIdx) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: catIdx * 0.06 }}
                className="card p-6 bg-theme-card border border-theme-border shadow-sm hover:border-theme-accent/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-5 border-b border-theme-border pb-3">
                  <h3 className="text-base sm:text-lg font-bold text-theme-text">
                    {category.category}
                  </h3>
                  <span className="text-xs text-theme-muted font-mono">
                    {category.items.length} technologies
                  </span>
                </div>

                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                        <span className="font-semibold text-theme-text">{item.name}</span>
                        <span className="text-theme-muted font-mono">{item.proficiency}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-theme-bg-sec border border-theme-border overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.proficiency}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-theme-accent to-theme-accent-hover"
                          style={{
                            backgroundColor: 'var(--color-accent-primary)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
