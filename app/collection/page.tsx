'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtworkDetail } from '@/app/art/[id]/ArtworkDetail';
import artworksData from '@/src/data/artworks.json';

interface Artwork {
  id: string;
  title: string;
  price: string;
  colors: string[];
  dimensions: string;
  medium: string;
  image: string;
  images?: string[];
}

const artworks = artworksData as Artwork[];

const imgSrc = (path: string) =>
  process.env.NODE_ENV === 'production' ? `/Penny_website${path}` : path;

const ZINNIA_LAYERS = [
  'rgba(158, 48,  96,  0.45)',   // #9E3060 deep outer rose
  'rgba(125, 21,  69,  0.45)',   // #7D1545 magenta core
  'rgba(139, 173, 48,  0.45)',   // #8BAD30 chartreuse lime
  'rgba(212, 136, 92,  0.45)',   // #D4885C warm apricot
  'rgba(196, 96,  122, 0.45)',   // #C4607A salmon rose
];

function ArtworkCard({
  artwork,
  onSelect,
}: {
  artwork: Artwork;
  onSelect: (a: Artwork) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !revealed) {
          setRevealed(true);
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);

  return (
    <div
      ref={ref}
      className="cursor-pointer w-[82vw] md:w-[42vw]"
      onClick={() => onSelect(artwork)}
    >
      {/* Image frame — overflow:hidden clips the wipe layers cleanly */}
      <motion.div
        layoutId={`artwork-container-${artwork.id}`}
        className="relative w-full h-[60vh] md:h-[72vh] overflow-hidden"
      >
        <motion.img
          layoutId={`artwork-image-${artwork.id}`}
          src={imgSrc(artwork.image)}
          alt={artwork.title}
          className="w-full h-full object-cover"
        />

        {ZINNIA_LAYERS.map((colour, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 z-10"
            style={{ backgroundColor: colour, transformOrigin: 'top' }}
            initial={{ scaleY: 1 }}
            animate={revealed ? { scaleY: 0 } : { scaleY: 1 }}
            transition={{
              duration: 0.45,
              delay: i * 0.06,
              ease: [0.76, 0, 0.24, 1],
            }}
          />
        ))}
      </motion.div>

      <p className="mt-4 font-serif text-[11px] tracking-[0.25em] uppercase text-[#FDF5E6]/70">
        {artwork.title}
      </p>
      <p className="font-serif text-[11px] tracking-[0.25em] uppercase text-[#FDF5E6]/40">
        {artwork.price}
      </p>
    </div>
  );
}

export default function CollectionPage() {
  const [selected, setSelected] = useState<Artwork | null>(null);

  return (
    <div className="w-full relative">
      <nav className="fixed top-12 right-6 md:right-12 z-50 flex gap-8 font-sans text-[10px] tracking-[0.3em] uppercase text-[#FDF5E6]/50">
        <Link href="/about" className="hover:text-[#FDF5E6] transition-colors duration-500">
          [ The Artist ]
        </Link>
        <a href="mailto:studio@pennyevans.art" className="hover:text-[#FDF5E6] transition-colors duration-500">
          [ Studio ]
        </a>
      </nav>

      <div className="w-full pt-32 pb-32 flex flex-col items-center gap-24">
        {artworks.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            onSelect={setSelected}
          />
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200 }}
          >
            <ArtworkDetail
              artwork={selected}
              onClose={() => setSelected(null)}
              isActive={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
