import { useEffect, useState } from 'react';
import { getStoredSiteContent } from '@/services/dataStorage';
import type { SiteContent } from '@/types';

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(() => getStoredSiteContent());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteContent>;
      if (customEvent.detail) {
        setContent(customEvent.detail);
      } else {
        setContent(getStoredSiteContent());
      }
    };

    window.addEventListener('portfolio:content-updated', handleUpdate);
    return () => {
      window.removeEventListener('portfolio:content-updated', handleUpdate);
    };
  }, []);

  return { content, data: content };
}
