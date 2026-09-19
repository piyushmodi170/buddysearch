'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { TopBar } from '@/components/layout/TopBar';
import { PWAPrompt } from '@/components/shared/PWAPrompt';
import { SocketProvider } from '@/providers/SocketProvider';
import { MembersOnlyGate } from '@/components/shared/MembersOnlyGate';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { cn, isPaidMembership, needsEmailVerification, postAuthPath } from '@/lib/utils';
import { isOwnerEmail } from '@/lib/owner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const needsOnboarding = useAuthStore(
    (s) => s.user?.onboardingCompleted === false && !s.user?.isAdmin
  );
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(() =>
    typeof window === 'undefined' ? false : useAuthStore.persist.hasHydrated()
  );
  const isMessages = pathname.startsWith('/messages');
  const isFeed = pathname.startsWith('/hire') || pathname.startsWith('/find') || pathname.startsWith('/account') || pathname.startsWith('/profile');
  const memberAccess = isPaidMembership(user) || isOwnerEmail(user?.email);

  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useAuthStore.persist.onFinishHydration(finish);
    if (useAuthStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (needsEmailVerification(user)) {
      router.replace(postAuthPath(user));
      return;
    }
    if (needsOnboarding) {
      router.replace('/onboarding');
    }
  }, [hydrated, isAuthenticated, needsOnboarding, user, router]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    let cancelled = false;
    api.get('/api/notifications', { params: { limit: 30 } })
      .then((res) => {
        if (cancelled) return;
        const rows = res.data?.data?.data || [];
        setNotifications(rows.map((row: any) => ({
          id: row.id,
          type: row.type,
          title: row.title,
          body: row.body,
          createdAt: row.createdAt,
          read: row.read,
        })));
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      });
    return () => { cancelled = true; };
  }, [hydrated, isAuthenticated, setNotifications]);

  if (!hydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || needsEmailVerification(user) || needsOnboarding) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium text-gray-600 mb-2">
          {needsEmailVerification(user)
            ? 'Verify your email to continue...'
            : needsOnboarding
              ? 'Finish your profile to continue...'
              : 'Redirecting to login...'}
        </p>
      </div>
    );
  }

  return (
    <SocketProvider>
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />

      <main
        className={cn(
          'lg:pl-60 pt-16 lg:pt-0 min-h-screen',
          isMessages ? 'h-[100dvh] pb-16 lg:pb-0 overflow-hidden' : 'pb-20 lg:pb-0'
        )}
      >
        <div
          className={cn(
            isMessages
              ? 'h-full p-0 max-w-none'
              : isFeed
                ? 'max-w-7xl mx-auto px-3 pt-3 pb-4 sm:p-6 lg:p-8'
                : 'max-w-7xl mx-auto p-4 sm:p-6 lg:p-8'
          )}
        >
          <MembersOnlyGate>{children}</MembersOnlyGate>
        </div>
      </main>

      <MobileNav />
      {!isMessages && memberAccess && <PWAPrompt />}
    </div>
    </SocketProvider>
  );
}
