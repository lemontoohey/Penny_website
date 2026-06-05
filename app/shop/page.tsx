'use client';

import Link from 'next/link';
import { ShopArtworkCard } from '@/components/ShopArtworkCard';
import artworksData from '@/src/data/artworks.json';

interface Artwork {
  id: string;
  title: string;
  price: string;
  colors: string[];
  dimensions: string;
  medium: string;
}

export default function ShopPage() {
  return (
    <div className="w-full min-h-screen pt-32 pb-48">
      <nav className="fixed top-12 right-6 md:right-12 z-50">
        <Link
          href="/collection"
          className="text-parchment/50 hover:text-vermillion font-sans text-[10px] tracking-[0.4em] uppercase transition-colors duration-500"
        >
          [ Back to Collection ]
        </Link>
      </nav>

      <section className="flex flex-col items-center gap-y-48 w-full max-w-4xl mx-auto px-6">
        <h1 className="text-parchment font-sans text-xs tracking-[0.4em] uppercase text-center">
          Available Acquisitions
        </h1>

        {(artworksData as Artwork[]).map((artwork, idx) => (
          <ShopArtworkCard key={artwork.id} artwork={artwork} index={idx} />
        ))}
      </section>
    </div>
  );
}
