import artworksData from '@/src/data/artworks.json';
import { ArtworkDetail } from './ArtworkDetail';

export function generateStaticParams() {
  return (artworksData as { id: string }[]).map((a) => ({ id: a.id }));
}

export default function ArtworkPage({ params }: { params: { id: string } }) {
  const artwork = artworksData.find((a) => a.id === params.id);
  if (!artwork) return null;
  return <ArtworkDetail artwork={artwork} />;
}
