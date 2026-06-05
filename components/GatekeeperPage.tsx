'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const ZINNIA_EXIT = [
  '#9E3060',
  '#7D1545',
  '#829942',
  '#C28E70',
  '#C4607A',
];

export function GatekeeperPage() {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);
  const [scrollExit, setScrollExit] = useState(false);

  // Lock body/html scroll while gatekeeper is active
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  // Scroll-down intent → zinnia wipe exit
  // Body overflow is locked so scrollY stays 0 — use wheel + touch instead
  useEffect(() => {
    if (scrollExit || exiting) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) triggerScrollExit();
    };
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0].clientY < touchStartY - 20) triggerScrollExit();
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [scrollExit, exiting]);

  const triggerScrollExit = () => {
    if (scrollExit || exiting) return;
    sessionStorage.setItem('penny-entered', '1');
    setScrollExit(true);
    setTimeout(() => router.push('/collection'), 600);
  };

  const enter = () => {
    if (exiting || scrollExit) return;
    sessionStorage.setItem('penny-entered', '1');
    setContentVisible(false);
    setExiting(true);
    setTimeout(() => router.push('/collection'), 1100);
  };

  const skip = () => {
    if (exiting || scrollExit) return;
    sessionStorage.setItem('penny-entered', '1');
    setExiting(true);
    setTimeout(() => router.push('/collection'), 1100);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="gatekeeper"
        style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 10 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: exiting ? 1.2 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* CONTENT LAYER */}
        <AnimatePresence>
          {contentVisible && (
            <motion.div
              key="content"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: 'easeIn' }}
            >
              {/* A — Decorative mark */}
              <motion.span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(32px, 5vw, 52px)',
                  color: '#FDF5E6',
                  letterSpacing: '0.05em',
                  marginBottom: '2rem',
                  display: 'block',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.12 }}
                transition={{ duration: 4, ease: 'easeIn', delay: 0.5 }}
              >
                ✦
              </motion.span>

              {/* B — Brand name */}
              <motion.span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(14px, 2vw, 18px)',
                  color: '#FDF5E6',
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  display: 'block',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.88, y: 0 }}
                transition={{ duration: 2, ease: 'easeOut', delay: 1.8 }}
              >
                PENNY EVANS
              </motion.span>

              {/* C — Horizontal rule */}
              <motion.div
                style={{
                  width: '24px',
                  height: '1px',
                  background: '#FDF5E6',
                  opacity: 0.18,
                  margin: '1.5rem 0',
                  transformOrigin: 'center',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 2.8 }}
              />

              {/* D — Enter label */}
              <motion.span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '9px',
                  color: '#FDF5E6',
                  letterSpacing: '0.55em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  display: 'block',
                }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 0.28, transition: { duration: 1, delay: 3.4, ease: 'easeOut' } },
                  hovered: { opacity: 0.6, transition: { duration: 0.4, ease: 'easeOut' } },
                }}
                initial="hidden"
                animate="visible"
                whileHover="hovered"
                onClick={enter}
              >
                Enter
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SKIP — bottom-right */}
        <motion.span
          style={{
            position: 'absolute',
            bottom: '2rem',
            right: '2rem',
            fontSize: '9px',
            letterSpacing: '0.4em',
            color: '#FDF5E6',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 20,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1, delay: 4 }}
          onClick={skip}
        >
          SKIP
        </motion.span>

        {/* ZINNIA SCROLL-EXIT WIPE — sweeps up from bottom to cover screen */}
        {ZINNIA_EXIT.map((colour, i) => (
          <motion.div
            key={i}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: colour, opacity: 0.90 }}
            initial={{ scaleY: 0, transformOrigin: 'bottom' }}
            animate={scrollExit ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{
              duration: 0.18,
              delay: i * 0.04,
              ease: [0.76, 0, 0.24, 1],
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
