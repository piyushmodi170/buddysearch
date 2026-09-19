'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, Trash2, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { formatDate, formatPrice, getInitials } from '../../../lib/utils';
import { useDebounce } from '../../../hooks/useDebounce';
import { Filter, Pagination, ErrorCard } from '../../../components/admin/AdminControls';

interface AdminRequest {
  id: string; title: string; description?: string; category: string; type: string;
  budget?: number; location?: string; status: string; createdAt: string;
  user: { id: string; name: string; avatar?: string; phone?: string };
  _count: { offers: number };
}

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'danger'> = {
  OPEN: 'success', CLOSED: 'default', EXPIRED: 'danger',
};

export default function AdminRequestsPage() {
  const [items, setItems] = useState<AdminRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (debouncedSearch) params.search = debouncedSearch;
      if (status) params.status = status;
      const res = await api.get('/api/admin/requests', { params });
      setItems(res.data.data.data);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const remove = async (r: AdminRequest) => {
    if (!window.confirm(`Delete "${r.title}"? This also removes its ${r._count.offers} offer(s).`)) return;
    setBusyId(r.id);
    try {
      await api.delete(`/api/admin/requests/${r.id}`);
      toast.success('Request deleted');
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
          <p className="text-sm text-gray-500 mt-1">{total.toLocaleString('en-IN')} total</p>
        </div>
        <div className="w-full sm:w-72">
          <Input icon={<Search size={18} />} placeholder="Search title or description..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Filter options={[['', 'All statuses'], ['OPEN', 'Open'], ['CLOSED', 'Closed'], ['EXPIRED', 'Expired']]} value={status} onChange={setStatus} />
      </div>

      <ErrorCard message={error} />

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Request</th>
                <th className="px-6 py-4 font-medium">Posted by</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Budget</th>
                <th className="px-6 py-4 font-medium">Offers</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={7} className="px-6 py-16 text-center"><Loader2 className="animate-spin text-gray-400 mx-auto" size={28} /></td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-gray-400">No requests match these filters</td></tr>
              )}
              {!loading && items.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 align-top">
                  <td className="px-6 py-4 max-w-xs">
                    <div className="font-medium text-gray-900 truncate">{r.title}</div>
                    {r.description && <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{r.description}</div>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {r.location && <span className="flex items-center gap-1"><MapPin size={11} />{r.location}</span>}
                      <span>{formatDate(r.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {r.user?.avatar
                        ? <img src={r.user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        : <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">{getInitials(r.user?.name || '?')}</div>}
                      <span className="text-gray-700">{r.user?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{r.category}</td>
                  <td className="px-6 py-4 text-gray-600">{r.budget ? formatPrice(r.budget) : '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{r._count?.offers ?? 0}</td>
                  <td className="px-6 py-4"><Badge variant={STATUS_VARIANT[r.status] || 'default'}>{r.status}</Badge></td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" disabled={busyId === r.id} onClick={() => remove(r)} aria-label={`Delete ${r.title}`}>
                      <Trash2 size={14} className="text-red-600" />
                    </Button>
                  </td>
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
