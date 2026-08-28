import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { en } from '@/locales/en';
import { ar } from '@/locales/ar';
import type { TranslationKey } from '@/types/translations';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, unknown>> = {
  en: en as unknown as Record<string, unknown>,
  ar: ar as unknown as Record<string, unknown>,
};

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

const LANGUAGE_STORAGE_KEY = 'app_language_preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (stored === 'en' || stored === 'ar') {
        return stored;
      }
      const browserLang = navigator.language.slice(0, 2);
      return browserLang === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      document.documentElement.lang = language;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      
      if (isRTL) {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
    } catch {
      // Ignore localStorage write failures
    }
  }, [language, isRTL]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = useMemo(() => {
    return (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = translations[language];
      let value = getNestedValue(dict, key);

      // Fallback to English dictionary if key is missing
      if (value === undefined && language !== 'en') {
        value = getNestedValue(translations.en, key);
      }

      if (value === undefined) {
        return key;
      }

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = (value as string).replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
        });
      }

      return value;
    };
  }, [language]);

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isRTL,
    }),
    [language, isRTL, t]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
