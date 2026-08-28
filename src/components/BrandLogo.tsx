import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Dimension presets
  const emblemSize = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size];

  const titleSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  return (
    <div
      className={`flex items-center gap-3 select-none group cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Glassmorphic High-Tech Emblem with Soft Ambient Breathing Glow */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        {/* Soft Ambient Breathing Glow (Calm 3.5s pulse, subtle opacity, non-intrusive) */}
        <motion.div
          animate={{
            scale: isHovered ? [1, 1.15, 1.08] : [0.95, 1.08, 0.95],
            opacity: isHovered ? 0.5 : [0.18, 0.38, 0.18],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -inset-2 rounded-2xl bg-theme-accent blur-lg pointer-events-none transition-all duration-500"
        />

        {/* Delicate Secondary Ambient Ring */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.35 : [0.1, 0.22, 0.1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-theme-accent to-theme-accent-sec blur-sm pointer-events-none"
        />

        {/* Main Emblem Container: Refined Glassmorphic Card */}
        <motion.div
          animate={{ scale: isHovered ? 1.04 : 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={`${emblemSize} relative rounded-xl bg-theme-card/85 backdrop-blur-md border border-white/15 dark:border-white/10 shadow-sm flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-theme-accent/40`}
        >
          {/* Subtle Inner Glass Vignette / Depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/15 pointer-events-none" />

          {/* Quick Glass Shimmer Sweep on Hover */}
          <motion.div
            initial={{ x: '-150%', opacity: 0 }}
            animate={{
              x: isHovered ? '220%' : '-150%',
              opacity: isHovered ? [0, 0.8, 0] : 0,
            }}
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute inset-0 w-3/4 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 pointer-events-none"
          />

          {/* Logo Code Typography: <MR /> */}
          <div className="relative z-10 flex items-center font-mono font-black tracking-tighter">
            {/* Opening bracket < */}
            <motion.span
              animate={{ x: isHovered ? -1 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-theme-accent font-bold text-[11px] sm:text-xs opacity-90 transition-colors"
            >
              &lt;
            </motion.span>

            {/* Initials MR with Subtle Gradient */}
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-theme-text via-theme-text to-theme-accent font-extrabold px-0.5 transition-colors">
              MR
            </span>

            {/* Closing slash & bracket /> */}
            <motion.span
              animate={{ x: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-theme-accent font-bold text-[11px] sm:text-xs opacity-90 transition-colors"
            >
              /&gt;
            </motion.span>
          </div>

          {/* Subtle Ambient Micro-Dot in Corner */}
          <span className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-theme-accent opacity-70" />
        </motion.div>
      </div>

      {/* 2. Brand Name & Engineering Subtitle */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black text-theme-text tracking-tight leading-tight group-hover:text-theme-accent transition-colors duration-200 ${titleSize}`}
          >
            M. Rashed
          </span>

          {/* Pulsing Active Status Indicator */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-accent opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-theme-accent" />
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] text-theme-accent font-mono font-semibold tracking-wide">
              .NET
            </span>
            <span className="text-[10px] text-theme-muted font-mono font-normal">
              &amp; AI Engineer
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

