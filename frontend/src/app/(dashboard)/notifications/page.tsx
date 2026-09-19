'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eye, MessageSquare, CheckCircle, Bell, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'MESSAGE', title: 'New Message', body: 'Priya Sharma sent you a message.', time: new Date(Date.now() - 1000 * 60 * 5), read: false },
  { id: 2, type: 'PROFILE_VIEW', title: 'Profile View', body: 'Someone from Delhi viewed your profile.', time: new Date(Date.now() - 1000 * 60 * 60 * 2), read: false },
  { id: 3, type: 'REQUEST_RESPONSE', title: 'Offer Received', body: 'Rahul Verma sent an offer for your request.', time: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true },
  { id: 4, type: 'SYSTEM', title: 'Welcome to BuddySearch!', body: 'Complete your profile to get 10x more visibility.', time: new Date(Date.now() - 1000 * 60 * 60 * 48), read: true },
];

export default function NotificationsPage() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE': return <MessageSquare size={20} className="text-blue-500" />;
      case 'PROFILE_VIEW': return <Eye size={20} className="text-purple-500" />;
      case 'REQUEST_RESPONSE': return <CheckCircle size={20} className="text-green-500" />;
      default: return <Bell size={20} className="text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with your activities.</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary-light/20">
          Mark all as read
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden bg-white shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-100">
          {MOCK_NOTIFICATIONS.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 flex gap-4 transition-colors hover:bg-gray-50 ${!notification.read ? 'bg-primary-light/5' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${!notification.read ? 'bg-white' : 'bg-gray-100'}`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {formatDistanceToNow(notification.time, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{notification.body}</p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
