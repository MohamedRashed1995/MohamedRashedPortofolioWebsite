import { useState, useEffect } from 'react';
import type { Project } from '@/types';
import { SEED_PROJECTS } from '@/data/seed';
import { fetchProjects, fetchProjectBySlug } from '@/services/api';

export function useProjects() {
  const [data, setData] = useState<Project[]>(SEED_PROJECTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const projects = await fetchProjects();
        if (isMounted) {
          setData(projects && projects.length > 0 ? projects : SEED_PROJECTS);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setData(SEED_PROJECTS);
          setError(err instanceof Error ? err.message : 'Failed to load projects');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}

export function useProjectBySlug(slug?: string) {
  const [project, setProject] = useState<Project | null>(() => {
    if (!slug) return null;
    return SEED_PROJECTS.find((p) => p.slug === slug || p.id === slug) || null;
  });
  const [loading, setLoading] = useState<boolean>(Boolean(slug));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setProject(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const item = await fetchProjectBySlug(slug!);
        if (isMounted) {
          if (item) {
            setProject(item);
            setError(null);
          } else {
            setProject(null);
            setError('Project not found');
          }
        }
      } catch (err) {
        if (isMounted) {
          const found = SEED_PROJECTS.find((p) => p.slug === slug || p.id === slug);
          if (found) {
            setProject(found);
            setError(null);
          } else {
            setError(err instanceof Error ? err.message : 'Failed to load project details');
            setProject(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { project, data: project, loading, error };
}
