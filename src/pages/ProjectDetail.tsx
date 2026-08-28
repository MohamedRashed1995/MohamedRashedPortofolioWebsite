import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Database,
  Terminal,
  AlertCircle,
  Calendar,
  UserCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useProjectBySlug } from '@/hooks/useProjects';
import ApiPlayground from '@/components/ApiPlayground';
import SchemaViewer from '@/components/SchemaViewer';
import PageTransition from '@/components/PageTransition';
import ProjectImage from '@/components/ProjectImage';
import { useLanguage } from '@/context/LanguageContext';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { project, loading, error } = useProjectBySlug(slug);
  const { t, isRTL } = useLanguage();

  if (loading) {
    return (
      <div className="pt-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="card p-8 animate-pulse h-96 bg-theme-card" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <PageTransition title="Project Not Found">
        <div className="pt-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center card p-10 bg-theme-card border border-theme-border">
            <AlertCircle className="w-12 h-12 text-theme-muted mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-theme-text mb-2">{t('projects.notFound')}</h1>
            <p className="text-theme-muted mb-6">{error ?? t('projects.notFound')}</p>
            <Link to="/projects" className="btn-primary">
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t('projects.backToProjects')}</span>
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const projectTitle = isRTL && project.titleAr ? project.titleAr : project.title;
  const projectDesc =
    isRTL && project.longDescriptionAr
      ? project.longDescriptionAr
      : isRTL && project.shortDescriptionAr
      ? project.shortDescriptionAr
      : project.longDescription || project.shortDescription;

  const schemaTables = project.schemaTables || project.databaseSchema || [];

  return (
    <PageTransition title={`${projectTitle} — Mohamed Rashed Abdelazim`}>
      {/* Header */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-theme-muted hover:text-theme-accent transition-colors mb-6 font-medium"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t('projects.backToProjects')}</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span key={tag} className="badge badge-accent">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-theme-text tracking-tight">
              {projectTitle}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-theme-text-sec max-w-3xl leading-relaxed">
              {projectDesc}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-theme-muted border-t border-theme-border pt-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-theme-accent" />
                <span>
                  <strong className="text-theme-text">{isRTL ? 'الدور الوظيفي:' : 'Role:'}</strong>{' '}
                  {isRTL && project.roleAr ? project.roleAr : project.role}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-theme-accent" />
                <span>
                  <strong className="text-theme-text">{isRTL ? 'الفترة الزمنية:' : 'Period:'}</strong>{' '}
                  {project.period}
                </span>
              </div>
            </div>

            {/* Project Preview Image Banner / Resilient Fallback */}
            <div className="mt-8 rounded-2xl overflow-hidden border border-theme-border/80 shadow-2xl bg-theme-bg-sec">
              <ProjectImage
                src={project.image}
                alt={project.title}
                title={project.title}
                titleAr={project.titleAr}
                slug={project.slug}
                tags={project.tags}
                className="w-full max-h-[460px]"
                imgClassName="w-full max-h-[460px] object-cover object-top"
                aspectRatio="wide"
                showSnippetPreview={true}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section if present */}
      {project.keyFeatures && project.keyFeatures.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-10 border-t border-theme-border bg-theme-bg-sec/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-theme-accent" />
              <h2 className="text-xl sm:text-2xl font-bold text-theme-text">
                {t('projects.keyFeatures')}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {project.keyFeatures.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="rounded-xl border border-theme-border bg-theme-card p-5 shadow-sm hover:border-theme-accent transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-theme-accent">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <h3 className="font-bold text-sm text-theme-text">
                        {isRTL && feat.titleAr ? feat.titleAr : feat.title}
                      </h3>
                    </div>
                    <p className="text-xs text-theme-text-sec leading-relaxed">
                      {isRTL && feat.descriptionAr ? feat.descriptionAr : feat.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Architecture Layers */}
      {project.layers && project.layers.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-10 border-t border-theme-border bg-theme-bg-sec/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-theme-accent" />
              <h2 className="text-xl sm:text-2xl font-bold text-theme-text">
                {t('projects.architectureOverview')}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {project.layers.map((layer, i) => {
                const layerTitle = isRTL && layer.nameAr ? layer.nameAr : layer.name;
                const layerDesc = isRTL && layer.descriptionAr ? layer.descriptionAr : layer.description;
                const layerResp = isRTL && layer.responsibilitiesAr ? layer.responsibilitiesAr : layer.responsibilities;

                return (
                  <motion.div
                    key={layer.name}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="rounded-xl border border-theme-border bg-theme-card p-5 shadow-sm hover:border-theme-accent/50 transition-colors"
                  >
                    <h3 className="font-mono text-sm font-bold text-theme-accent mb-1.5">
                      {layerTitle}
                    </h3>
                    <p className="text-xs text-theme-muted mb-3 leading-relaxed">
                      {layerDesc}
                    </p>
                    <ul className="space-y-1.5 border-t border-theme-border pt-2.5">
                      {layerResp.map((r) => (
                        <li
                          key={r}
                          className="text-xs text-theme-text-sec flex items-start gap-1.5 leading-tight"
                        >
                          <span className="text-theme-accent font-bold mt-0.5">›</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* API Playground */}
      {project.apiEndpoints && project.apiEndpoints.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-10 border-t border-theme-border">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-5 h-5 text-theme-accent" />
              <h2 className="text-xl sm:text-2xl font-bold text-theme-text">
                {t('projects.interactivePlayground')}
              </h2>
            </div>
            <p className="text-sm text-theme-muted mb-6 max-w-2xl">
              {t('playground.subtitle')}
            </p>
            <ApiPlayground endpoints={project.apiEndpoints} projectSlug={project.slug} />
          </div>
        </section>
      )}

      {/* Schema Viewer */}
      {schemaTables.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-10 pb-20 border-t border-theme-border bg-theme-bg-sec/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-theme-accent" />
              <h2 className="text-xl sm:text-2xl font-bold text-theme-text">
                {t('projects.databaseSchema')}
              </h2>
            </div>
            <p className="text-sm text-theme-muted mb-6 max-w-2xl">
              {isRTL
                ? 'مخطط العلاقات التفاعلي (ER Diagram) ومستكشف جداول قاعدة البيانات والحقول والعلاقات.'
                : 'Interactive ER diagram & schema explorer for entities and relational mappings.'}
            </p>
            <SchemaViewer tables={schemaTables} />
          </div>
        </section>
      )}
    </PageTransition>
  );
}
