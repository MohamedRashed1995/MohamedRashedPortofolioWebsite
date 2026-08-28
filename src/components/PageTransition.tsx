import { motion } from 'framer-motion';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  title?: string;
}

export default function PageTransition({ children, title }: PageTransitionProps) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}
