'use client';
import { SettingsForm } from '@/components/admin/SettingsForm';

export default function AdminRazorpayPage() {
  return (
    <SettingsForm
      group="razorpay"
      title="Razorpay"
      description="Keys are stored on the server. Secrets are masked when loaded. Leave a masked secret unchanged to keep the current value."
      fields={[
        { name: 'keyId', label: 'Key ID', placeholder: 'rzp_live_…' },
        { name: 'keySecret', label: 'Key secret', type: 'password', hint: 'Never shown in full after save.' },
        { name: 'webhookSecret', label: 'Webhook secret', type: 'password' },
      ]}
    />
  );
}
