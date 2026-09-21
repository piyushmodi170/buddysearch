'use client';
import React, { useEffect, useState } from 'react';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';

export default function AdminSettingsPage() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    api.get('/api/admin/settings/status').then((res) => setStatus(res.data.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <SettingsForm
        group="app"
        title="App settings"
        description="Public site URL used in emails and OAuth notes. Collect membership money from Admin → UPI."
        fields={[{ name: 'url', label: 'App / frontend URL', placeholder: 'https://buddysearch.online' }]}
      />
      {status && (
        <Card>
          <h2 className="font-bold text-gray-900 mb-3">Configuration status</h2>
          <ul className="text-sm space-y-2">
            <StatusRow
              label="UPI"
              ok={status.upi?.configured}
              extra={status.upi?.configured ? status.upi.vpa : 'save your UPI ID to collect membership'}
            />
            <StatusRow
              label="Razorpay"
              ok={false}
              extra="blocked for this category — use UPI"
            />
            <StatusRow label="SMTP" ok={status.smtp?.configured} />
            <StatusRow label="Google login" ok={status.google?.configured} />
          </ul>
        </Card>
      )}
    </div>
  );
}

function StatusRow({ label, ok, extra }: { label: string; ok: boolean; extra?: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <span className="flex items-center gap-2">
        {extra && <span className="text-xs text-gray-400">{extra}</span>}
        <Badge variant={ok ? 'success' : 'warning'}>{ok ? 'Configured' : 'Not set'}</Badge>
      </span>
    </li>
  );
}
