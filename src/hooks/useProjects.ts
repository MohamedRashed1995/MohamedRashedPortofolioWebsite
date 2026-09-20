import { useCallback, useEffect, useState } from 'react';
import type { Project } from '@/types';
import { fetchProjects, fetchProjectBySlug } from '@/services/api';
import { SEED_PROJECTS } from '@/data/seed';

export function useProjects() {
  const [data, setData] = useState<Project[]>(SEED_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const projects = await fetchProjects();
      setData(projects && projects.length > 0 ? projects : SEED_PROJECTS);
    } catch (err) {
      setData(SEED_PROJECTS);
      setError(err instanceof Error ? err.message : 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

export function useProjectBySlug(slug?: string) {
  const [project, setProject] = useState<Project | null>(() => {
    if (!slug) return null;
    return SEED_PROJECTS.find((p) => p.slug === slug || p.id === slug) || null;
  });
  const [loading, setLoading] = useState<boolean>(!!slug);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);

    fetchProjectBySlug(slug)
      .then((item) => {
        if (!active) return;
        setProject(item || null);
      })
      .catch((err) => {
        if (!active) return;
        const fallback = SEED_PROJECTS.find((p) => p.slug === slug || p.id === slug) || null;
        setProject(fallback);
        setError(err instanceof Error ? err.message : 'Failed to load project.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return { project, loading, error };
}