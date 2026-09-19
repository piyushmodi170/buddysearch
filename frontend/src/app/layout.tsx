import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { SocketProvider } from '../providers/SocketProvider';
import { Toaster } from '../components/ui/Toast';

export const metadata: Metadata = {
  title: 'Buddy Search - India’s #1 Social Companionship hiring Platform',
  description: 'Buddy Search connects you with real companions for activities, adventures, and everyday moments — friendship-first, always.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SocketProvider>
          {children}
          <Toaster />
        </SocketProvider>
      </body>
    </html>
  );
}
