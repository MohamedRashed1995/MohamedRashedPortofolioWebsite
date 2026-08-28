import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { BrandLogo } from '@/components/BrandLogo';

export default function Navbar() {
  const location = useLocation();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.projects'), path: '/projects' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.techStack'), path: '/tech-stack' },
    { label: t('nav.aiLab'), path: '/ai-lab' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 glass border-b border-theme-border backdrop-blur-xl bg-theme-bg/85">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex-shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active =
              location.pathname === link.path ||
              (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? 'text-theme-accent font-semibold'
                    : 'text-theme-text-sec hover:text-theme-text hover:bg-theme-hover'
                }`}
              >
                {link.label}
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-theme-accent-light border border-theme-accent/25"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Controls: Theme & Language Switchers + Mobile Menu Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeSwitcher />
          <LanguageSwitcher />

          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-theme-text hover:text-theme-accent hover:bg-theme-hover border border-theme-border transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-theme-card border-t border-theme-border shadow-xl"
          >
            <div className="px-5 py-4 flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const active =
                  location.pathname === link.path ||
                  (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'text-theme-accent bg-theme-accent-light border border-theme-accent/30 font-semibold'
                        : 'text-theme-text-sec hover:text-theme-text hover:bg-theme-hover'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
