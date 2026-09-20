import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Check,
  Sparkles,
  Moon,
  Sun,
  RefreshCw,
  Pipette,
  Sliders,
  Wand2,
} from 'lucide-react';
import { useTheme, ThemeStyle } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ThemeSwitcher() {
  const {
    theme,
    setTheme,
    themes,
    isDark,
    isCustomTheme,
    setCustomThemeColor,
    toggleCustomMode,
    toggleDarkLight,
    activeAccentHex,
    accentPresets,
    resetToPreset,
  } = useTheme();

  const { t, isRTL, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(activeAccentHex);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Sync internal hex text input with active accent
  useEffect(() => {
    setHexInput(activeAccentHex);
  }, [activeAccentHex]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      setCustomThemeColor(val.startsWith('#') ? val : `#${val}`);
    }
  };

  const handleNativeColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    setCustomThemeColor(val);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* 1. Trigger Button in Navbar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-theme-border bg-theme-bg-sec/90 hover:border-theme-accent text-theme-text text-xs font-medium transition-all duration-200 shadow-sm group"
        title={language === 'ar' ? 'مولد الثيمات ومحدد الألوان' : 'Dynamic Theme Generator & Palette'}
        aria-label={language === 'ar' ? 'مولد الثيمات ومحدد الألوان' : 'Dynamic Theme Generator & Palette'}
      >
        <Palette className="w-4 h-4 text-theme-accent group-hover:rotate-12 transition-transform duration-300" />
        
        {/* Dynamic Color dot with pulsing glow */}
        <span className="relative flex h-3 w-3 items-center justify-center">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ backgroundColor: activeAccentHex }}
          />
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5 border border-black/20 shadow-sm"
            style={{ backgroundColor: activeAccentHex }}
          />
        </span>

        <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider text-theme-muted group-hover:text-theme-text transition-colors">
          {isCustomTheme ? (language === 'ar' ? 'مولد مخصص' : 'Dynamic') : (
            theme === 'style-1' ? 'Neon' :
            theme === 'style-2' ? 'Light' :
            theme === 'style-3' ? 'Slate' : 'Sunset'
          )}
        </span>
      </button>

      {/* 2. Enhanced Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`absolute ${
              isRTL ? 'left-0' : 'right-0'
            } mt-2 w-84 sm:w-90 p-4 rounded-2xl bg-theme-card/95 backdrop-blur-xl border border-theme-border shadow-2xl z-50`}
          >
            {/* Header: Title & Quick Dark/Light Switch */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-theme-border">
              <div className="flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-theme-accent" />
                <span className="text-xs font-bold text-theme-text">
                  {language === 'ar' ? 'مولد الثيمات الذكي' : 'Dynamic Theme Generator'}
                </span>
              </div>

              {/* Mode Toggle Button */}
              <button
                type="button"
                onClick={toggleDarkLight}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-theme-bg-sec hover:bg-theme-accent-light hover:text-theme-accent border border-theme-border transition-all duration-200"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'ar' ? 'فاتح' : 'Light'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-theme-accent" />
                    <span>{language === 'ar' ? 'داكن' : 'Dark'}</span>
                  </>
                )}
              </button>
            </div>

            {/* SECTION 1: Interactive Dynamic Color Picker (HEX & Pipette) */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-theme-accent" />
                  <span>{language === 'ar' ? 'توليد ثيم بلون حر (Color Picker)' : 'Custom Dynamic Theme'}</span>
                </span>

                {isCustomTheme && (
                  <button
                    type="button"
                    onClick={() => resetToPreset('style-1')}
                    className="text-[10px] text-theme-accent hover:underline flex items-center gap-1"
                    title={language === 'ar' ? 'استعادة الثيم الافتراضي' : 'Reset to Default Preset'}
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>{language === 'ar' ? 'استعادة الثيمات' : 'Reset Preset'}</span>
                  </button>
                )}
              </div>

              {/* Live Color Input & Swatch Bar */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-theme-bg-sec/90 border border-theme-border">
                {/* Native HTML5 Color Picker Trigger */}
                <div className="relative flex-shrink-0">
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={activeAccentHex}
                    onChange={handleNativeColorPick}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    aria-label="Pick custom theme color"
                  />
                  <div
                    className="w-8 h-8 rounded-lg border-2 border-white/20 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: activeAccentHex }}
                  >
                    <Pipette className="w-3.5 h-3.5 text-white drop-shadow" />
                  </div>
                </div>

                {/* Hex Text Input Field */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={hexInput}
                    onChange={handleHexInputChange}
                    placeholder="#06b6d4"
                    maxLength={7}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-theme-card border border-theme-border focus:border-theme-accent focus:outline-none text-theme-text uppercase font-semibold"
                  />
                </div>

                {/* Quick Interactive Color Pipette Button */}
                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-theme-accent-light text-theme-accent hover:bg-theme-accent hover:text-white text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[10px] font-mono">{language === 'ar' ? 'توليد' : 'Generate'}</span>
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-theme-muted leading-tight">
                {language === 'ar'
                  ? '✨ يتم توليد درجات الخلفيات، والأسطح، والإطارات، والتوهجات فوراً من هذا اللون.'
                  : '✨ Full surfaces, background tones, borders, and glows are calculated dynamically.'}
              </p>
            </div>

            {/* SECTION 2: Curated Designer Palette Grid */}
            <div className="mb-4">
              <div className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider mb-2">
                {language === 'ar' ? 'لوحة الألوان الجاهزة (Extended Palette)' : 'Extended Theme Palette'}
              </div>

              <div className="grid grid-cols-6 gap-1.5 p-1.5 rounded-xl bg-theme-bg-sec/70 border border-theme-border">
                {accentPresets.map((preset) => {
                  const isSelected = isCustomTheme && activeAccentHex.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setCustomThemeColor(preset.hex)}
                      className={`relative group flex flex-col items-center justify-center p-1 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-theme-card border-2 border-theme-accent shadow-md scale-105'
                          : 'hover:bg-theme-card/70'
                      }`}
                      title={language === 'ar' ? `${preset.nameAr} (${preset.hex})` : `${preset.nameEn} (${preset.hex})`}
                      aria-label={preset.nameEn}
                    >
                      <span
                        className="w-6 h-6 rounded-full shadow-sm flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: preset.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: Original Presets List (Fallback & Standard Styles) */}
            <div>
              <div className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider mb-2">
                {language === 'ar' ? 'الثيمات الأساسية الأصلية (Original Presets)' : 'Original Presets'}
              </div>

              <div className="space-y-1">
                {themes.map((item) => {
                  const isActive = !isCustomTheme && theme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        toggleCustomMode(false);
                        setTheme(item.id as ThemeStyle);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-start text-xs transition-all ${
                        isActive
                          ? 'bg-theme-accent-light text-theme-accent font-semibold border border-theme-accent/40'
                          : 'text-theme-text hover:bg-theme-bg-sec border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border shadow-sm"
                          style={{
                            backgroundColor: item.bgPreview,
                            borderColor: item.borderPreview,
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: item.accentColor,
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-theme-text">{t(item.nameKey)}</div>
                          <div className="text-[10px] text-theme-muted line-clamp-1">
                            {t(item.descKey)}
                          </div>
                        </div>
                      </div>

                      {isActive && <Check className="w-3.5 h-3.5 text-theme-accent flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
