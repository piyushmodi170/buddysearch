'use client';
import React, { useState } from 'react';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminRazorpayPage() {
  const [testing, setTesting] = useState(false);

  const testLiveKeys = async () => {
    setTesting(true);
    try {
      const res = await api.post('/api/admin/settings/razorpay/test');
      toast.success(res.data.message || 'Live Razorpay keys work');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not verify live Razorpay keys');
    } finally {
      setTesting(false);
    }
  };

  return (
    <SettingsForm
      group="razorpay"
      title="Razorpay"
      description={
        <div className="space-y-2 max-w-2xl">
          <p>
            Checkout uses <strong>Live</strong> API keys when they are saved (Key ID starts with{' '}
            <span className="font-mono">rzp_live_</span>). If live keys are empty, it falls back to
            Test keys (<span className="font-mono">rzp_test_</span>) so you can still open checkout.
          </p>
          <p>
            <strong>Webhook secret is optional.</strong> Payments are confirmed with the live key
            secret. Leave webhook blank unless you add{' '}
            <span className="font-mono text-xs">https://buddysearch.online/api/payment/webhook</span>.
          </p>
        </div>
      }
      fields={[
        { name: 'liveKeyId', label: 'Live Key ID', placeholder: 'rzp_live_…' },
        { name: 'liveKeySecret', label: 'Live Key secret', type: 'password', hint: 'From Razorpay Live API keys. Masked after save.' },
        { name: 'testKeyId', label: 'Test Key ID (fallback)', placeholder: 'rzp_test_…' },
        { name: 'testKeySecret', label: 'Test Key secret (fallback)', type: 'password', hint: 'Used only when live keys are not saved.' },
        {
          name: 'webhookSecret',
          label: 'Webhook secret (optional)',
          type: 'password',
          hint: 'Not required. Leave blank.',
        },
      ]}
      extra={
        <div className="mt-8 pt-6 border-t border-gray-100 max-w-xl space-y-3">
          <h2 className="font-semibold text-gray-900">Verify live keys</h2>
          <p className="text-sm text-gray-500">
            Save first, then click. This creates a ₹1 Razorpay order with your live keys to confirm
            they work. It does not charge a customer.
          </p>
          <Button type="button" variant="outline" isLoading={testing} onClick={testLiveKeys}>
            Verify live keys
          </Button>
        </div>
      }
    />
  );
}
