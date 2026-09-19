import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '../components/ui/Toast';

export const metadata: Metadata = {
  title: 'Buddy Search - India’s #1 Social Companionship hiring Platform',
  description: 'Buddy Search connects you with real companions for activities, adventures, and everyday moments — friendship-first, always.',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
