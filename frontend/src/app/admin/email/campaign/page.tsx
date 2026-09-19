'use client';
import { Suspense } from 'react';
import AdminCampaignPage from './CampaignClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-400">Loading campaign…</div>}>
      <AdminCampaignPage />
    </Suspense>
  );
}
