'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Star, Shield, Heart, CheckCircle2, Lock, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { isPaidMembership, planDisplayLabel } from '@/lib/utils';
import api from '@/lib/api';
import { loadRazorpayScript, openCheckout } from '@/lib/razorpay';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  displayName: string;
  tagline: string;
  price: number;
  originalPrice: number;
  discount: number;
  durationMonths: number;
  postLimit: number;
  features: string[];
  isPopular: boolean;
  isOneTime: boolean;
}

const PLAN_ICONS: Record<string, any> = {
  BASIC: Shield,
  STANDARD: Star,
  PREMIUM: Heart,
  STAR: Zap,
};

const PLAN_COLORS: Record<string, string> = {
  BASIC: 'bg-blue-50 text-blue-500',
  STANDARD: 'bg-yellow-50 text-yellow-500',
  PREMIUM: 'bg-red-50 text-primary',
  STAR: 'bg-purple-50 text-purple-500',
};

export default function MembershipPage() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/api/membership/plans');
        setPlans(res.data.data || res.data);
      } catch {
        // Fallback static plans matching exact screenshot data
        setPlans([
          {
            id: 'basic', name: 'BASIC', displayName: 'Basic', tagline: 'Get started and explore',
            price: 249, originalPrice: 498, discount: 50, durationMonths: 3, postLimit: 5,
            isPopular: false, isOneTime: false,
            features: ['Browse buddy discovery feed', 'View buddy profiles (name, avatar, city, services)', 'Post up to 5 plan requests / month', 'Standard position in discover feed']
          },
          {
            id: 'standard', name: 'STANDARD', displayName: 'Standard', tagline: 'Great value to get started',
            price: 349, originalPrice: 998, discount: 65, durationMonths: 6, postLimit: 10,
            isPopular: false, isOneTime: false,
            features: ['Everything in Basic', 'Post up to 10 plan requests / month', 'View user social profile links', 'Priority placement in discover', '"Standard" badge on your profile']
          },
          {
            id: 'premium', name: 'PREMIUM', displayName: 'Premium', tagline: 'For power users',
            price: 449, originalPrice: 1600, discount: 72, durationMonths: 12, postLimit: 15,
            isPopular: true, isOneTime: false,
            features: ['Everything in Standard', 'Post up to 15 plan requests / month', 'Higher priority in discover (above Standard)', '"Premium" badge on your profile']
          },
          {
            id: 'star', name: 'STAR', displayName: 'Star Member', tagline: 'Top tier. Pay once, keep forever.',
            price: 649, originalPrice: 2040, discount: 76, durationMonths: 0, postLimit: -1,
            isPopular: false, isOneTime: true,
            features: ['Everything in Premium', 'Unlimited plan requests', 'Pinned to top of discover', 'Star badge on profile card', 'Featured in "Top Buddies" section', 'Lifetime access — pay once']
          },
        ]);
      } finally {
        setFetching(false);
      }
    };
    fetchPlans();
  }, []);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await api.post('/api/payment/create-order', { planId });
      const order = res.data;

      const ok = await loadRazorpayScript();
      if (!ok) {
        toast.error('Failed to load payment gateway');
        return;
      }

      const options = {
        key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'BuddySearch',
        description: 'Membership Upgrade',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await api.post('/api/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Membership upgraded successfully!');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          contact: user?.phone || '',
        },
        theme: { color: '#E53E3E' },
      };

      openCheckout(options);
    } catch {
      toast.error('Failed to create payment order');
    } finally {
      setLoading(null);
    }
  };

  const currentPlan = isPaidMembership(user) ? (user?.membershipPlan || 'BASIC') : 'BASIC';
  const paid = isPaidMembership(user);
  const expiryDate = paid && user?.membershipExpiry
    ? new Date(user.membershipExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  if (fetching) {
    return (
      <div className="max-w-6xl mx-auto py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4" />
        <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-96 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h3 className="text-primary font-bold tracking-widest text-sm mb-3">UPGRADE YOUR EXPERIENCE</h3>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-gray-500 font-medium">
          Current plan:{' '}
          <span className="text-gray-900 font-bold">{paid ? planDisplayLabel(user) : 'Free'}</span>
          {expiryDate ? ` · Expires ${expiryDate}` : paid ? '' : ' · No paid membership'}
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan.name] || Shield;
          const isCurrent = plan.name === currentPlan && (plan.name !== 'BASIC' || Boolean(user?.membershipExpiry));
          const colorClass = PLAN_COLORS[plan.name] || 'bg-gray-50 text-gray-500';

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-6 ${
                plan.isPopular ? 'border-primary border-2 shadow-xl' : 'border-gray-200'
              } ${isCurrent ? 'border-primary/30' : ''}`}
            >
              {/* Most Popular badge */}
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current Plan badge */}
              {isCurrent && (
                <div className="absolute top-4 right-4">
                  <span className="bg-red-50 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Current Plan
                  </span>
                </div>
              )}

              {/* Icon + Name */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}>
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{plan.displayName}</h3>
              <p className="text-sm text-gray-500 mb-4">{plan.tagline}</p>

              {/* Pricing */}
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-extrabold text-gray-900">₹{plan.price}</span>
                <span className="text-sm text-gray-400 line-through pb-1">₹{plan.originalPrice}</span>
                <Badge variant="success" className="mb-1 text-[10px]">{plan.discount}% OFF</Badge>
              </div>
              <p className={`text-sm font-medium mb-6 ${plan.isOneTime ? 'text-primary font-bold uppercase' : 'text-gray-500'}`}>
                {plan.isOneTime ? 'ONE-TIME PAYMENT' : `${plan.durationMonths} months access`}
              </p>

              {/* Features */}
              <div className="flex-1 space-y-3 mb-6">
                {(plan.features as string[]).map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 leading-snug">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              {isCurrent ? (
                <div className="text-center text-sm font-medium text-primary">
                  {plan.name === 'BASIC' && !paid ? 'Your free plan' : '✓ Active Plan'}
                </div>
              ) : (
                <Button
                  variant={plan.isPopular ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => handleUpgrade(plan.id)}
                  isLoading={loading === plan.id}
                >
                  Get {plan.displayName}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-400">
        <Lock size={14} />
        <span>Secure payments via Razorpay · All prices inclusive of taxes</span>
      </div>
    </div>
  );
}
