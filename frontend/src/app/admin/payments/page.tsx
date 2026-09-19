'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader2, IndianRupee } from 'lucide-react';
import api from '../../../lib/api';
import { formatDate, formatPrice } from '../../../lib/utils';
import { Filter, Pagination, ErrorCard } from '../../../components/admin/AdminControls';

interface AdminPayment {
  id: string; amount: number; status: string; createdAt: string;
  razorpayOrderId?: string; razorpayPaymentId?: string;
  user?: { id: string; name: string; email: string; phone?: string };
  plan?: { id: string; name: string; displayName: string; price: number };
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  SUCCESS: 'success', PENDING: 'warning', FAILED: 'danger', REFUNDED: 'default',
};

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<AdminPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (status) params.status = status;
      const res = await api.get('/api/admin/payments', { params });
      setItems(res.data.data.data);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages || 1);
      setRevenue(res.data.data.revenue || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [status]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">{total.toLocaleString('en-IN')} records</p>
        </div>
        <Card className="flex items-center gap-3 py-3">
          <div className="p-2.5 rounded-full bg-green-50 text-green-600"><IndianRupee size={20} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Captured revenue</p>
            <p className="text-xl font-bold text-gray-900">{formatPrice(revenue)}</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Filter
          options={[['', 'All statuses'], ['SUCCESS', 'Success'], ['PENDING', 'Pending'], ['FAILED', 'Failed'], ['REFUNDED', 'Refunded']]}
          value={status}
          onChange={setStatus}
        />
      </div>

      <ErrorCard message={error} />

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={6} className="px-6 py-16 text-center"><Loader2 className="animate-spin text-gray-400 mx-auto" size={28} /></td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400">No payments recorded yet</td></tr>
              )}
              {!loading && items.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{p.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{p.user?.phone || p.user?.email || '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.plan?.displayName || p.plan?.name || '—'}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{formatPrice(p.amount)}</td>
                  <td className="px-6 py-4"><Badge variant={STATUS_VARIANT[p.status] || 'default'}>{p.status}</Badge></td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{p.razorpayPaymentId || p.razorpayOrderId || '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
