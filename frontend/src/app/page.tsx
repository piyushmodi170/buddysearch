import type { Metadata } from 'next';
import LandingClient from './LandingClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { homeJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/');

export default function HomePage() {
  return (
    <>
      <link rel="preload" as="image" href="/activities-on-buddy-search.webp" type="image/webp" />
      <JsonLd data={homeJsonLd()} />
      <LandingClient />
    </>
  );
}
