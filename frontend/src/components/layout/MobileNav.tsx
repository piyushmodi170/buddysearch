'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();

  const sideTabs = [
    { href: '/hire', label: 'Hire', icon: Home },
    { href: '/find', label: 'Find', icon: Search },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/account', label: 'Profile', icon: User },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const postActive = isActive('/posts');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden pb-safe">
      <div className="relative flex items-center justify-around h-16 px-1">
        {sideTabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full space-y-0.5',
                active ? 'text-primary' : 'text-gray-500'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </Link>
          );
        })}

        <div className="flex-1 flex justify-center">
          <Link
            href="/posts"
            aria-label="Post"
            className={cn(
              'absolute left-1/2 -translate-x-1/2 -top-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white',
              postActive ? 'bg-primary' : 'bg-[#F04438] hover:bg-[#D92D20]'
            )}
          >
            <Plus size={28} className="text-white" strokeWidth={2.5} />
          </Link>
        </div>

        {sideTabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full space-y-0.5',
                active ? 'text-primary' : 'text-gray-500'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
