import type { Metadata } from 'next';
import LandingClient from './LandingClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { homeJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/');

export default function HomePage() {
  return (
    <>
      <link rel="preload" as="image" href="/hero-sm.webp" type="image/webp" media="(max-width: 768px)" />
      <link rel="preload" as="image" href="/hero-lg.webp" type="image/webp" media="(min-width: 769px)" />
      <JsonLd data={homeJsonLd()} />
      <LandingClient />
    </>
  );
}
