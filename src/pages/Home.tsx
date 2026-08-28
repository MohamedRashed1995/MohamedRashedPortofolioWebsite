import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Terminal, Layers, CheckCircle2, Eye, Download } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useSiteContent } from '@/hooks/useSiteContent';
import ProjectCard from '@/components/ProjectCard';
import GitHubWidget from '@/components/GitHubWidget';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/context/LanguageContext';
import { HeroAvatar } from '@/components/HeroAvatar';
import { CvPreviewModal } from '@/components/CvPreviewModal';
import { downloadCvPdf } from '@/utils/downloadCv';
import { SEED_PROJECTS } from '@/data/seed';

const snappyEase = [0.16, 1, 0.3, 1] as const;

export default function Home() {
  const { data: projects, loading } = useProjects();
  const { content: siteContent } = useSiteContent();
  const { t, isRTL } = useLanguage();
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const safeProjects = Array.isArray(projects) && projects.length > 0 ? projects : SEED_PROJECTS;
  const featured = safeProjects.filter((p) => p.featured).length > 0
    ? safeProjects.filter((p) => p.featured).slice(0, 3)
    : safeProjects.slice(0, 3);

  const heroBadge = isRTL && siteContent.heroBadgeAr ? siteContent.heroBadgeAr : siteContent.heroBadge || t('hero.badge');
  const heroRole = isRTL && siteContent.titleRoleAr ? siteContent.titleRoleAr : siteContent.titleRole || t('hero.titleRole');
  const heroSubtitle = isRTL && siteContent.heroSubtitleAr ? siteContent.heroSubtitleAr : siteContent.heroSubtitle || t('hero.subtitle');

  const handleDownloadCv = async () => {
    setDownloading(true);
    await downloadCvPdf(siteContent.cvFileName || 'Mohamed_Rashed_CV.pdf');
    setDownloading(false);
  };

  return (
    <PageTransition title="Mohamed Rashed Abdelazim — Full-Stack .NET Engineer">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-14 overflow-hidden">
        {/* Subtle hardware-accelerated background glow */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-theme-accent/5 via-transparent to-transparent pointer-events-none"
          style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-theme-accent/10 rounded-full blur-3xl pointer-events-none"
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Intro & Headline */}
            <div className="lg:col-span-7 space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: snappyEase }}
                style={{ willChange: 'transform, opacity' }}
              >
                <span className="badge badge-accent mb-2 inline-flex items-center gap-1.5 shadow-xs transition-transform duration-150 hover:scale-105">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{heroBadge}</span>
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.04, ease: snappyEase }}
                style={{ willChange: 'transform, opacity' }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-theme-text tracking-tight leading-[1.12]"
              >
                {heroRole.includes('&') ? (
                  <>
                    {heroRole.split('&')[0]} <br />
                    <span className="text-gradient">& {heroRole.split('&')[1]}</span>
                  </>
                ) : (
                  <span className="text-gradient">{heroRole}</span>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08, ease: snappyEase }}
                style={{ willChange: 'transform, opacity' }}
                className="text-base sm:text-lg text-theme-text-sec max-w-2xl leading-relaxed"
              >
                {heroSubtitle}
              </motion.p>

              {/* Action CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.12, ease: snappyEase }}
                style={{ willChange: 'transform, opacity' }}
                className="pt-2 flex flex-wrap items-center gap-3"
              >
                <Link to="/projects" className="btn-primary shadow-lg hover:shadow-theme-accent/25 active:scale-95 transition-all duration-150">
                  <span>{t('hero.viewProjects')}</span>
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Link>
                <Link to="/contact" className="btn-ghost active:scale-95 transition-all duration-150">
                  {t('hero.contactMe')}
                </Link>

                {/* Direct Safe Download & Preview Modal button */}
                <div className="inline-flex rounded-lg border border-theme-border p-0.5 bg-theme-bg-sec/50 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={handleDownloadCv}
                    disabled={downloading}
                    className="btn-ghost border-0 text-xs px-3 py-2 flex items-center gap-1.5 hover:text-theme-accent active:scale-95 transition-all duration-150"
                    title={isRTL ? 'تحميل السيرة الذاتية' : 'Download CV'}
                  >
                    <Download className="w-4 h-4 text-theme-accent" />
                    <span>{t('hero.downloadCv')}</span>
                  </button>
                  <span className="w-[1px] bg-theme-border my-1.5" />
                  <button
                    type="button"
                    onClick={() => setCvModalOpen(true)}
                    className="btn-ghost border-0 text-xs px-2.5 py-2 flex items-center gap-1 text-theme-muted hover:text-theme-text active:scale-95 transition-all duration-150"
                    title={isRTL ? 'معاينة سريعة للـ CV' : 'Preview CV'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">{isRTL ? 'معاينة' : 'Preview'}</span>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Dynamic Morphing Blob Avatar */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <HeroAvatar />
            </div>

          </div>

          {/* Key Metrics / Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.16, ease: snappyEase }}
            style={{ willChange: 'transform, opacity' }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-4xl"
          >
            {[
              {
                icon: Layers,
                label: (isRTL && siteContent.statsExperienceLabelAr) || siteContent.statsExperienceLabel || t('hero.stats.experienceLabel'),
                value: siteContent.statsExperience || t('hero.stats.experience'),
              },
              {
                icon: Terminal,
                label: (isRTL && siteContent.statsProjectsLabelAr) || siteContent.statsProjectsLabel || t('hero.stats.projectsLabel'),
                value: siteContent.statsProjects || t('hero.stats.projectsCount'),
              },
              {
                icon: CheckCircle2,
                label: (isRTL && siteContent.statsArchitectureLabelAr) || siteContent.statsArchitectureLabel || t('hero.stats.architectureLabel'),
                value: siteContent.statsArchitecture || t('hero.stats.architecture'),
              },
              {
                icon: Sparkles,
                label: (isRTL && siteContent.statsAiEvaluationsLabelAr) || siteContent.statsAiEvaluationsLabel || t('hero.stats.aiEvaluationsLabel'),
                value: siteContent.statsAiEvaluations || t('hero.stats.aiEvaluations'),
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.18 + i * 0.03, ease: snappyEase }}
                style={{ willChange: 'transform, opacity' }}
                className="card p-3.5 sm:p-4 rounded-xl border border-theme-border bg-theme-card/90 shadow-sm hover:border-theme-accent/60 hover:-translate-y-0.5 transition-all duration-150 group"
              >
                <stat.icon className="w-5 h-5 text-theme-accent mb-1.5 transition-transform duration-150 group-hover:scale-110" />
                <p className="text-xl sm:text-2xl font-extrabold text-theme-text font-mono">{stat.value}</p>
                <p className="text-xs text-theme-muted mt-0.5 leading-snug">{stat.label}</p>
              </motion.div>
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

