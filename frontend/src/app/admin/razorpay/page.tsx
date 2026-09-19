'use client';
import React, { useState } from 'react';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminRazorpayPage() {
  const [testing, setTesting] = useState(false);

  const testKeys = async () => {
    setTesting(true);
    try {
      const res = await api.post('/api/admin/settings/razorpay/test');
      toast.success(res.data.message || 'Razorpay keys work');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not verify Razorpay keys');
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
            Use <strong>Test</strong> keys from Razorpay Dashboard → Account & Settings → API Keys
            (Test mode) to try checkout with Razorpay’s test cards. Switch to <strong>Live</strong>
            only when you are ready to take real payments. Save before “Test keys”.
          </p>
          <p>
            <strong>Webhook secret is optional.</strong> Membership is confirmed from the checkout
            signature using the key secret. Add a webhook only if you want Razorpay server events
            at <span className="font-mono text-xs">https://buddysearch.online/api/payment/webhook</span>.
          </p>
        </div>
      }
      fields={[
        {
          name: 'mode',
          label: 'Checkout mode',
          type: 'select',
          options: [
            { value: 'test', label: 'Test — rzp_test_… (safe to try payments)' },
            { value: 'live', label: 'Live — rzp_live_… (real money)' },
          ],
          hint: 'The site uses only the keys for this mode.',
        },
        { name: 'testKeyId', label: 'Test Key ID', placeholder: 'rzp_test_…' },
        { name: 'testKeySecret', label: 'Test Key secret', type: 'password', hint: 'From Razorpay Test mode API keys. Masked after save.' },
        { name: 'liveKeyId', label: 'Live Key ID', placeholder: 'rzp_live_…' },
        { name: 'liveKeySecret', label: 'Live Key secret', type: 'password', hint: 'From Razorpay Live mode API keys. Masked after save.' },
        {
          name: 'webhookSecret',
          label: 'Webhook secret (optional)',
          type: 'password',
          hint: 'Not required. Leave blank. Checkout still verifies payments with the key secret.',
        },
      ]}
      extra={
        <div className="mt-8 pt-6 border-t border-gray-100 max-w-xl space-y-3">
          <h2 className="font-semibold text-gray-900">Test and verify</h2>
          <p className="text-sm text-gray-500">
            Saves are not automatic. Click Save first, then this button. It creates a ₹1 Razorpay
            order with the current mode keys (no customer charge) to confirm the credentials work.
          </p>
          <Button type="button" variant="outline" isLoading={testing} onClick={testKeys}>
            Test keys
          </Button>
        </div>
      }
    />
  );
}
