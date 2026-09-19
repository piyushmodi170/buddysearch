'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Users, Activity, ShieldCheck, IndianRupee, MessageSquare, List, Ban, UserCheck, Loader2, AlertCircle
} from 'lucide-react';
import api from '../../lib/api';
import { formatPrice, formatDate } from '../../lib/utils';

interface Stats {
  users: { total: number; verified: number; banned: number; pendingVerifications: number; newToday: number; onlineNow: number };
  roles: { clients: number; buddies: number; both: number };
  activity: { totalRequests: number; openRequests: number; totalOffers: number; totalChats: number; totalMessages: number; totalReviews: number };
  revenue: { total: number; thisMonth: number; successfulPayments: number; pendingPayments: number };
  recentSignups: any[];
  plans?: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(res => setStats(res.data.data))
      .catch(err => setError(err.response?.data?.message || err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  if (error) {
    return (
      <Card className="flex items-start gap-3 border-red-200 bg-red-50">
        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h2 className="font-semibold text-red-900">Could not load dashboard</h2>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  const TILES = [
    { label: 'Total Users', value: stats.users.total.toLocaleString('en-IN'), sub: `${stats.users.newToday} new today`, icon: Users, color: 'text-blue-500' },
    { label: 'Online Now', value: stats.users.onlineNow.toLocaleString('en-IN'), sub: `${stats.users.verified} verified`, icon: Activity, color: 'text-green-500' },
    { label: 'Pending Verifications', value: stats.users.pendingVerifications.toLocaleString('en-IN'), sub: `${stats.users.banned} banned`, icon: ShieldCheck, color: 'text-yellow-500' },
    { label: 'Revenue (all time)', value: formatPrice(stats.revenue.total), sub: `${formatPrice(stats.revenue.thisMonth)} this month`, icon: IndianRupee, color: 'text-purple-500' },
  ];

  const ACTIVITY = [
    { label: 'Requests', value: stats.activity.totalRequests, sub: `${stats.activity.openRequests} open`, icon: List },
    { label: 'Offers', value: stats.activity.totalOffers, sub: 'sent by buddies', icon: UserCheck },
    { label: 'Chats', value: stats.activity.totalChats, sub: `${stats.activity.totalMessages} messages`, icon: MessageSquare },
    { label: 'Reviews', value: stats.activity.totalReviews, sub: 'submitted', icon: ShieldCheck },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {TILES.map((t, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className={`p-4 rounded-full bg-gray-50 ${t.color}`}><t.icon size={26} /></div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">{t.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 truncate">{t.value}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{t.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Platform activity</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-4">
                <a.icon size={18} className="text-gray-400 mb-2" />
                <div className="text-xl font-bold text-gray-900">{a.value.toLocaleString('en-IN')}</div>
                <div className="text-xs font-medium text-gray-600">{a.label}</div>
                <div className="text-xs text-gray-400">{a.sub}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold mb-4 text-gray-900">Membership mix</h2>
          <div className="space-y-3 text-sm">
            <Row label="Clients" value={stats.roles.clients} total={stats.users.total} />
            <Row label="Buddies" value={stats.roles.buddies} total={stats.users.total} />
            <Row label="Both" value={stats.roles.both} total={stats.users.total} />
            {['BASIC', 'STANDARD', 'PREMIUM', 'STAR'].map((plan) => (
              <Row key={plan} label={plan} value={stats.plans?.[plan] || 0} total={stats.users.total} />
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Successful payments</span><span className="font-semibold">{stats.revenue.successfulPayments}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Pending payments</span><span className="font-semibold">{stats.revenue.pendingPayments}</span></div>
          </div>
        </Card>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Recent signups</h2>
          <Link href="/admin/users" className="text-sm font-semibold text-primary">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">City</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentSignups.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No signups yet</td></tr>
              )}
              {stats.recentSignups.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-3 text-gray-600">{u.role}</td>
                  <td className="px-6 py-3 text-gray-600">{u.city || '—'}</td>
                  <td className="px-6 py-3">
                    {u.banned
                      ? <Badge variant="danger"><Ban size={11} className="mr-1" />Banned</Badge>
                      : u.verified
                        ? <Badge variant="success">Verified</Badge>
                        : <Badge variant="warning">Pending</Badge>}
                  </td>
                  <td className="px-6 py-3 text-gray-500">{formatDate(u.createdAt, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
