'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HorizontalGallery, Artwork } from '@/components/HorizontalGallery';
import { ArtworkDetail } from '@/app/art/[id]/ArtworkDetail';

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

      <HorizontalGallery onSelect={setSelected} />

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
