import type { Metadata } from 'next';
import React from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/admin');

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
