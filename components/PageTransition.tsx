'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUiStore } from '@/store/useUiStore';

export const PageTransition = () => {
  const isTransitioning = useUiStore((state) => state.isTransitioning);
  const setIsTransitioning = useUiStore((state) => state.setIsTransitioning);
  const [phase, setPhase] = useState<'idle' | 'flash' | 'dissolve'>('idle');

  useEffect(() => {
    if (isTransitioning) {
      setPhase('flash');
    }
  }, [isTransitioning]);

  return (
    <motion.div
      className="fixed inset-0 z-[1000] pointer-events-none page-transition-overlay"
      initial={{ opacity: 0 }}
      animate={{
        opacity: phase === 'flash' ? 0.3 : phase === 'dissolve' ? 0 : 0,
      }}
      transition={
        phase === 'flash'
          ? { duration: 0.1, ease: 'easeOut' }
          : phase === 'dissolve'
            ? { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
            : { duration: 0 }
      }
      onAnimationComplete={() => {
        if (phase === 'flash') setPhase('dissolve');
        else if (phase === 'dissolve') {
          setPhase('idle');
          setIsTransitioning(false);
        }
      }}
    />
  );
};
