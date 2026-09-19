import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/find');

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
