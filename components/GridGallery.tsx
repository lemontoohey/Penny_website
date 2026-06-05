'use client';

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ArtworkDetail } from '@/app/art/[id]/ArtworkDetail';
import artworksData from '@/src/data/artworks.json';

interface Artwork {
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

const artworks = artworksData as Artwork[];

function computeNeighbours(idx: number, cols: number, total: number): number[] {
  const rows = Math.ceil(total / cols);
  const row = Math.floor(idx / cols);
  const col = idx % cols;
  const ns: number[] = [];
  if (row > 0) ns.push(idx - cols);
  if (row < rows - 1) ns.push(idx + cols);
  if (col > 0) ns.push(idx - 1);
  if (col < cols - 1) ns.push(idx + 1);
  return ns;
}

interface CellProps {
  artwork: Artwork;
  idx: number;
  isHovered: boolean;
  isNeighbour: boolean;
  hoveredColor: string | null;
  onHoverStart: (idx: number) => void;
  onHoverEnd: () => void;
  onSelect: (id: string) => void;
}

const GalleryCell = memo(function GalleryCell({
  artwork,
  idx,
  isHovered,
  isNeighbour,
  hoveredColor,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: CellProps) {
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  const imageSrc = artwork.imagePath
    ? process.env.NODE_ENV === 'production' && !artwork.imagePath.startsWith('http')
      ? `/Penny_website${artwork.imagePath}`
      : artwork.imagePath
    : process.env.NODE_ENV === 'production'
      ? '/Penny_website/placeholders/artwork-1.jpg'
      : '/placeholders/artwork-1.jpg';

  const handleMouseEnter = useCallback(() => {
    onHoverStart(idx);
    if (imageWrapperRef.current) {
      gsap.fromTo(
        imageWrapperRef.current,
        { scale: 1 },
        { scale: 1.04, duration: 20, ease: 'none', overwrite: true }
      );
    }
  }, [idx, onHoverStart]);

  const handleMouseLeave = useCallback(() => {
    onHoverEnd();
    if (imageWrapperRef.current) {
      gsap.killTweensOf(imageWrapperRef.current);
      gsap.set(imageWrapperRef.current, { scale: 1 });
    }
  }, [onHoverEnd]);

  const boxShadow = isHovered
    ? `inset 0 0 0 2px ${artwork.colors[0]}`
    : isNeighbour && hoveredColor
      ? `0 0 30px 0 ${hoveredColor}26`
      : 'none';

  const shadowTransition = isHovered ? 'box-shadow 500ms ease' : 'box-shadow 800ms ease';

  return (
    <motion.div
      layoutId={`artwork-cell-${artwork.id}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        boxShadow,
        transition: shadowTransition,
      }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(artwork.id)}
    >
      <div ref={imageWrapperRef} style={{ position: 'absolute', inset: 0 }}>
        <Image
          src={imageSrc}
          alt={artwork.title}
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          sizes="(max-width: 768px) 50vw, 25vw"
          priority={idx < 4}
        />
      </div>
    </motion.div>
  );
});

export function GridGallery() {
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const update = () => setCols(window.innerWidth <= 768 ? 2 : 4);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Lock body scroll — grid fills the full viewport
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const neighboursMap = useMemo(
    () => artworks.map((_, idx) => computeNeighbours(idx, cols, artworks.length)),
    [cols]
  );

  const hoveredColor = hoveredIdx !== null ? artworks[hoveredIdx].colors[0] : null;

  const handleHoverStart = useCallback((idx: number) => setHoveredIdx(idx), []);
  const handleHoverEnd = useCallback(() => setHoveredIdx(null), []);
  const handleSelect = useCallback((id: string) => setSelectedArtworkId(id), []);
  const handleClose = useCallback(() => setSelectedArtworkId(null), []);

  const selectedArtwork = useMemo(
    () => selectedArtworkId ? artworks.find((a) => a.id === selectedArtworkId) ?? null : null,
    [selectedArtworkId]
  );

  const rows = Math.ceil(artworks.length / cols);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '2px',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {artworks.map((artwork, idx) => (
          <GalleryCell
            key={artwork.id}
            artwork={artwork}
            idx={idx}
            isHovered={hoveredIdx === idx}
            isNeighbour={hoveredIdx !== null && neighboursMap[hoveredIdx].includes(idx)}
            hoveredColor={hoveredColor}
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
            onSelect={handleSelect}
          />
        ))}
      </div>

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
            <ArtworkDetail artwork={selectedArtwork} onClose={handleClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
