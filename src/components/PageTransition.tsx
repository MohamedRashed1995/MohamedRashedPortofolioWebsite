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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
