import type { Metadata, Viewport } from 'next';
import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '../components/ui/Toast';
import { JsonLd } from '@/components/seo/JsonLd';
import { PAGE_SEO, SITE, organizationJsonLd, pageMetadata, websiteJsonLd } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const root = pageMetadata('/');

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: PAGE_SEO['/'].title,
    template: '%s | Buddy Search',
  },
  description: root.description,
  keywords: SITE.keywords,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: 'lifestyle',
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: root.openGraph,
  twitter: root.twitter,
  alternates: { canonical: SITE.url },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F96566',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={SITE.language} className={inter.variable}>
      <body className={`${inter.className} font-sans antialiased`}>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
