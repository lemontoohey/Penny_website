'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useUiStore } from '@/store/useUiStore';

export const CinematicLoader = () => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const setHasLoaded = useUiStore((state) => state.setHasLoaded);

  useEffect(() => {
    if (!loaderRef.current || !barRef.current) return;
    
    // Timeline sequence for pure luxury cinema load
    const tl = gsap.timeline({
      onComplete: () => {
        setHasLoaded(true);
        // Clean up DOM after finish
        gsap.set(loaderRef.current, { display: 'none' });
      },
    });

    // 1. Thin Vermillion line completes over 2s
    tl.to(barRef.current, {
      scaleX: 1,
      duration: 2,
      ease: 'power3.inOut',
      transformOrigin: 'left center',
    });

    // 2. Bar disappears into nothingness quickly
    tl.to(barRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power1.out',
    });

    // 3. The pure Violet screen fades out over 1.5s, letting the WebGL "bloom"
    tl.to(loaderRef.current, {
      opacity: 0,
      duration: 1.5,
      ease: 'power2.inOut',
    });

    return () => {
      tl.kill();
    };
  }, [setHasLoaded]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-void pointer-events-none"
    >
      <div className="w-1/2 max-w-sm h-px bg-void/50 overflow-hidden relative">
        <div
          ref={barRef}
          className="absolute inset-y-0 left-0 w-full bg-vermillion scale-x-0 origin-left"
        />
      </div>
    </div>
  );
};
