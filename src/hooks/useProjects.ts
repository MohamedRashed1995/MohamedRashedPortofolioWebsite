import { useState, useEffect } from 'react';
import type { Project } from '@/types';
import { getStoredProjects } from '@/services/dataStorage';

export function useProjects() {
  const [data, setData] = useState<Project[]>(() => getStoredProjects());
  const [loading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);


  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Project[]>;
      if (customEvent.detail) {
        setData(customEvent.detail);
      } else {
        setData(getStoredProjects());
      }
    };

    window.addEventListener('portfolio:projects-updated', handleUpdate);
    return () => {
      window.removeEventListener('portfolio:projects-updated', handleUpdate);
    };
  }, []);

  return { data, loading, error };
}

export function useProjectBySlug(slug?: string) {
  const [project, setProject] = useState<Project | null>(() => {
    if (!slug) return null;
    const all = getStoredProjects();
    return all.find((p) => p.slug === slug || p.id === slug) || null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setProject(null);
      setLoading(false);
      return;
    }

    const findProject = () => {
      const all = getStoredProjects();
      const found = all.find((p) => p.slug === slug || p.id === slug);
      if (found) {
        setProject(found);
        setError(null);
      } else {
        setError('Project not found');
        setProject(null);
      }
    };

    findProject();

    const handleUpdate = () => {
      findProject();
    };

    window.addEventListener('portfolio:projects-updated', handleUpdate);
    return () => {
      window.removeEventListener('portfolio:projects-updated', handleUpdate);
    };
  }, [slug]);

  return { project, data: project, loading, error };
}
