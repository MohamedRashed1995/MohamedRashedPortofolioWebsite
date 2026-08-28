import { useEffect, useState } from 'react';
import { getStoredTechStack } from '@/services/dataStorage';
import type { TechStackCategory } from '@/types';

export function useTechStack() {
  const [data, setData] = useState<TechStackCategory[]>(() => getStoredTechStack());
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<TechStackCategory[]>;
      if (customEvent.detail) {
        setData(customEvent.detail);
      } else {
        setData(getStoredTechStack());
      }
    };

    window.addEventListener('portfolio:skills-updated', handleUpdate);
    return () => {
      window.removeEventListener('portfolio:skills-updated', handleUpdate);
    };
  }, []);

  return { data, loading, error };
}
