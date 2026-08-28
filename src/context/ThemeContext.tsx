import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type ThemeStyle = 'style-1' | 'style-2' | 'style-3' | 'style-4' | 'custom';

export interface ThemeOption {
  id: ThemeStyle;
  nameKey: string;
  descKey: string;
  accentColor: string;
  bgPreview: string;
  borderPreview: string;
  isDark: boolean;
}

export interface AccentColorPreset {
  id: string;
  nameEn: string;
  nameAr: string;
  hex: string;
}

export const ACCENT_PRESETS: AccentColorPreset[] = [
  { id: 'cyan', nameEn: 'Cyber Cyan', nameAr: 'سايان نيون', hex: '#06b6d4' },
  { id: 'emerald', nameEn: 'Neon Emerald', nameAr: 'زمردي نيون', hex: '#10b981' },
  { id: 'violet', nameEn: 'Electric Violet', nameAr: 'بنفسجي كهربائي', hex: '#8b5cf6' },
  { id: 'blue', nameEn: 'Royal Blue', nameAr: 'أزرق ملكي', hex: '#3b82f6' },
  { id: 'amber', nameEn: 'Sunset Amber', nameAr: 'عنبري دافئ', hex: '#f59e0b' },
  { id: 'rose', nameEn: 'Cyber Rose / Pink', nameAr: 'وردي سيبراني', hex: '#f43f5e' },
  { id: 'crimson', nameEn: 'Crimson Red', nameAr: 'أحمر قرمزي', hex: '#ef4444' },
  { id: 'orange', nameEn: 'Bright Orange', nameAr: 'برتقالي ناري', hex: '#f97316' },
  { id: 'teal', nameEn: 'Mint Teal', nameAr: 'تيل مائي', hex: '#14b8a6' },
  { id: 'lime', nameEn: 'Lime Neon', nameAr: 'ليموني نيون', hex: '#84cc16' },
  { id: 'indigo', nameEn: 'Indigo Glow', nameAr: 'نيلي متوهج', hex: '#6366f1' },
  { id: 'fuchsia', nameEn: 'Neon Fuchsia', nameAr: 'فوشيا مشع', hex: '#d946ef' },
];

export const PRESET_THEMES: ThemeOption[] = [
  {
    id: 'style-1',
    nameKey: 'theme.style1',
    descKey: 'theme.style1Desc',
    accentColor: '#22d3ee', // Neon Cyan
    bgPreview: '#070a13',
    borderPreview: '#22d3ee',
    isDark: true,
  },
  {
    id: 'style-2',
    nameKey: 'theme.style2',
    descKey: 'theme.style2Desc',
    accentColor: '#0284c7', // Minimal Sky Blue
    bgPreview: '#f8fafc',
    borderPreview: '#cbd5e1',
    isDark: false,
  },
  {
    id: 'style-3',
    nameKey: 'theme.style3',
    descKey: 'theme.style3Desc',
    accentColor: '#10b981', // Corporate Emerald Green & Slate
    bgPreview: '#090e1a',
    borderPreview: '#10b981',
    isDark: true,
  },
  {
    id: 'style-4',
    nameKey: 'theme.style4',
    descKey: 'theme.style4Desc',
    accentColor: '#f97316', // Warm Sunset Amber
    bgPreview: '#150f0c',
    borderPreview: '#fb923c',
    isDark: true,
  },
];

// Color utility helpers
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  return null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = 1 + percent / 100;
  return rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor);
}

export function computeSecondaryHue(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = rgb.r;
  const g = rgb.g;
  const b = rgb.b;
  // Blend to create complementary radiant secondary accent
  const newR = Math.round(b * 0.7 + r * 0.3);
  const newG = Math.round(r * 0.4 + g * 0.6);
  const newB = Math.round(g * 0.5 + b * 0.5);
  return rgbToHex(newR, newG, newB);
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/**
 * Dynamic Full-Theme Generator:
 * Takes any base accent hex and produces a harmonious full-surface palette
 * including background tones, card surfaces, borders, text, and glows.
 */
export function generateFullDynamicTheme(hexColor: string, isDark: boolean = true) {
  const rgb = hexToRgb(hexColor) || { r: 6, g: 182, b: 212 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hue = hsl.h;
  const sat = Math.min(hsl.s, 65); // Cap saturation for balanced dark surfaces

  if (isDark) {
    // Dynamic Dark Theme with subtle color tint matching the chosen accent hue
    const bgPrimary = hslToHex(hue, Math.round(sat * 0.35), 4);     // Deep tinted dark ~4% lightness
    const bgSecondary = hslToHex(hue, Math.round(sat * 0.38), 7);   // Layer 1 surface ~7%
    const bgCard = hslToHex(hue, Math.round(sat * 0.40), 10);       // Card surface ~10%
    const bgHover = hslToHex(hue, Math.round(sat * 0.45), 14);      // Hover surface ~14%
    const border = hslToHex(hue, Math.round(sat * 0.30), 18);       // Border ~18%
    const borderHover = hexColor;

    return {
      bgPrimary,
      bgSecondary,
      bgCard,
      bgHover,
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      accentPrimary: hexColor,
      accentPrimaryHover: adjustBrightness(hexColor, 20),
      accentPrimaryLight: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
      accentSecondary: computeSecondaryHue(hexColor),
      border,
      borderHover,
      cardShadow: `0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 15px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`,
      glow: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.30)`,
      isDark: true,
    };
  } else {
    // Dynamic Light Theme with clean airy tones
    const bgPrimary = hslToHex(hue, Math.round(sat * 0.20), 98);    // Crisp light background ~98%
    const bgSecondary = '#ffffff';
    const bgCard = '#ffffff';
    const bgHover = hslToHex(hue, Math.round(sat * 0.25), 95);      // Hover ~95%
    const border = hslToHex(hue, Math.round(sat * 0.25), 88);       // Border ~88%
    const borderHover = hexColor;

    return {
      bgPrimary,
      bgSecondary,
      bgCard,
      bgHover,
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      accentPrimary: hexColor,
      accentPrimaryHover: adjustBrightness(hexColor, -15),
      accentPrimaryLight: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
      accentSecondary: computeSecondaryHue(hexColor),
      border,
      borderHover,
      cardShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`,
      glow: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`,
      isDark: false,
    };
  }
}

interface ThemeContextType {
  theme: ThemeStyle;
  setTheme: (theme: ThemeStyle) => void;
  cycleTheme: () => void;
  themes: ThemeOption[];
  currentThemeOption: ThemeOption;
  isDark: boolean;
  
  // Custom Color & Theme Generator Engine
  customAccentHex: string;
  isCustomTheme: boolean;
  setCustomThemeColor: (hex: string) => void;
  toggleCustomMode: (enable: boolean) => void;
  toggleDarkLight: () => void;
  activeAccentHex: string;
  accentPresets: AccentColorPreset[];
  resetToPreset: (presetId?: ThemeStyle) => void;
}

const THEME_STORAGE_KEY = 'app-theme-style';
const CUSTOM_HEX_KEY = 'app-custom-theme-hex';
const IS_CUSTOM_KEY = 'app-is-custom-theme';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Preset selection
  const [theme, setThemeState] = useState<ThemeStyle>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'style-1' || saved === 'style-2' || saved === 'style-3' || saved === 'style-4') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'style-1';
  });

  // Custom Theme Active State
  const [isCustomTheme, setIsCustomThemeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(IS_CUSTOM_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Custom Accent Hex Value
  const [customAccentHex, setCustomAccentHexState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_HEX_KEY);
      if (saved && hexToRgb(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return '#06b6d4'; // Cyber cyan default
  });

  // Dark/Light State
  const [isDark, setIsDarkState] = useState<boolean>(() => {
    const preset = PRESET_THEMES.find((p) => p.id === theme);
    return preset ? preset.isDark : true;
  });

  // Select Preset Theme
  const setTheme = useCallback((newTheme: ThemeStyle) => {
    if (newTheme === 'custom') {
      setIsCustomThemeState(true);
      try {
        localStorage.setItem(IS_CUSTOM_KEY, 'true');
      } catch {
        // ignore
      }
      return;
    }

    setIsCustomThemeState(false);
    setThemeState(newTheme);
    const preset = PRESET_THEMES.find((p) => p.id === newTheme);
    if (preset) {
      setIsDarkState(preset.isDark);
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      localStorage.setItem(IS_CUSTOM_KEY, 'false');
    } catch {
      // ignore
    }
  }, []);

  // Update Dynamic Custom Theme Color
  const setCustomThemeColor = useCallback((hex: string) => {
    const clean = hex.startsWith('#') ? hex : `#${hex}`;
    if (hexToRgb(clean)) {
      setCustomAccentHexState(clean);
      setIsCustomThemeState(true);
      try {
        localStorage.setItem(CUSTOM_HEX_KEY, clean);
        localStorage.setItem(IS_CUSTOM_KEY, 'true');
      } catch {
        // ignore
      }
    }
  }, []);

  const toggleCustomMode = useCallback((enable: boolean) => {
    setIsCustomThemeState(enable);
    try {
      localStorage.setItem(IS_CUSTOM_KEY, enable ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, []);

  const toggleDarkLight = useCallback(() => {
    setIsDarkState((prev) => {
      const next = !prev;
      if (!isCustomTheme) {
        // If in preset mode, swap between default dark (style-1) and light (style-2)
        const nextPreset: ThemeStyle = next ? 'style-1' : 'style-2';
        setThemeState(nextPreset);
        try {
          localStorage.setItem(THEME_STORAGE_KEY, nextPreset);
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, [isCustomTheme]);

  const resetToPreset = useCallback((presetId: ThemeStyle = 'style-1') => {
    setIsCustomThemeState(false);
    setTheme(presetId);
  }, [setTheme]);

  const cycleTheme = useCallback(() => {
    const list: ThemeStyle[] = ['style-1', 'style-2', 'style-3', 'style-4'];
    const currentIndex = list.indexOf(theme);
    const nextTheme = list[(currentIndex + 1) % list.length];
    setTheme(nextTheme);
  }, [theme, setTheme]);

  // Current Active Theme metadata
  const currentPreset = PRESET_THEMES.find((t) => t.id === theme) || PRESET_THEMES[0];
  const activeAccentHex = isCustomTheme ? customAccentHex : currentPreset.accentColor;

  // Real-Time CSS Variables Mutation Engine
  useEffect(() => {
    const root = document.documentElement;

    if (isCustomTheme) {
      // DYNAMIC THEME ENGINE ACTIVE: Generate and inject full palette
      root.setAttribute('data-theme', 'custom');
      document.body.setAttribute('data-theme', 'custom');

      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }

      const generated = generateFullDynamicTheme(customAccentHex, isDark);

      // 1. Backgrounds & Surfaces
      root.style.setProperty('--color-bg-primary', generated.bgPrimary);
      root.style.setProperty('--color-bg-secondary', generated.bgSecondary);
      root.style.setProperty('--color-bg-card', generated.bgCard);
      root.style.setProperty('--color-bg-hover', generated.bgHover);

      // 2. Text & Typography
      root.style.setProperty('--color-text-primary', generated.textPrimary);
      root.style.setProperty('--color-text-secondary', generated.textSecondary);
      root.style.setProperty('--color-text-muted', generated.textMuted);

      // 3. Accents & Gradients
      root.style.setProperty('--color-accent-primary', generated.accentPrimary);
      root.style.setProperty('--color-accent-primary-hover', generated.accentPrimaryHover);
      root.style.setProperty('--color-accent-primary-light', generated.accentPrimaryLight);
      root.style.setProperty('--color-accent-secondary', generated.accentSecondary);

      // 4. Borders & Glows
      root.style.setProperty('--color-border', generated.border);
      root.style.setProperty('--color-border-hover', generated.borderHover);
      root.style.setProperty('--color-card-shadow', generated.cardShadow);
      root.style.setProperty('--color-glow', generated.glow);

      // 5. Tailwind / Synced Engine Aliases
      root.style.setProperty('--primary-color', generated.accentPrimary);
      root.style.setProperty('--glow-color', generated.glow);
      root.style.setProperty('--accent-500', generated.accentPrimary);
      root.style.setProperty('--accent-400', generated.accentPrimaryHover);
    } else {
      // PRESET THEMES ACTIVE: Clean up inline overrides so standard stylesheet applies with zero conflict
      root.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);

      if (currentPreset.isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }

      // Remove any inline custom overrides
      root.style.removeProperty('--color-bg-primary');
      root.style.removeProperty('--color-bg-secondary');
      root.style.removeProperty('--color-bg-card');
      root.style.removeProperty('--color-bg-hover');
      root.style.removeProperty('--color-text-primary');
      root.style.removeProperty('--color-text-secondary');
      root.style.removeProperty('--color-text-muted');
      root.style.removeProperty('--color-accent-primary');
      root.style.removeProperty('--color-accent-primary-hover');
      root.style.removeProperty('--color-accent-primary-light');
      root.style.removeProperty('--color-accent-secondary');
      root.style.removeProperty('--color-border');
      root.style.removeProperty('--color-border-hover');
      root.style.removeProperty('--color-card-shadow');
      root.style.removeProperty('--color-glow');
      root.style.removeProperty('--primary-color');
      root.style.removeProperty('--glow-color');
      root.style.removeProperty('--accent-500');
      root.style.removeProperty('--accent-400');
    }
  }, [isCustomTheme, theme, customAccentHex, isDark, currentPreset.isDark]);

  return (
    <ThemeContext.Provider
      value={{
        theme: isCustomTheme ? 'custom' : theme,
        setTheme,
        cycleTheme,
        themes: PRESET_THEMES,
        currentThemeOption: currentPreset,
        isDark,
        customAccentHex,
        isCustomTheme,
        setCustomThemeColor,
        toggleCustomMode,
        toggleDarkLight,
        activeAccentHex,
        accentPresets: ACCENT_PRESETS,
        resetToPreset,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
