import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicDoc } from '@/components/seo/PublicDoc';

export const metadata: Metadata = {
  title: 'Download Buddy Search logo',
  description: 'Download the official Buddy Search logo PNG files.',
  robots: { index: true, follow: true },
};

const LINKS = [
  { href: '/download/logo', label: 'Colour logo (PNG)', name: 'BuddySearch-logo.png' },
  { href: '/download/logo-white', label: 'White logo for dark backgrounds', name: 'BuddySearch-logo-white.png' },
  { href: '/download/logo-red', label: 'Red and white logo', name: 'BuddySearch-logo-red-white.png' },
  { href: '/download/favicon', label: 'App icon / favicon', name: 'BuddySearch-favicon.png' },
  { href: '/download/sheet', label: 'Logo sheet', name: 'BuddySearch-logo-sheet.png' },
];

export default function LogoDownloadPage() {
  return (
    <PublicDoc title="Download the Buddy Search logo">
      <p className="aeo-direct text-lg font-medium">
        Click a link below. The file should save to your device instead of opening in the browser.
      </p>
      <ul className="list-disc pl-5 space-y-3">
        {LINKS.map((item) => (
          <li key={item.href}>
            <a className="text-[#F96566] font-semibold underline" href={item.href} download={item.name}>
              {item.label}
            </a>
            <span className="text-sm text-[#7a8494]"> — {item.name}</span>
          </li>
        ))}
      </ul>
      <p>
        Official site:{' '}
        <Link className="text-[#F96566] font-semibold" href="/">
          buddysearch.online
        </Link>
      </p>
    </PublicDoc>
  );
}
