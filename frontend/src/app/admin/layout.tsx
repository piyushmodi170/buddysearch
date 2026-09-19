'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Users, LayoutDashboard, ShieldCheck, List, IndianRupee, Star, Tag, Loader2, ArrowLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/useAuthStore';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/verifications', label: 'Verifications', icon: ShieldCheck },
  { href: '/admin/requests', label: 'Requests', icon: List },
  { href: '/admin/payments', label: 'Payments', icon: IndianRupee },
  { href: '/admin/plans', label: 'Plans', icon: Tag },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // The store is persisted to localStorage, so on the very first client render
  // it is still empty. Wait for hydration before deciding to redirect.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && (!isAuthenticated || !user?.isAdmin)) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3 px-6 text-center">
        <ShieldCheck className="text-gray-300" size={48} />
        <h1 className="text-xl font-bold text-gray-900">Admin access required</h1>
        <p className="text-sm text-gray-500">Sign in with an administrator account to continue.</p>
        <Link href="/login" className="text-primary font-semibold text-sm mt-2">Go to login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gray-900 text-white flex-col hidden md:flex fixed h-full">
        <div className="h-16 flex items-center px-6 bg-gray-950 font-bold text-xl shrink-0">
          Admin Panel
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white">
            <ArrowLeft size={14} /> Back to app
          </Link>
          <p className="text-xs text-gray-500 mt-3 truncate">Signed in as {user.name}</p>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-6 md:p-8">{children}</main>
    </div>
  );
}
