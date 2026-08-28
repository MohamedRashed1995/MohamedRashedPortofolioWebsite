import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useProfileImage } from '@/context/ProfileImageContext';
import { useLanguage } from '@/context/LanguageContext';

export const HeroAvatar: React.FC = () => {
  const { profileImage } = useProfileImage();
  const { isRTL } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt physics for 3D depth
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const xPct = (e.clientX - rect.left) / width - 0.5;
    const yPct = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <div
      className="relative flex items-center justify-center py-6 select-none"
      style={{ perspective: 1000 }}
    >
      {/* 1. Ambient Background Soft Glow (Pulsing & Morphing) */}
      <motion.div
        animate={{
          scale: isHovered ? [1, 1.15, 1.08] : [1, 1.08, 1],
          opacity: isHovered ? [0.65, 0.9, 0.75] : [0.45, 0.65, 0.45],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -inset-6 sm:-inset-10 bg-gradient-to-tr from-theme-accent via-theme-accent-sec/40 to-theme-accent rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-3xl pointer-events-none"
      />

      {/* 2. Floating 3D Container (Levitation Animation) */}
      <motion.div
        animate={{
          y: isHovered ? 0 : [0, -14, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative group cursor-pointer"
      >
        {/* 3. Rotating Gradient Outer Border Aura */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: isHovered ? 6 : 14,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -inset-2.5 sm:-inset-3.5 rounded-[38%_62%_63%_37%/41%_44%_56%_59%] opacity-85 group-hover:opacity-100 blur-[2px] transition duration-500"
          style={{
            background: 'conic-gradient(from 0deg, var(--color-accent-primary), var(--color-accent-secondary), var(--color-accent-primary-hover), var(--color-accent-primary))',
          }}
        />

        {/* 4. Morphing Organic Blob Frame Shell */}
        <motion.div
          animate={{
            borderRadius: isHovered
              ? ['45% 55% 58% 42% / 48% 42% 58% 52%', '52% 48% 45% 55% / 55% 58% 42% 45%']
              : [
                  '58% 42% 65% 35% / 45% 58% 42% 55%',
                  '42% 58% 38% 62% / 58% 42% 58% 42%',
                  '62% 38% 55% 45% / 48% 62% 38% 52%',
                  '58% 42% 65% 35% / 45% 58% 42% 55%',
                ],
          }}
          transition={{
            duration: isHovered ? 4 : 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative p-2 sm:p-2.5 bg-theme-card/90 backdrop-blur-xl border border-theme-accent/40 shadow-2xl overflow-hidden transition-colors duration-500"
        >
          {/* Inner Image Container (Enlarged Responsive Scale) */}
          <motion.div
            animate={{
              borderRadius: isHovered
                ? ['42% 58% 55% 45% / 45% 48% 52% 55%', '50% 50% 48% 52% / 52% 55% 45% 48%']
                : [
                    '55% 45% 62% 38% / 42% 55% 45% 58%',
                    '38% 62% 42% 58% / 55% 38% 62% 45%',
                    '58% 42% 52% 48% / 45% 58% 42% 55%',
                    '55% 45% 62% 38% / 42% 55% 45% 58%',
                  ],
            }}
            transition={{
              duration: isHovered ? 4 : 9,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[22rem] lg:h-[22rem] xl:w-[24.5rem] xl:h-[24.5rem] overflow-hidden bg-slate-950 relative border-2 border-theme-accent/30 shadow-inner"
          >
            {/* High Definition Portrait */}
            <motion.img
              src={profileImage}
              alt="Mohamed Rashed Abdelazim"
              className="w-full h-full object-cover object-top pointer-events-none"
              animate={{
                scale: isHovered ? 1.08 : 1.02,
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
              }}
              loading="eager"
              referrerPolicy="no-referrer"
            />

            {/* Subtle Gradient Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

            {/* Futuristic Subtle Corner Tech Markers */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-theme-accent/60 pointer-events-none" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-theme-accent/60 pointer-events-none" />
          </motion.div>
        </motion.div>

        {/* 5. Floating "Open to work" Status Badge */}
        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute -bottom-3 sm:-bottom-4 ${
            isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
          } z-20`}
        >
          <div className="group/badge relative px-4 py-2 rounded-full bg-theme-card/95 backdrop-blur-md border border-theme-accent/50 shadow-xl flex items-center gap-2.5 hover:border-theme-accent transition-all duration-300">
            {/* Live radar pulsating beacon */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </span>

            <span className="text-xs font-bold text-theme-text font-mono tracking-tight whitespace-nowrap">
              {isRTL ? 'متاح للعمل (Open to work)' : 'Open to work'}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
