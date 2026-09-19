import type { Metadata } from 'next';
import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/dashboard');

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
