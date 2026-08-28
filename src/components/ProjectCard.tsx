import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Github,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import type { Project } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import ProjectImage from '@/components/ProjectImage';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const { t, isRTL } = useLanguage();

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: 'transform, opacity' }}
      className="card group flex flex-col overflow-hidden bg-theme-card border border-theme-border hover:border-theme-accent hover:-translate-y-1 transition-all duration-200 shadow-md hover:shadow-xl rounded-xl"
    >
      {/* 1. Project Visual Header (with ProjectImage resilient fallback) */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-theme-bg-sec border-b border-theme-border">
        <Link
          to={`/projects/${project.slug}`}
          className="block w-full h-full relative overflow-hidden group/img"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ProjectImage
            src={project.image}
            alt={project.title}
            title={project.title}
            titleAr={project.titleAr}
            slug={project.slug}
            tags={project.tags}
            className="w-full h-full"
            imgClassName="transition-transform duration-300 ease-out group-hover:scale-105"
            aspectRatio="auto"
          />

          {/* Dynamic Theme Gradient Overlay & Lighting Blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-10 transition-opacity duration-200 pointer-events-none" />

          {/* Soft Ambient Corner Glow Vignette */}
          <div className="absolute inset-0 bg-gradient-to-tr from-theme-accent/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>

        {/* Floating Top-Right Featured / Category Badge */}
        {project.featured && (
          <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} z-20 pointer-events-none`}>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-theme-card/90 backdrop-blur-md border border-theme-accent/40 text-theme-accent shadow-lg flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-theme-accent" />
              <span>{isRTL ? 'مشروع مميز' : 'Featured'}</span>
            </span>
          </div>
        )}
      </div>

      {/* 2. Project Card Content Body */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link to={`/projects/${project.slug}`}>
            <h3 className="text-lg font-bold text-theme-text group-hover:text-theme-accent transition-colors duration-150">
              {isRTL && project.titleAr ? project.titleAr : project.title}
            </h3>
          </Link>
          <span className="text-xs text-theme-muted font-mono whitespace-nowrap bg-theme-bg-sec px-2 py-0.5 rounded border border-theme-border">
            {project.period}
          </span>
        </div>

        <p className="text-sm text-theme-text-sec leading-relaxed mb-4 flex-1 line-clamp-3">
          {isRTL && project.shortDescriptionAr ? project.shortDescriptionAr : project.shortDescription}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="badge badge-accent text-xs transition-transform duration-150 hover:scale-105">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-theme-border mt-auto">
          <Link
            to={`/projects/${project.slug}`}
            className="btn-primary text-xs flex-1 text-center py-2 active:scale-95 transition-all duration-150"
          >
            <span>{t('projects.viewDetails')}</span>
            {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-xs px-2.5 py-2 active:scale-95 transition-all duration-150"
              aria-label={`${project.title} repository`}
              title={t('projects.viewCode')}
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-xs px-2.5 py-2 active:scale-95 transition-all duration-150"
              aria-label={`${project.title} live demo`}
              title={t('projects.liveDemo')}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
