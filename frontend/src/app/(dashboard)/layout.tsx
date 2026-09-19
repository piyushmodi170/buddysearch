'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { TopBar } from '@/components/layout/TopBar';
import { PWAPrompt } from '@/components/shared/PWAPrompt';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isMessages = pathname.startsWith('/messages');
  const isFeed = pathname.startsWith('/hire') || pathname.startsWith('/find') || pathname.startsWith('/account');

  useEffect(() => {
    setMounted(true);
    if (!useAuthStore.getState().isAuthenticated) {
      const timer = setTimeout(() => {
        if (!useAuthStore.getState().isAuthenticated) {
          router.push('/login');
        }
      }, 300);
      return () => clearTimeout(timer);
    }
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated && auth.user?.onboardingCompleted === false && !auth.user?.isAdmin) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/api/notifications', { params: { limit: 30 } })
      .then((res) => {
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
      .catch(() => setNotifications([]));
  }, [isAuthenticated, setNotifications]);

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium text-gray-600 mb-2">Redirecting to login...</p>
        <a href="/login" className="text-xs text-primary underline">Click here if not redirected automatically</a>
      </div>
    );
  }

  if (user?.onboardingCompleted === false && !user?.isAdmin) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium text-gray-600 mb-2">Finish your profile to continue...</p>
        <a href="/onboarding" className="text-xs text-primary underline">Open onboarding</a>
      </div>
    );
  }

  return (
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
          {children}
        </div>
      </main>

      <MobileNav />
      {!isMessages && <PWAPrompt />}
    </div>
  );
}
