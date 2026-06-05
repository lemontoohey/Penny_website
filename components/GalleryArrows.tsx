'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GalleryArrowsProps {
  currentPanel: number;
  totalPanels: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

export function GalleryArrows({ currentPanel, totalPanels, onPrev, onNext, onGoTo }: GalleryArrowsProps) {
  const [hintShown, setHintShown] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!sessionStorage.getItem('gallery-hint-dismissed')) {
      setHintShown(true);
    }
  }, []);

  const dismissHint = () => {
    sessionStorage.setItem('gallery-hint-dismissed', '1');
    setHintShown(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100 }}>

      {/* Left chevron */}
      {currentPanel > 0 && (
        <button
          onClick={onPrev}
          aria-label="Previous panel"
          style={{
            position: 'absolute',
            left: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
          }}
          onMouseEnter={(e) => {
            const svg = e.currentTarget.querySelector('svg');
            if (svg) svg.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            const svg = e.currentTarget.querySelector('svg');
            if (svg) svg.style.opacity = '0.3';
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', opacity: 0.3, transition: 'opacity 400ms ease' }}
          >
            <polyline
              points="20,8 12,16 20,24"
              stroke="var(--color-vermillion)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Right chevron */}
      {currentPanel < totalPanels - 1 && (
        <button
          onClick={onNext}
          aria-label="Next panel"
          style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
          }}
          onMouseEnter={(e) => {
            const svg = e.currentTarget.querySelector('svg');
            if (svg) svg.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            const svg = e.currentTarget.querySelector('svg');
            if (svg) svg.style.opacity = '0.3';
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', opacity: 0.3, transition: 'opacity 400ms ease' }}
          >
            <polyline
              points="12,8 20,16 12,24"
              stroke="var(--color-vermillion)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Progress rects — bottom-center */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        {Array.from({ length: totalPanels }).map((_, i) => (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            aria-label={`Go to panel ${i + 1}`}
            style={{
              display: 'block',
              width: i === currentPanel ? '32px' : '16px',
              height: '1px',
              background: 'var(--color-parchment)',
              opacity: i === currentPanel ? 0.7 : 0.15,
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'opacity 500ms ease, width 500ms ease',
            }}
          />
        ))}
      </div>

      {/* Panel counter — bottom-right */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          fontFamily: 'var(--font-sans)',
          fontSize: '9px',
          letterSpacing: '0.3em',
          color: 'var(--color-parchment)',
          opacity: 0.3,
          textTransform: 'uppercase',
          userSelect: 'none',
        }}
      >
        {String(currentPanel + 1).padStart(2, '0')} / {String(totalPanels).padStart(2, '0')}
      </div>

      {/* One-time horizontal scroll hint */}
      {hintShown && (
        <motion.div
          initial={{ opacity: 0.4, x: 0 }}
          animate={{ opacity: 0, x: 12 }}
          transition={{ duration: 2, delay: 1.5, ease: 'easeOut' }}
          onAnimationComplete={dismissHint}
          style={{
            position: 'fixed',
            bottom: '3.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          <svg
            width="32"
            height="14"
            viewBox="0 0 32 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0"
              y1="7"
              x2="24"
              y2="7"
              stroke="var(--color-vermillion)"
              strokeWidth="1"
            />
            <polyline
              points="20,3 28,7 20,11"
              stroke="var(--color-vermillion)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
