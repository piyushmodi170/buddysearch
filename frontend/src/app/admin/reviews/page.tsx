'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Star, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { formatDate, getInitials } from '../../../lib/utils';
import { Pagination, ErrorCard } from '../../../components/admin/AdminControls';

interface AdminReview {
  id: string; rating: number; comment?: string; createdAt: string;
  reviewer?: { id: string; name: string; avatar?: string };
  reviewee?: { id: string; name: string; avatar?: string };
}

export default function AdminReviewsPage() {
  const [items, setItems] = useState<AdminReview[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/reviews', { params: { page: String(page), limit: '20' } });
      setItems(res.data.data.data);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const remove = async (r: AdminReview) => {
    if (!window.confirm('Delete this review permanently?')) return;
    setBusyId(r.id);
    try {
      await api.delete(`/api/admin/reviews/${r.id}`);
      toast.success('Review deleted');
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">{total.toLocaleString('en-IN')} submitted</p>
      </div>

      <ErrorCard message={error} />

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : items.length === 0 ? (
        <Card className="text-center py-16">
          <Star className="mx-auto text-gray-300 mb-3" size={44} />
          <h2 className="font-semibold text-gray-900">No reviews yet</h2>
          <p className="text-sm text-gray-500 mt-1">Reviews left between users will appear here for moderation.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map(r => (
            <Card key={r.id} className="flex items-start gap-4">
              {r.reviewer?.avatar
                ? <img src={r.reviewer.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">{getInitials(r.reviewer?.name || '?')}</div>}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-gray-900">{r.reviewer?.name || 'Unknown'}</span>
                  <span className="text-gray-400 text-sm">reviewed</span>
                  <span className="font-semibold text-gray-900">{r.reviewee?.name || 'Unknown'}</span>
                  <span className="flex items-center gap-0.5 ml-1" aria-label={`${r.rating} out of 5`}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={13} className={i <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                    ))}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-gray-600 mt-1.5">{r.comment}</p>}
                <p className="text-xs text-gray-400 mt-1.5">{formatDate(r.createdAt)}</p>
              </div>

              <Button variant="ghost" size="sm" disabled={busyId === r.id} onClick={() => remove(r)} aria-label="Delete review">
                <Trash2 size={14} className="text-red-600" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
