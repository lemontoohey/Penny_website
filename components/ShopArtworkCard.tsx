'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Artwork {
  id: string;
  title: string;
  price: string;
  colors: string[];
  dimensions: string;
  medium: string;
}

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const REVEAL_DURATION = 1.5;

export function ShopArtworkCard({ artwork }: { artwork: Artwork; index: number }) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAcquireClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isClosing) return;
    setIsClosing(true);

    // Sequence: scale down → glow flash → lines snap → wait 600ms → navigate
    setTimeout(() => {
      router.push(`/shop/checkout?item=${artwork.id}`);
    }, 600);
  };

  return (
    <article className="flex flex-col items-center gap-8 w-full max-w-2xl">
      <motion.div
        className="relative w-full aspect-[4/5] overflow-hidden group cursor-pointer"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
        variants={{
          hidden: {},
          visible: {},
        }}
      >
        {/* Aperture lines - z-index above image, below metadata */}
        {/* Green vertical lines */}
        <motion.div
          className="absolute top-0 bottom-0 w-px bg-[var(--color-pg7)] z-10"
          style={{ left: '50%' }}
          initial={{ left: '50%' }}
          whileInView={{ left: '0%' }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE }}
          animate={
            isClosing
              ? { left: '50%', transition: { duration: 0.3, ease: 'easeIn' } }
              : undefined
          }
        />
        <motion.div
          className="absolute top-0 bottom-0 w-px bg-[var(--color-pg7)] z-10"
          style={{ right: '50%' }}
          initial={{ right: '50%' }}
          whileInView={{ right: '0%' }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE }}
          animate={
            isClosing
              ? { right: '50%', transition: { duration: 0.3, ease: 'easeIn' } }
              : undefined
          }
        />
        {/* Magenta horizontal lines */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-[var(--color-magenta)] z-10"
          style={{ top: '50%' }}
          initial={{ top: '50%' }}
          whileInView={{ top: '0%' }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE }}
          animate={
            isClosing
              ? { top: '50%', transition: { duration: 0.3, ease: 'easeIn' } }
              : undefined
          }
        />
        <motion.div
          className="absolute left-0 right-0 h-px bg-[var(--color-magenta)] z-10"
          style={{ bottom: '50%' }}
          initial={{ bottom: '50%' }}
          whileInView={{ bottom: '0%' }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE }}
          animate={
            isClosing
              ? { bottom: '50%', transition: { duration: 0.3, ease: 'easeIn' } }
              : undefined
          }
        />

        {/* Image / content container with clip-path aperture */}
        <motion.div
          className="absolute inset-0 z-[5] transition-shadow duration-500"
          style={{
            boxShadow: isClosing
              ? '0 10px 20px -5px rgba(10,5,25,0.9), 0 0 10px rgba(150,40,20,0.3)'
              : isHovered
                ? '0 50px 90px -20px rgba(10,5,25,1), 0 0 25px 2px rgba(150,40,20,0.2)'
                : '0 30px 60px -15px rgba(10,5,25,0.8), 0 0 15px 1px rgba(150,40,20,0.1)',
          }}
          initial={{ clipPath: 'inset(50% 50% 50% 50%)' }}
          whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE }}
          animate={
            isClosing
              ? {
                  clipPath: 'inset(50% 50% 50% 50%)',
                  scale: 0.98,
                  boxShadow: '0 10px 20px -5px rgba(10,5,25,0.9), 0 0 10px rgba(150,40,20,0.3)',
                  transition: {
                    clipPath: { duration: 0.3, ease: 'easeIn' },
                    scale: { duration: 0.3 },
                    boxShadow: { duration: 0.3 },
                  },
                }
              : undefined
          }
        >
          <motion.div
            className="absolute inset-0 w-full h-full"
            animate={isClosing ? { scale: 0.95 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {artwork.colors.map((color, idx) => (
              <div
                key={idx}
                className="absolute mix-blend-screen"
                style={{
                  backgroundColor: color,
                  inset: `${idx * 15}%`,
                  opacity: 0.9,
                  mixBlendMode: idx > 0 ? 'overlay' : 'normal',
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Click overlay - transparent hit area */}
        <button
          type="button"
          className="absolute inset-0 z-20 cursor-pointer"
          onClick={handleAcquireClick}
          onMouseEnter={() => !isClosing && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label={`Acquire ${artwork.title}`}
        />
      </motion.div>

      {/* Metadata - z-index above lines */}
      <div className="flex flex-col gap-2 text-center z-30 relative">
        <h2 className="text-parchment font-serif text-xl tracking-wide">{artwork.title}</h2>
        <p className="text-parchment/70 font-sans text-sm tracking-[0.1em]">{artwork.price}</p>
        <p className="text-parchment/50 font-sans text-xs tracking-wider uppercase">
          {artwork.medium} · {artwork.dimensions}
        </p>
      </div>
    </article>
  );
}
