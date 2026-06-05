'use client';

import { useState } from 'react';
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
          <div
            key={artwork.id}
            className="cursor-pointer w-[82vw] md:w-[42vw]"
            onClick={() => setSelected(artwork)}
          >
            <motion.div layoutId={`artwork-container-${artwork.id}`}>
              <motion.img
                layoutId={`artwork-image-${artwork.id}`}
                src={imgSrc(artwork.image)}
                alt={artwork.title}
                className="w-full h-[60vh] md:h-[72vh] object-cover"
              />
            </motion.div>
            <p className="mt-4 font-serif text-[11px] tracking-[0.25em] uppercase text-[#FDF5E6]/70">
              {artwork.title}
            </p>
            <p className="font-serif text-[11px] tracking-[0.25em] uppercase text-[#FDF5E6]/40">
              {artwork.price}
            </p>
          </div>
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
