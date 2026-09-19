'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';
import { 
  Users, Search, MessageSquare, Bell, List, 
  FileText, User, Star, HelpCircle, LogOut, ShieldCheck
} from 'lucide-react';
import { cn, isPaidMembership } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useChatStore } from '@/store/useChatStore';
import { isOwnerEmail } from '@/lib/owner';

const SECTIONS = [
  {
    label: 'EXPLORE',
    items: [
      { href: '/hire', label: 'Hire', icon: Users },
      { href: '/find', label: 'Find', icon: Search },
    ]
  },
  {
    label: 'COMMUNICATION',
    items: [
      { href: '/messages', label: 'Messages', icon: MessageSquare, badge: 'messages' },
      { href: '/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
    ]
  },
  {
    label: 'COMMUNITY',
    items: [
      { href: '/requests', label: 'Requests', icon: List },
      { href: '/posts', label: 'Posts', icon: FileText },
    ]
  },
  {
    label: 'ACCOUNT',
    items: [
      { href: '/account', label: 'Profile', icon: User },
      { href: '/membership', label: 'Membership', icon: Star, badge: 'membership' },
      { href: '/help', label: 'Help', icon: HelpCircle },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const unreadNotifications = useNotificationStore((state) => state.unreadCount);
  const unreadMessages = useChatStore((state) => state.chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0));

  if (!user) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 hidden lg:flex flex-col">
      <div className="flex items-center px-6 h-16 border-b border-gray-100">
        <BrandLogo />
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-custom">
        {SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-6 px-4">
            <h3 className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.label}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    scroll={false}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary-light/50 text-primary border-l-4 border-primary" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? "text-primary" : "text-gray-400"} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge === 'messages' && unreadMessages > 0 && (
                      <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </span>
                    )}
                    {item.badge === 'notifications' && unreadNotifications > 0 && (
                      <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </span>
                    )}
                    {item.badge === 'membership' && isPaidMembership(user) && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                        ACTIVE
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        {user && isOwnerEmail(user.email) && (
          <div className="mb-6 px-4">
            <h3 className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              ADMINISTRATION
            </h3>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith('/admin')
                  ? "bg-primary-light/50 text-primary border-l-4 border-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
              )}
            >
              <ShieldCheck size={18} className={pathname.startsWith('/admin') ? "text-primary" : "text-gray-400"} />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-primary font-medium truncate">{user.role}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
