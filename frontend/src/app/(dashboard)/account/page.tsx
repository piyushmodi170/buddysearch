'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  FileText,
  HelpCircle,
  List,
  LogOut,
  Star,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { getInitials, isPaidMembership } from '@/lib/utils';

function roleLabel(role?: string) {
  if (role === 'BOTH') return 'Client & Buddy';
  if (role === 'BUDDY') return 'Buddy';
  if (role === 'CLIENT') return 'Client';
  return role || 'Member';
}

export default function AccountMenuPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const paid = isPaidMembership(user);

  const community = [
    { href: '/requests', label: 'Requests', icon: List },
    { href: '/posts', label: 'Posts', icon: FileText },
  ];

  const account = [
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/membership', label: 'Membership', icon: Star, badge: paid ? 'ACTIVE' : undefined },
    { href: '/help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <div className="max-w-lg mx-auto pb-8">
      <Link
        href="/profile"
        className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5"
      >
        <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-pink-400 to-red-400 shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              getInitials(user?.name || '')
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-extrabold text-gray-900 truncate">{user?.name || 'Member'}</h1>
          <p className="text-xs font-semibold text-[#F04438] mt-0.5">{roleLabel(user?.role)}</p>
        </div>
        <ChevronRight size={18} className="text-gray-300 shrink-0" />
      </Link>

      <section className="bg-white rounded-2xl overflow-hidden mb-2">
        <h2 className="px-4 pt-4 pb-2 text-[11px] font-bold tracking-wider text-gray-400 uppercase">Community</h2>
        {community.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-gray-800">
                <span className="w-9 h-9 rounded-xl bg-rose-50 text-[#F04438] flex items-center justify-center">
                  <Icon size={18} />
                </span>
                {item.label}
              </span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          );
        })}
      </section>

      <section className="bg-white rounded-2xl overflow-hidden mb-4">
        <h2 className="px-4 pt-4 pb-2 text-[11px] font-bold tracking-wider text-gray-400 uppercase">Account</h2>
        {account.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-gray-800">
                <span className="w-9 h-9 rounded-xl bg-rose-50 text-[#F04438] flex items-center justify-center">
                  <Icon size={18} />
                </span>
                {item.label}
              </span>
              <span className="flex items-center gap-2">
                {item.badge && (
                  <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-md">
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={16} className="text-gray-300" />
              </span>
            </Link>
          );
        })}
      </section>

      <div className="h-px bg-gray-200 my-2" />

      <button
        type="button"
        onClick={() => {
          logout();
          router.push('/');
        }}
        className="w-full px-4 py-3.5 flex items-center gap-2 text-sm font-bold text-[#F04438]"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
}
