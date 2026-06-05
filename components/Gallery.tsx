'use client';

import { memo, useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useUiStore } from '@/store/useUiStore';
import { HorizontalGallery, Artwork } from './HorizontalGallery';
import { ArtworkDetail } from '@/app/art/[id]/ArtworkDetail';

interface CardProps {
  artwork: Artwork;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

const PureArtworkCard = memo(({ artwork, index, isActive, isSelected, onSelect }: CardProps) => {
  const cardRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  const imageSrc = artwork.imagePath
    ? process.env.NODE_ENV === 'production' && !artwork.imagePath.startsWith('http')
      ? `/camille_website${artwork.imagePath}`
      : artwork.imagePath
    : process.env.NODE_ENV === 'production'
      ? '/camille_website/placeholders/artwork-1.jpg'
      : '/placeholders/artwork-1.jpg';

  const getWidthClass = (i: number) => {
    const widths = ['md:max-w-xl', 'md:max-w-3xl', 'md:max-w-2xl', 'md:max-w-4xl'];
    return `w-full ${widths[i % widths.length]}`;
  };

  const getAlignmentClass = (i: number) => {
    const alignments = ['self-start', 'self-center', 'self-end', 'self-center'];
    return alignments[i % alignments.length];
  };

  // Entrance animation — fires once when the panel becomes active
  useGSAP(
    () => {
      if (!isActive || hasAnimated.current || !cardRef.current || isSelected) return;
      hasAnimated.current = true;

      const card = cardRef.current;
      const container = card.querySelector('.card-container');
      const imageWrapper = card.querySelector<HTMLElement>('.image-wrapper');
      const img = card.querySelector<HTMLElement>('.artwork-image');
      const benziColor = card.querySelector('.benzi-color');
      const benziSolid = card.querySelector('.benzi-solid');
      const benziGlaze = card.querySelector('.benzi-glaze');
      const magentaLight = card.querySelector('.magenta-light');
      const brownLight = card.querySelector('.brown-light');
      const meta = card.querySelector('.meta-block');
      const isDesktop =
        typeof window !== 'undefined' && window.matchMedia('(min-width: 769px)').matches;

      if (!imageWrapper || !img || !meta || !container) return;

      const tl = gsap.timeline();

      if (magentaLight) {
        tl.to(magentaLight, { opacity: 0.08, scale: 1.05, duration: 0.3, ease: 'power1.inOut' }, 0)
          .to(magentaLight, { opacity: 0, scale: 1.15, duration: 0.7, ease: 'power2.out' }, 0.3);
      }
      if (brownLight) {
        tl.to(brownLight, { opacity: 0.3, scale: 1.02, duration: 0.5, ease: 'power2.inOut' }, 0)
          .to(brownLight, { opacity: 0, scale: 1.03, duration: 0.5, ease: 'power2.inOut' }, 0.5);
      }
      if (benziColor && benziSolid && benziGlaze) {
        tl.to([benziColor, benziSolid, benziGlaze], { opacity: 0, ease: 'power2.inOut', duration: 1 }, 0);
      } else if (benziColor && benziSolid) {
        tl.to([benziColor, benziSolid], { opacity: 0, ease: 'power2.inOut', duration: 1 }, 0);
      }
      if (isDesktop) {
        tl.to(
          container,
          {
            boxShadow:
              '0 50px 100px -25px rgba(35,15,60,0.9), 0 0 50px 4px rgba(90,30,120,0.35)',
            ease: 'power2.inOut',
            duration: 1,
          },
          0
        );
      }

      tl.fromTo(
        imageWrapper,
        { scale: 1.15, yPercent: -3 },
        { scale: 1.05, yPercent: 3, ease: 'power2.out', duration: 1 },
        0
      );

      tl.fromTo(img, { filter: 'blur(8px)' }, { filter: 'blur(0px)', ease: 'power2.out', duration: 1 }, 0);

      tl.to(meta, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.8 }, 0.2);
    },
    { dependencies: [isActive, isSelected], scope: cardRef }
  );

  // Mouse hover 3D tilt + image scale
  useGSAP(
    () => {
      if (!cardRef.current) return;
      const card = cardRef.current;
      const container = card.querySelector('.card-container');
      const img = card.querySelector<HTMLElement>('.artwork-image');
      const hasHover =
        typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

      if (!container || !img || !hasHover) return;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -3;
        const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 3;
        const shadowX = ((e.clientX - centerX) / (rect.width / 2)) * -20;
        const shadowY = ((e.clientY - centerY) / (rect.height / 2)) * -20;
        gsap.to(container, {
          rotateX,
          rotateY,
          boxShadow: `${shadowX}px ${40 + shadowY}px 80px -20px rgba(35,15,60,0.8), 0 0 50px 8px rgba(90,30,120,0.4)`,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      };

      const onEnter = () => {
        gsap.to(img, { scale: 1.03, duration: 1.2, ease: 'power2.out' });
        card.addEventListener('mousemove', handleMouseMove);
      };

      const onLeave = () => {
        card.removeEventListener('mousemove', handleMouseMove);
        gsap.to(container, {
          rotateX: 0,
          rotateY: 0,
          boxShadow: '0 40px 80px -20px rgba(35,15,60,0.8), 0 0 30px 2px rgba(90,30,120,0.2)',
          duration: 1.2,
          ease: 'elastic.out(1, 0.4)',
        });
        gsap.to(img, { scale: 1, duration: 1.2, ease: 'power2.out' });
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);

      return () => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mouseleave', onLeave);
        card.removeEventListener('mousemove', handleMouseMove);
      };
    },
    { scope: cardRef }
  );

  if (isSelected) {
    return <div style={{ width: '100%', height: '100%' }} />;
  }

  return (
    <article
      ref={cardRef}
      className={`artwork-card relative group flex flex-col gap-8 w-full perspective-[2000px] ${getAlignmentClass(index)} ${getWidthClass(index)}`}
    >
      <div
        className="block w-full cursor-pointer"
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSelect();
        }}
      >
        <motion.div
          layoutId={`artwork-container-${artwork.id}`}
          className="card-container relative w-full aspect-[4/5] bg-void [transform-style:preserve-3d] will-change-transform overflow-hidden rounded-sm [contain:paint]"
          style={{
            boxShadow: '0 40px 80px -20px rgba(35,15,60,0.8), 0 0 30px 2px rgba(90,30,120,0.2)',
          }}
        >
          {/* Soft vignette: inset magenta/violet hugs frame, no mix-blend clipping */}
          <div
            className="absolute inset-0 pointer-events-none rounded-sm"
            style={{ boxShadow: 'inset 0 0 60px 10px rgba(107, 0, 56, 0.15)' }}
            aria-hidden
          />
          {/* Microscopic noise overlay to dither Dioxazine shadow banding */}
          <div
            className="absolute inset-0 z-[5] pointer-events-none opacity-[0.015] bg-noise mix-blend-overlay"
            aria-hidden
          />
          {/* Physical canvas surface: image + glazes move/scale as one locked object */}
          <motion.div
            layoutId={`artwork-image-${artwork.id}`}
            className="image-wrapper absolute inset-0 overflow-hidden will-change-transform"
          >
            <Image
              src={imageSrc}
              alt={artwork.title}
              fill
              className="artwork-image object-cover will-change-transform"
              sizes="(max-width: 768px) 100vw, 70vw"
              priority={index < 2}
            />
            {/* Zinnia flower reveal overlays — dark-centre → deep → mid → bloom */}
            <div className="benzi-color absolute inset-0 bg-[#4A0F20] mix-blend-color opacity-[0.82] z-10 pointer-events-none will-change-opacity md:backdrop-brightness-[1.15] md:backdrop-contrast-[1.05]" />
            <div className="benzi-solid absolute inset-0 bg-[#7A1835] opacity-[0.82] z-10 pointer-events-none will-change-opacity" />
            <div className="benzi-glaze absolute inset-0 bg-[#D4487A] mix-blend-color opacity-[0.5] z-10 pointer-events-none will-change-opacity md:backdrop-brightness-[1.15] md:backdrop-contrast-[1.05]" />
            <div className="magenta-light absolute inset-0 bg-[#F07898] mix-blend-screen opacity-0 blur-[40px] md:blur-[60px] scale-90 z-20 pointer-events-none will-change-transform" />
            <div className="brown-light absolute inset-0 bg-[#7A1835] mix-blend-screen opacity-0 blur-[50px] md:blur-[80px] scale-90 z-20 pointer-events-none will-change-transform" />
          </motion.div>
        </motion.div>
      </div>

      <div className="meta-block flex flex-col gap-3 px-2 sm:px-0 opacity-0 translate-y-8 will-change-transform">
        <div className="flex flex-row justify-between items-baseline gap-8">
          <h2 className="text-parchment font-serif text-base md:text-xl leading-tight tracking-wide group-hover:text-benzi transition-colors duration-500">
            {artwork.title}
          </h2>
          <div className="relative overflow-hidden">
            <div className="relative">
              <span className="block text-parchment/70 font-sans tracking-[0.1em] text-sm font-light transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-full">
                {artwork.price}
              </span>
              <span className="absolute inset-0 block text-benzi font-sans tracking-[0.1em] text-sm font-light translate-y-full opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                Acquire
              </span>
            </div>
            <div className="absolute left-0 top-1/2 w-full h-[1px] bg-benzi scale-x-0 origin-left transition-transform duration-500 ease-in-out group-hover:scale-x-100" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-parchment/40 font-sans text-xs font-light tracking-wider uppercase">
            {artwork.medium}
          </p>
          <p className="text-parchment/40 font-sans text-xs font-light tracking-wider">
            {artwork.dimensions}
          </p>
        </div>
      </div>
    </article>
  );
});

PureArtworkCard.displayName = 'PureArtworkCard';

export const Gallery = () => {
  const setCanvasPaused = useUiStore((state) => state.setCanvasPaused);
  const scrollVelocity = useUiStore((state) => state.scrollVelocity);
  const isScrolling = Math.abs(scrollVelocity) > 2;

  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    setCanvasPaused(false);
    return () => setCanvasPaused(true);
  }, [setCanvasPaused]);

  const handleSelectArtwork = useCallback((artwork: Artwork) => {
    setSelectedArtwork(artwork);
  }, []);

  const handleCloseArtwork = useCallback(() => {
    setSelectedArtwork(null);
  }, []);

  return (
    <>
      <header
        className={`fixed top-1/3 left-4 md:left-8 z-50 transition-opacity duration-700 hidden md:block ${isScrolling ? 'opacity-0' : 'opacity-100 pointer-events-none'}`}
      >
        <h1 className="font-sans text-[10px] text-parchment tracking-[0.5em] uppercase opacity-40 [writing-mode:vertical-rl] rotate-180">
          Selected Works
        </h1>
      </header>
      <header
        className={`md:hidden fixed top-16 left-6 z-50 transition-opacity duration-700 pointer-events-none ${isScrolling ? 'opacity-0' : 'opacity-100'}`}
      >
        <h1 className="font-sans text-[10px] text-parchment tracking-[0.5em] uppercase opacity-40">
          Selected Works
        </h1>
      </header>

      <HorizontalGallery onSelect={handleSelectArtwork} />

      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            key={selectedArtwork.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200 }}
          >
            <ArtworkDetail artwork={selectedArtwork} onClose={handleCloseArtwork} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
