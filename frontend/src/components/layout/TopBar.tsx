'use client';
import React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useNotificationStore } from '@/store/useNotificationStore';

export function TopBar() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 lg:hidden flex items-center justify-between px-4">
      <BrandLogo />

      <Link href="/notifications" className="relative p-2 -mr-2 text-gray-600 hover:text-gray-900">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
}
