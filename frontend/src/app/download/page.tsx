import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/download');

export default function LogoDownloadPage() {
  return (
    <PublicDoc title="Download the Buddy Search logo">
      <p className="aeo-direct text-lg font-medium">
        Use the square 1:1 mark for Instagram, WhatsApp, and app icons. Use the wide wordmark for websites and headers.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 pt-2">
        <figure className="rounded-2xl bg-white border border-[#f0e0e0] p-6 text-center">
          <img
            src="/logo-1x1.png"
            alt="Buddy Search icon, square 1:1"
            width={1024}
            height={1024}
            className="mx-auto w-40 h-40 object-contain"
          />
          <figcaption className="mt-4 text-sm font-semibold">1:1 icon · 1024×1024 PNG</figcaption>
          <a
            href="/download/logo-1x1"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[#F96566] text-white font-semibold px-5 py-2.5 text-sm"
          >
            Download 1:1 logo
          </a>
        </figure>

        <figure className="rounded-2xl bg-white border border-[#f0e0e0] p-6 text-center">
          <img
            src="/logo.png"
            alt="Buddy Search wordmark"
            width={1743}
            height={319}
            className="mx-auto h-16 w-auto object-contain"
          />
          <figcaption className="mt-4 text-sm font-semibold">Wide wordmark PNG</figcaption>
          <a
            href="/download/logo"
            className="mt-4 inline-flex items-center justify-center rounded-full border-2 border-[#F96566] text-[#F96566] font-semibold px-5 py-2.5 text-sm"
          >
            Download wordmark
          </a>
        </figure>
      </div>

      <p className="text-sm pt-4">
        Need the full name on a square canvas?{' '}
        <a href="/download/logo-wordmark-1x1" className="text-[#F96566] font-semibold underline">
          Download wordmark 1:1
        </a>
        . Go back <Link href="/" className="text-[#F96566] font-semibold">home</Link>.
      </p>
    </PublicDoc>
  );
}
