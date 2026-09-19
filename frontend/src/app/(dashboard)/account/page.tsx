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
import { getInitials, isPaidMembership, planDisplayLabel } from '@/lib/utils';

function roleLabel(role?: string) {
  if (role === 'BOTH') return 'Buddy & Client';
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 text-center">
        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(user?.name || '')
          )}
        </div>
        <h1 className="text-xl font-extrabold text-gray-900">{user?.name || 'Member'}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{roleLabel(user?.role)}</p>
        <p className="text-xs font-semibold text-gray-400 mt-2 uppercase tracking-wide">
          {paid ? `${planDisplayLabel(user)} member` : 'Free account'}
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <h2 className="px-4 pt-3 pb-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase">Community</h2>
        {community.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-3.5 border-t border-gray-50 hover:bg-gray-50"
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-gray-800">
                <Icon size={18} className="text-primary" />
                {item.label}
              </span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          );
        })}
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <h2 className="px-4 pt-3 pb-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase">Account</h2>
        {account.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-3.5 border-t border-gray-50 hover:bg-gray-50"
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-gray-800">
                <Icon size={18} className="text-primary" />
                {item.label}
              </span>
              <span className="flex items-center gap-2">
                {item.badge && (
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={16} className="text-gray-300" />
              </span>
            </Link>
          );
        })}
      </section>

      <button
        type="button"
        onClick={() => {
          logout();
          router.push('/');
        }}
        className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
}
