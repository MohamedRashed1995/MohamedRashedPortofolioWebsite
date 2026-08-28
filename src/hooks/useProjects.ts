import { useState, useEffect } from 'react';
import type { Project } from '@/types';
import { SEED_PROJECTS } from '@/data/seed';

export function useProjects() {
  const [data, setData] = useState<Project[]>(SEED_PROJECTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/projects');

        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType || !contentType.includes('application/json')) {
          throw new Error('API unavailable, switching to local fallback');
        }

        const result = await response.json();
        const projectsList = Array.isArray(result) ? result : result?.projects || [];
        if (projectsList.length > 0) {
          setData(projectsList);
        } else {
          setData(SEED_PROJECTS);
        }
        setError(null);
      } catch {
        // Fallback to local seed projects
        setData(SEED_PROJECTS);
        setError(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return { data, loading, error };
}

export function useProjectBySlug(slug?: string) {
  const [project, setProject] = useState<Project | null>(() => {
    if (!slug) return null;
    return SEED_PROJECTS.find((p) => p.slug === slug || p.id === slug) || null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setProject(null);
      setLoading(false);
      return;
    }

    async function fetchProject() {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/projects/${slug}`);
        const contentType = response.headers.get('content-type');

        if (response.ok && contentType && contentType.includes('application/json')) {
          const result = await response.json();
          setProject(result);
          setError(null);
          return;
        }

        // Fallback to local seed
        const found = SEED_PROJECTS.find((p) => p.slug === slug || p.id === slug);
        if (found) {
          setProject(found);
          setError(null);
        } else {
          setError('Project not found');
          setProject(null);
        }
      } catch {
        const found = SEED_PROJECTS.find((p) => p.slug === slug || p.id === slug);
        if (found) {
          setProject(found);
          setError(null);
        } else {
          setError('Project not found');
          setProject(null);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [slug]);

  return { project, data: project, loading, error };
}
