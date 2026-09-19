'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eye, MessageSquare, CheckCircle, Bell, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function NotificationsPage() {
  const { notifications, setNotifications, markAllRead, markRead } = useNotificationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/notifications', { params: { limit: 50 } });
        const rows = res.data?.data?.data || [];
        if (!cancelled) {
          setNotifications(rows.map((row: any) => ({
            id: row.id,
            type: row.type,
            title: row.title,
            body: row.body,
            createdAt: row.createdAt,
            read: row.read,
          })));
        }
      } catch {
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [setNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE':
      case 'NEW_MESSAGE':
        return <MessageSquare size={20} className="text-blue-500" />;
      case 'PROFILE_VIEW':
        return <Eye size={20} className="text-purple-500" />;
      case 'REQUEST_RESPONSE':
      case 'OFFER_RECEIVED':
        return <CheckCircle size={20} className="text-green-500" />;
      default:
        return <Bell size={20} className="text-yellow-500" />;
    }
  };

  const handleMarkAll = async () => {
    try {
      await api.put('/api/notifications/read-all');
    } catch {
      // local mark is enough if the inbox is already empty
    }
    markAllRead();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-end mb-8 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with your activities.</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary-light/20" onClick={handleMarkAll}>
          Mark all as read
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden bg-white shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex justify-center py-16 text-gray-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Bell className="mx-auto mb-3 text-gray-300" size={36} />
            <h3 className="font-bold text-gray-900 mb-1">No notifications yet</h3>
            <p className="text-sm text-gray-500">You will see messages, offers, and profile activity here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <button
                type="button"
                key={notification.id}
                onClick={() => {
                  markRead(notification.id);
                  api.put(`/api/notifications/${notification.id}/read`).catch(() => undefined);
                }}
                className={`w-full p-4 flex gap-4 text-left transition-colors hover:bg-gray-50 ${!notification.read ? 'bg-primary-light/5' : ''}`}
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
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{notification.body}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
