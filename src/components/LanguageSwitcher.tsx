import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-theme-border bg-theme-bg-sec/80 hover:border-theme-accent text-theme-text text-xs font-semibold transition-all duration-200"
      title={t('language.selectLanguage')}
      aria-label={t('language.selectLanguage')}
    >
      <Globe className="w-3.5 h-3.5 text-theme-accent" />
      <span className="font-mono uppercase tracking-wider">
        {language === 'en' ? 'AR' : 'EN'}
      </span>
      <span className="text-[10px] text-theme-muted hidden sm:inline">
        ({language === 'en' ? 'العربية' : 'English'})
      </span>
    </button>
  );
}
