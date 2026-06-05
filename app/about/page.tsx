'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const quoteRefs = useRef<HTMLElement[]>([]);

  // Portrait animation fires on mount — no ScrollTrigger dependency
  useGSAP(() => {
    gsap.fromTo('.portrait-img',
      { scale: 1.05, opacity: 0 },
      { scale: 1, opacity: 1, duration: 2.5, ease: 'power2.out' }
    );
  }, { scope: containerRef });

  // Artist quotes — IntersectionObserver replaces ScrollTrigger
  useEffect(() => {
    if (!containerRef.current) return;
    const quotes = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>('.artist-quote')
    );
    quoteRefs.current = quotes;

    const observers: IntersectionObserver[] = [];

    quotes.forEach((quote) => {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            gsap.fromTo(
              entry.target,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 1.8,
                ease: 'power3.out',
              }
            );
            obs.disconnect();
          });
        },
        { threshold: 0.15 }
      );
      obs.observe(quote);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-void pt-48 pb-64 px-6 md:px-12 flex flex-col items-center overflow-hidden">

      {/* Institutional Portrait */}
      <div className="relative w-full max-w-md aspect-[3/4] mb-48" style={{ boxShadow: '0 40px 80px -20px rgba(10,5,25,1)' }}>
        <div className="relative w-full h-full overflow-hidden grayscale contrast-[1.1] bg-void">
          <Image
            src="/images/00_studio_sewing_hero.jpg"
            alt="Penny Evans in her studio"
            fill
            className="portrait-img object-cover"
            priority
          />
        </div>
      </div>

      {/* Elegant Typographic Narrative */}
      <div className="flex flex-col gap-40 w-full max-w-3xl">
        {/* TODO: Replace with Penny Evans biography copy */}
        <blockquote className="artist-quote flex flex-col gap-6 text-center">
          <p className="text-parchment font-serif text-2xl sm:text-3xl md:text-4xl leading-relaxed font-light">
            &quot;In Japanese, ma describes the charged space between things. The pause between notes. The gap in a seam before it is closed. It is negative space understood not as absence, but as the element that gives everything else its meaning.&quot;
          </p>
          <span className="text-vermillion/70 font-sans text-[9px] tracking-[0.4em] uppercase">01 / Ma</span>
        </blockquote>

        <blockquote className="artist-quote flex flex-col gap-6 text-center">
          <p className="text-parchment font-serif text-2xl sm:text-3xl md:text-4xl leading-relaxed font-light">
            &quot;Life does not need death to be beautiful.&quot;
          </p>
          <span className="text-vermillion/70 font-sans text-[9px] tracking-[0.4em] uppercase">02 / Philosophy</span>
        </blockquote>
      </div>

      {/* Understated Footer Bio */}
      <div className="mt-48 flex flex-col items-center gap-12 text-center max-w-xl">
        <div className="w-px h-24 bg-parchment/10" />
        {/* TODO: Replace with Penny Evans biography copy */}
        <p className="font-sans text-parchment/40 text-xs leading-loose tracking-widest uppercase">
          Penny Evans is a painter.
        </p>
        <Link href="/collection" className="mt-8 text-parchment/60 hover:text-parchment font-sans text-[10px] tracking-[0.5em] uppercase transition-colors duration-700 py-3 flex items-center justify-center">
          [ Return to Collection ]
        </Link>
      </div>
    </div>
  );
}
