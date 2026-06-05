import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import { Providers } from '@/components/Providers';

// Dynamically import heavy/browser-only aesthetic components so they don't block initial SSR HTML
const CanvasBackground = dynamic(() => import('@/components/CanvasBackground').then(mod => mod.CanvasBackground), { ssr: false });
const CinematicLoader = dynamic(() => import('@/components/CinematicLoader').then(mod => mod.CinematicLoader), { ssr: false });
const PageTransition = dynamic(() => import('@/components/PageTransition').then(mod => mod.PageTransition), { ssr: false });

// Typography Tokens
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500'],
});

export const metadata: Metadata = {
  title: 'Penny Evans — Paintings',
  description: 'An immersive, cinematic gallery experience for painter Penny Evans.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
  themeColor: '#3D0916',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-void text-parchment font-sans antialiased overflow-x-hidden selection:bg-vermillion selection:text-void min-h-screen min-h-[100dvh]">
        
        {/* Cinematic Initial Load Experience */}
        <CinematicLoader />

        {/* Global WebGL Shader Layer - Fixed behind main content */}
        <CanvasBackground />

        {/* Sensory Interaction Layers */}
        <PageTransition />

        {/* Client-side Providers wrapper (Lenis Smooth Scroll, Zustand Init, GSAP Registry) */}
        <Providers>
          {/* Main content layer, rendered over WebGL background */}
          <main className="relative z-10 w-full min-h-screen touch-pan-y">
            {children}
          </main>
        </Providers>

      </body>
    </html>
  );
}

