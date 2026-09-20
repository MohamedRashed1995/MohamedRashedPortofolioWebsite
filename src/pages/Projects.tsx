import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/ProjectCard';
import PageHeader from '@/components/PageHeader';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/context/LanguageContext';
import { SEED_PROJECTS } from '@/data/seed';

export default function Projects() {
  const { data: projects, loading } = useProjects();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const safeProjects = Array.isArray(projects) && projects.length > 0 ? projects : SEED_PROJECTS;

  const categories = [
    { id: 'all', label: t('projects.filterAll') },
    { id: 'dotnet', label: t('projects.filterDotNet') },
    { id: 'ai', label: t('projects.filterAi') },
    { id: 'cloud', label: t('projects.filterCloud') },
  ];

  const filteredProjects = useMemo(() => {
    return safeProjects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.titleAr && project.titleAr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        project.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.shortDescriptionAr && project.shortDescriptionAr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeCategory === 'all') return true;
      if (activeCategory === 'dotnet') {
        return (
          project.tags.some((t) => t.toLowerCase().includes('net') || t.toLowerCase().includes('c#') || t.toLowerCase().includes('architecture')) ||
          project.title.toLowerCase().includes('net')
        );
      }
      if (activeCategory === 'ai') {
        return (
          project.tags.some((t) => t.toLowerCase().includes('ai') || t.toLowerCase().includes('llm') || t.toLowerCase().includes('eval') || t.toLowerCase().includes('bench')) ||
          project.title.toLowerCase().includes('ai')
        );
      }
      if (activeCategory === 'cloud') {
        return (
          project.tags.some((t) => t.toLowerCase().includes('cloud') || t.toLowerCase().includes('docker') || t.toLowerCase().includes('azure') || t.toLowerCase().includes('web') || t.toLowerCase().includes('full-stack'))
        );
      }
      return true;
    });
  }, [safeProjects, searchTerm, activeCategory]);

  return (
    <PageTransition title="Projects — Mohamed Rashed Abdelazim">
      <PageHeader
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
      />

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-theme-card border border-theme-border shadow-sm">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-theme-muted absolute top-1/2 -translate-y-1/2 start-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('projects.searchPlaceholder')}
                className="input-field ps-10 text-xs sm:text-sm py-2"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <span className="text-xs font-semibold text-theme-muted flex items-center gap-1 me-1">
                <Filter className="w-3.5 h-3.5" />
              </span>
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-theme-accent text-white shadow-sm font-semibold'
                        : 'bg-theme-bg-sec text-theme-text-sec hover:text-theme-text hover:bg-theme-hover border border-theme-border'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Cards Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse h-72 bg-theme-card" />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, i) => (
                <ProjectCard key={project.id || i} project={project} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 card p-8 border border-theme-border bg-theme-card">
              <p className="text-theme-muted text-base">{t('projects.noProjectsFound')}</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                }}
                className="mt-4 btn-ghost text-xs"
              >
                {t('projects.filterAll')}
              </button>
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
