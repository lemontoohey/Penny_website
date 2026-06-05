'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import artworksData from '@/src/data/artworks.json';

export interface Artwork {
  id: string;
  title: string;
  price: string;
  imagePath: string;
  image: string;
  images?: string[];
  colors: string[];
  dimensions: string;
  medium: string;
}

export interface HorizontalGalleryProps {
  onSelect: (artwork: Artwork) => void;
}

const artworks = artworksData as Artwork[];
const total = artworks.length;

const pad = (n: number) => String(n).padStart(2, '0');
const src = (p: string) =>
  process.env.NODE_ENV === 'production' ? `/Penny_website${p}` : p;

export function HorizontalGallery({ onSelect }: HorizontalGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const touchStartRef = useRef<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getMax = () =>
    typeof window !== 'undefined' ? Math.max(0, (total - 1) * window.innerWidth) : 0;

  // RAF lerp loop
  useEffect(() => {
    const tick = () => {
      currentRef.current += (targetRef.current - currentRef.current) * 0.08;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${currentRef.current}px)`;
      }
      const ww = typeof window !== 'undefined' ? Math.max(1, window.innerWidth) : 1;
      const idx = Math.round(currentRef.current / ww);
      setCurrentIndex((p) => (p !== idx ? idx : p));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Wheel — deltaY drives horizontal scroll, passive:false to preventDefault
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetRef.current = Math.max(
        0,
        Math.min(targetRef.current + (e.deltaY + e.deltaX) * 1.2, getMax())
      );
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Touch swipe
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientX;
    };
    const onMove = (e: TouchEvent) => {
      if (touchStartRef.current === null) return;
      const delta = touchStartRef.current - e.touches[0].clientX;
      touchStartRef.current = e.touches[0].clientX;
      targetRef.current = Math.max(0, Math.min(targetRef.current + delta, getMax()));
    };
    const onEnd = () => { touchStartRef.current = null; };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, []);

  // Keyboard — relative step of 85% viewport width per press
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        targetRef.current = Math.min(targetRef.current + window.innerWidth * 0.85, getMax());
      } else if (e.key === 'ArrowLeft') {
        targetRef.current = Math.max(targetRef.current - window.innerWidth * 0.85, 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Snap to panel index (used by arrow buttons)
  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, total - 1));
    targetRef.current = clamped * (typeof window !== 'undefined' ? window.innerWidth : 0);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {/* Scrolling track */}
      <div
        ref={trackRef}
        style={{ display: 'flex', width: 'fit-content', height: '100vh', willChange: 'transform' }}
      >
        {artworks.map((artwork, idx) => (
          <div
            key={artwork.id}
            style={{ flex: '0 0 100vw', height: '100vh', position: 'relative' }}
          >
            {/* Centred column — image frame + caption, vertically and horizontally centred */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
              {/* Image frame — layoutId matches ArtworkDetail's artwork-container-* */}
              <motion.div
                layoutId={`artwork-container-${artwork.id}`}
                onClick={() => onSelect(artwork)}
                style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                className="w-[82vw] h-[60vh] md:w-[42vw] md:h-[72vh]"
              >
                {/* Image layer — layoutId matches ArtworkDetail's artwork-image-* */}
                <motion.div
                  layoutId={`artwork-image-${artwork.id}`}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <Image
                    src={src(artwork.imagePath)}
                    alt={artwork.title}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center top' }}
                    sizes="(max-width: 768px) 82vw, 42vw"
                    priority={idx < 2}
                  />
                </motion.div>
              </motion.div>

              {/* Caption — below image, not overlapping */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  pointerEvents: 'none',
                }}
              >
                <span
                  className="font-serif tracking-[0.25em] text-[11px] uppercase"
                  style={{ color: 'rgba(253,245,230,0.70)' }}
                >
                  {artwork.title}
                </span>
                <span
                  className="font-serif tracking-[0.25em] text-[11px] uppercase"
                  style={{ color: 'rgba(253,245,230,0.70)' }}
                >
                  {artwork.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Panel counter — fixed bottom-centre */}
      <div
        className="font-serif text-[10px]"
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(253,245,230,0.40)',
          letterSpacing: '0.15em',
          pointerEvents: 'none',
        }}
      >
        {pad(currentIndex + 1)} / {pad(total)}
      </div>

      {/* Left arrow */}
      <button
        onClick={() => goTo(currentIndex - 1)}
        aria-label="Previous artwork"
        className="text-[#FDF5E6]/30 hover:text-[#FDF5E6]/80 transition-colors duration-300"
        style={{
          position: 'fixed',
          left: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: currentIndex === 0 ? 'default' : 'pointer',
          padding: '1rem',
          fontSize: '1.25rem',
          opacity: currentIndex === 0 ? 0.15 : 1,
          transition: 'opacity 300ms ease',
        }}
      >
        ←
      </button>

      {/* Right arrow */}
      <button
        onClick={() => goTo(currentIndex + 1)}
        aria-label="Next artwork"
        className="text-[#FDF5E6]/30 hover:text-[#FDF5E6]/80 transition-colors duration-300"
        style={{
          position: 'fixed',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: currentIndex === total - 1 ? 'default' : 'pointer',
          padding: '1rem',
          fontSize: '1.25rem',
          opacity: currentIndex === total - 1 ? 0.15 : 1,
          transition: 'opacity 300ms ease',
        }}
      >
        →
      </button>
    </div>
  );
}
