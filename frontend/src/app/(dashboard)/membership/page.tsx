'use client';
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const FEATURES = [
  'Browse buddy discovery feed',
  'View buddy profiles',
  'Post activity plans',
  'In-app chat to agree the meet',
  'Hire a Buddy or become one',
];

export default function MembershipPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="text-center mb-8">
        <h3 className="text-primary font-bold tracking-widest text-sm mb-3">MEMBERSHIP</h3>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Buddy Search is free</h1>
        <p className="text-gray-500 font-medium">
          {user?.name ? `Hi ${user.name}. ` : ''}Hire, Find, chats, and posts are unlocked. There is no platform fee and no card checkout.
        </p>
      </div>

      <Card className="p-6 border-primary border-2">
        <p className="text-4xl font-extrabold text-gray-900">₹0</p>
        <p className="text-sm text-gray-500 mb-6">Forever · no Razorpay · no credit card</p>
        <ul className="space-y-3 mb-6">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-600">
          If you hire a Buddy, any hourly fee is agreed in chat and paid between you two (usually UPI). Buddy Search does not take that money.
        </p>
        <Link
          href="/hire"
          className="mt-6 flex items-center justify-center h-12 w-full rounded-full bg-gradient-to-r from-[#F04438] to-[#F97380] text-white text-base font-bold"
        >
          Open Hire
        </Link>
      </Card>
    </div>
  );
}
