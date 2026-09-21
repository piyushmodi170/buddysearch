'use client';
import { SettingsForm } from '@/components/admin/SettingsForm';

export default function AdminUpiPage() {
  return (
    <SettingsForm
      group="upi"
      title="UPI (working checkout)"
      description={
        <div className="space-y-2 max-w-2xl">
          <p>
            Razorpay keeps rejecting Buddy Search because companion hiring sits in categories they
            do not support (friend finders, match-making, hiring / professional networking). Do not
            resubmit as ecommerce or education — that will not pass KYC.
          </p>
          <p>
            Checkout that actually runs: save <strong>your personal UPI ID</strong> here. Members
            pay that VPA from PhonePe / GPay / Paytm, paste the UTR, then you confirm it on{' '}
            <strong>Admin → Payments</strong>. Hire and Find stay usable until you confirm.
          </p>
        </div>
      }
      fields={[
        {
          name: 'vpa',
          label: 'UPI ID (VPA)',
          placeholder: 'yourname@okaxis',
          hint: 'The ID that appears in your UPI app. Money lands in this account.',
        },
        {
          name: 'payeeName',
          label: 'Payee name',
          placeholder: 'Buddy Search',
          hint: 'Shown in the UPI intent. Use your legal name or Buddy Search.',
        },
      ]}
    />
  );
}
