'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Star } from 'lucide-react';
import api from '@/lib/api';

export type LandingPlan = {
  name: string;
  tagline: string;
  price: string;
  original: string;
  off: string;
  period: string;
  periodNote: string;
  features: string[];
  accent: string;
  iconBg: string;
  cta: string;
  highlighted: boolean;
  badge: string;
};

const ACCENTS = [
  { accent: '#111111', iconBg: '#f4f4f5' },
  { accent: '#0f766e', iconBg: '#ecfdf5' },
  { accent: '#f96566', iconBg: '#fff1f2' },
  { accent: '#7c3aed', iconBg: '#f5f3ff' },
];

/** Catalog shown if the API is down. Matches backend default membership plans. */
export const FALLBACK_PLANS: LandingPlan[] = [
  {
    name: 'Basic',
    tagline: 'Get started and explore',
    price: '₹249',
    original: '₹498',
    off: '50% off',
    period: '3 months',
    periodNote: 'pay with UPI',
    features: ['Browse buddy discovery feed', 'View buddy profiles', 'Post up to 5 plans / month', 'Standard discover placement'],
    ...ACCENTS[0],
    cta: 'Pay with UPI',
    highlighted: false,
    badge: '',
  },
  {
    name: 'Standard',
    tagline: 'Great value to get started',
    price: '₹349',
    original: '₹998',
    off: '65% off',
    period: '6 months',
    periodNote: 'pay with UPI',
    features: ['Everything in Basic', 'Post up to 10 plans / month', 'View social profile links', 'Priority in discover'],
    ...ACCENTS[1],
    cta: 'Pay with UPI',
    highlighted: false,
    badge: '',
  },
  {
    name: 'Premium',
    tagline: 'For power users',
    price: '₹449',
    original: '₹1,600',
    off: '72% off',
    period: '12 months',
    periodNote: 'pay with UPI',
    features: ['Everything in Standard', 'Post up to 15 plans / month', 'Higher discover priority', 'Premium badge'],
    ...ACCENTS[2],
    cta: 'Pay with UPI',
    highlighted: true,
    badge: 'Popular',
  },
  {
    name: 'Star',
    tagline: 'Pay once, keep forever',
    price: '₹649',
    original: '₹2,040',
    off: '76% off',
    period: 'lifetime',
    periodNote: 'pay with UPI',
    features: ['Everything in Premium', 'Unlimited plans', 'Pinned in discover', 'Star badge', 'Lifetime access'],
    ...ACCENTS[3],
    cta: 'Pay with UPI',
    highlighted: false,
    badge: '',
  },
];

function formatInr(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function fromApi(raw: any, index: number): LandingPlan {
  const price = Number(raw.price) || 0;
  const original = Number(raw.originalPrice) || 0;
  const months = Number(raw.durationMonths) || 0;
  const free = price <= 0;
  const colors = ACCENTS[index % ACCENTS.length];
  const features = Array.isArray(raw.features) ? raw.features.map(String) : [];
  return {
    name: String(raw.displayName || raw.name || 'Plan'),
    tagline: String(raw.tagline || ''),
    price: formatInr(price),
    original: original > price ? formatInr(original) : '',
    off: raw.discount ? `${raw.discount}% off` : '',
    period: raw.isOneTime || months <= 0 ? 'lifetime' : `${months} months`,
    periodNote: free ? 'test · no UPI' : 'pay with UPI',
    features: features.length ? features : FALLBACK_PLANS[index]?.features || [],
    accent: colors.accent,
    iconBg: colors.iconBg,
    cta: free ? 'Activate free' : 'Pay with UPI',
    highlighted: Boolean(raw.isPopular) || index === 2,
    badge: raw.isPopular ? 'Popular' : '',
  };
}

function PlanCard({ plan }: { plan: LandingPlan }) {
  return (
    <div
      className={`pricing__card${plan.highlighted ? ' pricing__card--highlighted' : ''}`}
      style={{ '--accent': plan.accent, '--icon-bg': plan.iconBg } as React.CSSProperties}
    >
      {plan.badge ? <div className="pricing__badge">{plan.badge}</div> : null}
      <div className="pricing__icon"><Star size={22} /></div>
      <div className="pricing__plan-header">
        <div className="pricing__plan-name">{plan.name}</div>
        <div className="pricing__tagline">{plan.tagline}</div>
      </div>
      <div className="pricing__price-row">
        <span className="pricing__price-amount">{plan.price}</span>
        <span className="pricing__price-original">{plan.original}</span>
        {plan.off ? <span className="pricing__discount-tag">{plan.off}</span> : null}
      </div>
      <div className="pricing__per-month">
        <span className="pricing__per-month-amount">{plan.period}</span>
        <span className="pricing__per-month-label">· {plan.periodNote}</span>
      </div>
      <ul className="pricing__features">
        {plan.features.map((f) => (
          <li key={f} className="pricing__feature">
            <span className="pricing__feature-check"><CheckCircle2 size={12} /></span>
            {f}
          </li>
        ))}
      </ul>
      <Link href="/membership" className={`pricing__cta${plan.highlighted ? ' pricing__cta--solid' : ''}`}>{plan.cta}</Link>
      <p className="pricing__taxes">Pay on Membership with UPI. Buddy hourly rates stay between you two.</p>
    </div>
  );
}

export default function PricingSection() {
  const [plans, setPlans] = useState<LandingPlan[]>(FALLBACK_PLANS);

  useEffect(() => {
    api.get('/api/membership/plans')
      .then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        if (rows.length >= 2) setPlans(rows.map(fromApi));
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <div className="pricing__header">
          <span className="section-tag">Pricing</span>
          <h2 className="section-title">Membership plans</h2>
          <p className="section-subtitle">
            Basic, Standard, Premium, and Star. Pay with UPI — cards and Razorpay are not available for this category.
          </p>
        </div>
        <div className="pricing__grid">
          {plans.map((p) => <PlanCard key={p.name} plan={p} />)}
        </div>
        <div className="pricing__carousel-wrap">
          <div className="pricing__carousel-track">
            {plans.map((p) => (
              <div className="pricing__carousel-slide" key={`m-${p.name}`}>
                <PlanCard plan={p} />
              </div>
            ))}
          </div>
        </div>
        <p className="pricing__note">
          Four paid plans. Open Membership to scan the QR or pay from GPay / PhonePe / Paytm, then paste the UTR.
        </p>
      </div>
    </section>
  );
}
