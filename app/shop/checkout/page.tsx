'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const itemId = searchParams.get('item') ?? '';

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center gap-12">
      <h1 className="text-parchment font-serif text-2xl md:text-4xl tracking-wide">
        Inquire for Acquisition
      </h1>
      <p className="text-parchment/70 font-sans text-sm">
        {itemId ? `Item: ${itemId}` : 'No item selected.'}
      </p>
      <Link
        href="/shop"
        className="text-parchment/50 hover:text-vermillion font-sans text-xs tracking-[0.4em] uppercase transition-colors duration-500"
      >
        [ Return to Shop ]
      </Link>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 flex justify-center text-parchment/50">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
