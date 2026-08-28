import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Github,
  ExternalLink,
  Code2,
  Layers,
  Sparkles,
  Database,
  Radio,
} from 'lucide-react';
import type { Project } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const { t, isRTL } = useLanguage();
  const [imageError, setImageError] = useState(false);

  // Helper for generating dynamic code snippet fallback based on project identity
  const getFallbackSnippet = (slug: string) => {
    switch (slug) {
      case 'adros-core':
        return {
          lang: 'C# / .NET 8',
          icon: Layers,
          snippet: 'public class Course : AggregateRoot<Guid> {\n  public void Enroll(StudentId id) => ...\n}',
          tag: 'Clean Architecture',
        };
      case 'helpdesk-systems':
        return {
          lang: 'SignalR Hub',
          icon: Radio,
          snippet: '[Authorize]\napp.MapHub<TicketHub>("/hubs/tickets");\nawait Clients.Group("Agents").SendAsync(...);',
          tag: 'Real-Time SLA',
        };
      case 'dentzone-portal':
        return {
          lang: 'ASP.NET Core Web API',
          icon: Database,
          snippet: '[HttpPost("orders/b2b")]\n[Authorize(Roles = "Dentist,ClinicAdmin")]\npublic async Task<ActionResult<OrderDto>> CreateOrderAsync(...) {\n  return await _mediator.Send(command);\n}',
          tag: 'B2B E-Commerce & Inventory',
        };
      case 'portfolio-website':
        return {
          lang: 'React 18 + Vite',
          icon: Sparkles,
          snippet: 'export function App() {\n  return <ThemeProvider><RouterProvider /></ThemeProvider>;\n}',
          tag: 'Portfolio & Sandbox',
        };
      default:
        return {
          lang: 'ASP.NET Core',
          icon: Code2,
          snippet: 'builder.Services.AddCleanArchitecture();\napp.MapControllers();',
          tag: 'Full-Stack .NET',
        };
    }
  };

  const fallbackData = getFallbackSnippet(project.slug);
  const FallbackIcon = fallbackData.icon;

  const hasValidImage = Boolean(project.image && !imageError);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="card group flex flex-col overflow-hidden bg-theme-card border border-theme-border hover:border-theme-accent transition-all duration-300 shadow-md hover:shadow-xl rounded-xl"
    >
      {/* 1. Project Visual Header (Image or Modern Tech Gradient Fallback) */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 border-b border-theme-border">
        {hasValidImage ? (
          <Link
            to={`/projects/${project.slug}`}
            className="block w-full h-full relative overflow-hidden group/img"
            tabIndex={-1}
            aria-hidden="true"
          >
            {/* Image with smooth scale on card hover */}
            <img
              src={project.image}
              alt={project.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />

            {/* Gradient Overlay & Lighting Blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 opacity-70 group-hover:opacity-40 transition-opacity duration-300" />

            {/* Soft Ambient Corner Vignette */}
            <div className="absolute inset-0 bg-gradient-to-tr from-theme-accent/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </Link>
        ) : (
          /* High-Tech Gradient Background with Live Code Terminal Preview */
          <Link
            to={`/projects/${project.slug}`}
            className={`w-full h-full relative flex flex-col justify-between p-4 bg-gradient-to-br ${project.thumbnailColor || 'from-slate-900 to-cyan-950'} select-none overflow-hidden`}
            tabIndex={-1}
            aria-hidden="true"
          >
            {/* Subtle Grid Lines */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />

            {/* Glowing Tech Watermark */}
            <FallbackIcon className="absolute -bottom-4 -right-4 w-28 h-28 text-white/5 pointer-events-none transform -rotate-12 group-hover:scale-110 group-hover:text-theme-accent/10 transition duration-500" />

            {/* Top Fallback Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-theme-accent font-semibold">
                <FallbackIcon className="w-3 h-3 text-theme-accent" />
                <span>{fallbackData.lang}</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500/80" />
                <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            {/* Center Code Block */}
            <div className="relative z-10 my-auto px-2">
              <pre className="font-mono text-[11px] leading-relaxed text-slate-300/90 font-medium whitespace-pre-wrap line-clamp-3">
                <code>{fallbackData.snippet}</code>
              </pre>
            </div>

            {/* Bottom Status Marker */}
            <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/10 pt-2">
              <span className="flex items-center gap-1 text-theme-accent">
                <Sparkles className="w-3 h-3" />
                <span>{fallbackData.tag}</span>
              </span>
              <span className="text-slate-500">.NET 8 Ecosystem</span>
            </div>
          </Link>
        )}

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
            <h3 className="text-lg font-bold text-theme-text group-hover:text-theme-accent transition-colors">
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
            <span key={tag} className="badge badge-accent text-xs">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-theme-border mt-auto">
          <Link
            to={`/projects/${project.slug}`}
            className="btn-primary text-xs flex-1 text-center py-2"
          >
            <span>{t('projects.viewDetails')}</span>
            {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-xs px-2.5 py-2"
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
              className="btn-ghost text-xs px-2.5 py-2"
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
