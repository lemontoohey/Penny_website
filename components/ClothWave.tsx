'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';

export interface ClothWaveHandle {
  trigger: (direction: 'left' | 'right') => void;
}

const ClothWave = forwardRef<ClothWaveHandle>((_, ref) => {
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);

  useImperativeHandle(ref, () => ({
    trigger(direction: 'left' | 'right') {
      if (typeof window !== 'undefined' && window.innerWidth <= 768) return;
      if (!turbulenceRef.current || !displacementRef.current) return;

      const tl = gsap.timeline();

      // Phase 1: wave builds — 180ms
      tl.to(turbulenceRef.current, {
        duration: 0.18,
        ease: 'power2.in',
        attr: {
          baseFrequency: direction === 'right' ? '0.018 0.008' : '0.008 0.018',
          seed: Math.floor(Math.random() * 20),
        },
      }, 0);
      tl.to(displacementRef.current, {
        duration: 0.18,
        ease: 'power2.in',
        attr: { scale: 65 },
      }, 0);

      // Phase 2: wave releases — 220ms
      tl.to(turbulenceRef.current, {
        duration: 0.22,
        ease: 'power3.out',
        attr: { baseFrequency: '0 0' },
      });
      tl.to(displacementRef.current, {
        duration: 0.22,
        ease: 'power3.out',
        attr: { scale: 0 },
      }, '<');
    },
  }));

  return (
    <svg
      aria-hidden
      focusable="false"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <filter
          id="cloth-wave-filter"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            ref={turbulenceRef}
            type="turbulence"
            baseFrequency="0 0"
            numOctaves={3}
            seed={1}
            result="turbulence"
          />
          <feDisplacementMap
            ref={displacementRef}
            in="SourceGraphic"
            in2="turbulence"
            scale={0}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
});

ClothWave.displayName = 'ClothWave';

export default ClothWave;
