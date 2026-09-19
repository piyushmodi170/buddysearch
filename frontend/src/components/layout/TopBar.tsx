'use client';
import React from 'react';
import Link from 'next/link';
import { Menu, Bell, Users } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useNotificationStore } from '@/store/useNotificationStore';

export function TopBar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 lg:hidden flex items-center justify-between px-4">
      <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
        <Menu size={24} />
      </button>

      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
          <Users size={18} />
        </div>
        <span className="font-bold text-lg text-gray-900">BuddySearch</span>
      </Link>

      <Link href="/notifications" className="relative p-2 -mr-2 text-gray-600 hover:text-gray-900">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
}
