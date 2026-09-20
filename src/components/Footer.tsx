import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { BrandLogo } from '@/components/BrandLogo';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-theme-border bg-theme-bg mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Bio */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/">
              <BrandLogo size="md" />
            </Link>
            <p className="text-sm text-theme-muted leading-relaxed max-w-md">
              {t('footer.roleDesc')}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              {t('footer.navigate')}
            </span>
            <div className="flex flex-col space-y-2 text-sm">
              <Link to="/" className="text-theme-text-sec hover:text-theme-accent transition-colors">
                {t('nav.home')}
              </Link>
              <Link to="/projects" className="text-theme-text-sec hover:text-theme-accent transition-colors">
                {t('nav.projects')}
              </Link>
              <Link to="/about" className="text-theme-text-sec hover:text-theme-accent transition-colors">
                {t('nav.about')}
              </Link>
              <Link to="/tech-stack" className="text-theme-text-sec hover:text-theme-accent transition-colors">
                {t('nav.techStack')}
              </Link>
              <Link to="/ai-lab" className="text-theme-text-sec hover:text-theme-accent transition-colors">
                {t('nav.aiLab')}
              </Link>
              <Link to="/contact" className="text-theme-text-sec hover:text-theme-accent transition-colors">
                {t('nav.contact')}
              </Link>
            </div>
          </div>

          {/* Col 3: Connect Links */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              {t('footer.connect')}
            </span>
            <div className="flex items-center gap-2.5">
              <a
                href="https://github.com/MohamedRashed1995"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg border border-theme-border bg-theme-bg-sec flex items-center justify-center text-theme-text-sec hover:text-theme-accent hover:border-theme-accent transition-all duration-200"
                aria-label="GitHub profile"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/mohamedrashed"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg border border-theme-border bg-theme-bg-sec flex items-center justify-center text-theme-text-sec hover:text-theme-accent hover:border-theme-accent transition-all duration-200"
                aria-label="LinkedIn profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <Link
                to="/contact"
                className="w-10 h-10 rounded-lg border border-theme-border bg-theme-bg-sec flex items-center justify-center text-theme-text-sec hover:text-theme-accent hover:border-theme-accent transition-all duration-200"
                aria-label="Contact Email"
              >
                <Mail className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-xs text-theme-muted pt-2 font-mono">
              mrashed19951995@gmail.com
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-theme-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-theme-muted">
          <p>© {new Date().getFullYear()} Mohamed Rashed Abdelazim. {t('footer.rights')}</p>
          <div className="flex items-center gap-1.5">
            <span>{t('footer.techDetails')}</span>
            <Heart className="w-3 h-3 text-red-500 fill-current inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
