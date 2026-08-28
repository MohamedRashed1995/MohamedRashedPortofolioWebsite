import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Terminal, Layers, CheckCircle2, Eye, Download } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/ProjectCard';
import GitHubWidget from '@/components/GitHubWidget';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/context/LanguageContext';
import { HeroAvatar } from '@/components/HeroAvatar';
import { CvPreviewModal } from '@/components/CvPreviewModal';
import { downloadCvPdf } from '@/utils/downloadCv';
import { SEED_PROJECTS } from '@/data/seed';

export default function Home() {
  const { data: projects, loading } = useProjects();
  const { t, isRTL } = useLanguage();
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const safeProjects = Array.isArray(projects) && projects.length > 0 ? projects : SEED_PROJECTS;
  const featured = safeProjects.slice(0, 3);

  const handleDownloadCv = async () => {
    setDownloading(true);
    await downloadCvPdf('Mohamed_Rashed_CV.pdf');
    setDownloading(false);
  };

  return (
    <PageTransition title="Mohamed Rashed Abdelazim — Full-Stack .NET Engineer">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-4 sm:px-6 lg:px-8 pt-12 pb-16 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-theme-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-theme-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* Left Column: Intro & Headline */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="badge badge-accent mb-2 inline-flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('hero.badge')}</span>
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-theme-text tracking-tight leading-[1.15]"
              >
                {t('hero.titleRole').split('&')[0]} <br />
                <span className="text-gradient">
                  {t('hero.titleRole').includes('&') ? `& ${t('hero.titleRole').split('&')[1]}` : ''}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="text-base sm:text-lg text-theme-text-sec max-w-2xl leading-relaxed"
              >
                {t('hero.subtitle')}
              </motion.p>

              {/* Action CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.22 }}
                className="pt-2 flex flex-wrap items-center gap-3"
              >
                <Link to="/projects" className="btn-primary shadow-lg">
                  <span>{t('hero.viewProjects')}</span>
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Link>
                <Link to="/contact" className="btn-ghost">
                  {t('hero.contactMe')}
                </Link>

                {/* Direct Safe Download & Preview Modal button */}
                <div className="inline-flex rounded-lg border border-theme-border p-0.5 bg-theme-bg-sec/50">
                  <button
                    type="button"
                    onClick={handleDownloadCv}
                    disabled={downloading}
                    className="btn-ghost border-0 text-xs px-3 py-2 flex items-center gap-1.5 hover:text-theme-accent"
                    title={isRTL ? 'تحميل السيرة الذاتية' : 'Download CV'}
                  >
                    <Download className="w-4 h-4 text-theme-accent" />
                    <span>{t('hero.downloadCv')}</span>
                  </button>
                  <span className="w-[1px] bg-theme-border my-1.5" />
                  <button
                    type="button"
                    onClick={() => setCvModalOpen(true)}
                    className="btn-ghost border-0 text-xs px-2.5 py-2 flex items-center gap-1 text-theme-muted hover:text-theme-text"
                    title={isRTL ? 'معاينة سريعة للـ CV' : 'Preview CV'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">{isRTL ? 'معاينة' : 'Preview'}</span>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Dynamic Morphing Blob Avatar with Rotating Gradient Aura & 3D Floating */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <HeroAvatar />
            </div>

          </div>

          {/* Key Metrics / Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl"
          >
            {[
              {
                icon: Layers,
                label: t('hero.stats.experienceLabel'),
                value: t('hero.stats.experience'),
              },
              {
                icon: Terminal,
                label: t('hero.stats.projectsLabel'),
                value: t('hero.stats.projectsCount'),
              },
              {
                icon: CheckCircle2,
                label: t('hero.stats.architectureLabel'),
                value: t('hero.stats.architecture'),
              },
              {
                icon: Sparkles,
                label: t('hero.stats.aiEvaluationsLabel'),
                value: t('hero.stats.aiEvaluations'),
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="card p-4 rounded-xl border border-theme-border bg-theme-card/90 shadow-sm hover:border-theme-accent/50 transition-all duration-200"
              >
                <stat.icon className="w-5 h-5 text-theme-accent mb-2" />
                <p className="text-2xl font-extrabold text-theme-text font-mono">{stat.value}</p>
                <p className="text-xs text-theme-muted mt-0.5 leading-snug">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section-padding border-t border-theme-border bg-theme-bg-sec/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-theme-text">
                {t('projects.title')}
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-theme-muted max-w-xl">
                {t('projects.subtitle')}
              </p>
            </div>
            <Link to="/projects" className="btn-ghost text-xs self-start sm:self-auto">
              <span>{t('projects.filterAll')}</span>
              {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse h-72 bg-theme-card" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((project, i) => (
                <ProjectCard key={project.id || i} project={project} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GitHub Activity Widget */}
      <section className="section-padding border-t border-theme-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-theme-text">
              {isRTL ? 'نشاط البرمجة على GitHub' : 'GitHub Engineering Activity'}
            </h2>
            <p className="text-theme-muted mt-1 text-sm sm:text-base">
              {isRTL
                ? 'مقاييس مباشرة لمستودعات الأكواد ومعدل الالتزام (Commit History)'
                : 'Real-time repository statistics and continuous integration commits'}
            </p>
          </div>
          <GitHubWidget />
        </div>
      </section>

      {/* CV Preview & Download Modal */}
      <CvPreviewModal isOpen={cvModalOpen} onClose={() => setCvModalOpen(false)} />
    </PageTransition>
  );
}
