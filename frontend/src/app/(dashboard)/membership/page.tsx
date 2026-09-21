'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Smartphone } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type Plan = {
  id: string;
  name: string;
  displayName: string;
  tagline?: string;
  price: number;
  originalPrice?: number;
  durationMonths: number;
  isOneTime?: boolean;
  isPopular?: boolean;
  features?: string[];
};

type UpiConfig = { configured: boolean; vpa: string; payeeName: string };

type Checkout = {
  paymentId: string;
  amount: number;
  vpa: string;
  payeeName: string;
  reference: string;
  intentUrl: string;
  plan: { displayName: string };
};

const copyText = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error('Copy failed');
  }
};

export default function MembershipPage() {
  const user = useAuthStore((s) => s.user);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [upi, setUpi] = useState<UpiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState('');
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [utr, setUtr] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [planRes, upiRes] = await Promise.all([
        api.get('/api/membership/plans'),
        api.get('/api/payment/upi-config'),
      ]);
      setPlans(planRes.data.data || []);
      setUpi(upiRes.data.data || null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not load membership');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startPay = async (planId: string) => {
    setPayingId(planId);
    try {
      const res = await api.post('/api/payment/create-upi-order', { planId });
      setCheckout(res.data.data);
      setUtr('');
      setSubmitted(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not start UPI payment');
    } finally {
      setPayingId('');
    }
  };

  const sendUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkout) return;
    try {
      await api.post('/api/payment/submit-utr', { paymentId: checkout.paymentId, utr });
      setSubmitted(true);
      toast.success('UTR sent. Waiting for confirmation.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not save UTR');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-8">
        <h3 className="text-primary font-bold tracking-widest text-sm mb-3">MEMBERSHIP</h3>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Pay with UPI</h1>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto">
          {user?.name ? `Hi ${user.name}. ` : ''}
          Cards and Razorpay are not available for this category. Transfer to the owner UPI ID,
          paste the UTR, and Hire / Find stay open while we confirm.
        </p>
      </div>

      {loading && <p className="text-center text-gray-400">Loading plans…</p>}

      {!loading && upi && !upi.configured && (
        <Card className="p-6 mb-8">
          <p className="font-semibold text-gray-900">UPI is not set yet</p>
          <p className="text-sm text-gray-600 mt-2">
            The owner must save a UPI ID in Admin → UPI. Until then the app stays free to use and
            there is no checkout.
          </p>
          <Link href="/hire" className="inline-block mt-4 text-primary font-semibold">Open Hire</Link>
        </Card>
      )}

      {checkout && (
        <Card className="p-6 mb-8 border-primary border-2">
          <p className="text-sm font-bold text-primary tracking-widest">STEP 2 · TRANSFER</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">
            Pay {formatPrice(checkout.amount)} for {checkout.plan.displayName}
          </h2>
          <dl className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-gray-50 p-3">
              <dt className="text-gray-500">UPI ID</dt>
              <dd className="font-mono font-semibold break-all">{checkout.vpa}</dd>
              <button type="button" className="text-primary text-xs font-semibold mt-1" onClick={() => copyText(checkout.vpa, 'UPI ID')}>
                Copy
              </button>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <dt className="text-gray-500">Payee</dt>
              <dd className="font-semibold">{checkout.payeeName}</dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <dt className="text-gray-500">Amount</dt>
              <dd className="font-semibold">{formatPrice(checkout.amount)}</dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <dt className="text-gray-500">Payment note</dt>
              <dd className="font-mono font-semibold">{checkout.reference}</dd>
              <button type="button" className="text-primary text-xs font-semibold mt-1" onClick={() => copyText(checkout.reference, 'Note')}>
                Copy
              </button>
            </div>
          </dl>
          <a
            href={checkout.intentUrl}
            className="mt-4 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-to-r from-[#F04438] to-[#F97380] text-white font-bold"
          >
            <Smartphone size={18} /> Open UPI app
          </a>
          <p className="text-xs text-gray-500 mt-2">On desktop, copy the UPI ID and pay from PhonePe, GPay, or Paytm. Put the note in the remark.</p>

          {submitted ? (
            <p className="mt-6 text-sm text-green-700 font-medium">
              UTR received. The owner will confirm the transfer on Admin → Payments. You can keep using Hire and Find.
            </p>
          ) : (
            <form onSubmit={sendUtr} className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="UTR / UPI reference number"
                className="flex-1 h-12 rounded-xl border border-gray-200 px-4"
                autoComplete="off"
              />
              <Button type="submit" size="lg">I have paid</Button>
            </form>
          )}
          <button type="button" className="mt-4 text-sm text-gray-500" onClick={() => setCheckout(null)}>Choose a different plan</button>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`p-6 ${plan.isPopular ? 'border-primary border-2' : ''}`}>
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-xl font-extrabold text-gray-900">{plan.displayName}</h2>
              {plan.isPopular ? <span className="text-xs font-bold text-primary">POPULAR</span> : null}
            </div>
            <p className="text-sm text-gray-500 mt-1">{plan.tagline}</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-3">{formatPrice(plan.price)}</p>
            <p className="text-sm text-gray-500 mb-4">
              {plan.isOneTime || plan.durationMonths === 0 ? 'Pay once' : `${plan.durationMonths} months`}
              {plan.originalPrice && plan.originalPrice > plan.price ? ` · was ${formatPrice(plan.originalPrice)}` : ''}
            </p>
            <ul className="space-y-2 mb-6">
              {(plan.features || []).map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full rounded-full"
              size="lg"
              disabled={!upi?.configured}
              isLoading={payingId === plan.id}
              onClick={() => startPay(plan.id)}
            >
              Pay {formatPrice(plan.price)} with UPI
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
