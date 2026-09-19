'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Heart, Lock, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { isPaidMembership } from '@/lib/utils';
import { isOwnerEmail } from '@/lib/owner';

const OPEN_PATHS = ['/membership', '/account', '/help', '/admin'];

const MEMBER_FACES = ['/avatars/user-1.jpg', '/avatars/user-2.jpg', '/avatars/user-3.jpg', '/avatars/user-4.jpg'];

export function MembersOnlyGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const unlocked =
    isPaidMembership(user) || isOwnerEmail(user?.email) || Boolean(user?.isAdmin);
  const open = OPEN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (unlocked || open) return <>{children}</>;

  return (
    <>
      <div aria-hidden className="pointer-events-none select-none blur-[8px] brightness-[0.97] min-h-[70vh]">
        {children}
      </div>
      <div className="fixed inset-0 top-16 bottom-16 lg:top-0 lg:bottom-0 lg:left-60 z-40 flex items-center justify-center bg-black/10 px-4">
        <div className="w-full max-w-[420px] bg-white rounded-[28px] shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-[#F04438] via-[#F25563] to-[#F97380] text-white text-center px-8 pt-8 pb-7">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-4">
              <Lock size={26} />
            </div>
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/90">Members only</p>
            <h2 className="mt-2 text-[26px] leading-tight font-extrabold">Your next buddy is one tap away.</h2>
            <p className="mt-2 text-sm text-white/90">
              Unlock this to see who&apos;s already interested in meeting you.
            </p>
          </div>

          <div className="px-6 pt-2 pb-6">
            {[
              { icon: MessageCircle, label: 'Hire nearby buddy, instantly' },
              { icon: Heart, label: 'Unlimited connections, every day' },
              { icon: Check, label: 'Priority for verified profiles' },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center gap-3 py-3.5 border-b border-gray-100">
                  <span className="w-10 h-10 rounded-full bg-rose-50 text-[#F04438] flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-medium text-gray-800">{row.label}</span>
                </div>
              );
            })}

            <div className="flex items-center justify-center gap-2 mt-5 mb-5">
              <div className="flex -space-x-2">
                {MEMBER_FACES.map((src) => (
                  <span key={src} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-rose-100">
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">50,000+</span> buddies are already members
              </span>
            </div>

            <Link
              href="/membership"
              className="flex items-center justify-center h-12 w-full rounded-full bg-gradient-to-r from-[#F04438] to-[#F97380] text-white text-base font-bold shadow-md"
            >
              Unlock Full Access
            </Link>
            <p className="text-center text-xs text-gray-400 mt-3">Starts at ₹249/month</p>
          </div>
        </div>
      </div>
    </>
  );
}
