'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, X, ShieldCheck, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { formatDate, getInitials } from '../../../lib/utils';
import { Pagination, ErrorCard, Spinner } from '../../../components/admin/AdminControls';

interface PendingUser {
  id: string; name: string; email: string; phone?: string; city?: string; state?: string;
  avatar?: string; aadhaarUrl?: string; role: string; createdAt: string;
}

export default function AdminVerificationsPage() {
  const [items, setItems] = useState<PendingUser[]>([]);
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
      const res = await api.get('/api/admin/verifications', { params: { page: String(page), limit: '10' } });
      setItems(res.data.data.data);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load verifications');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const decide = async (u: PendingUser, approve: boolean) => {
    if (!approve && !window.confirm(`Reject ${u.name}'s verification? Their document stays on file.`)) return;
    setBusyId(u.id);
    try {
      await api.put(`/api/admin/users/${u.id}/verify`, { verified: approve });
      toast.success(approve ? `${u.name} verified` : `${u.name} rejected`);
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Verifications</h1>
        <p className="text-sm text-gray-500 mt-1">{total.toLocaleString('en-IN')} awaiting review</p>
      </div>

      <ErrorCard message={error} />

      {loading ? <Spinner /> : items.length === 0 ? (
        <Card className="text-center py-16">
          <ShieldCheck className="mx-auto text-gray-300 mb-3" size={44} />
          <h2 className="font-semibold text-gray-900">Nothing to review</h2>
          <p className="text-sm text-gray-500 mt-1">Documents submitted by users will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {items.map(u => (
            <Card key={u.id} className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-1/3">
                <div className="flex items-center gap-3 mb-4">
                  {u.avatar
                    ? <img src={u.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                    : <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">{getInitials(u.name)}</div>}
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{u.name}</h3>
                    <p className="text-xs text-gray-500">{u.role}</p>
                  </div>
                </div>

                <dl className="text-sm space-y-1 mb-4">
                  <Field label="Email" value={u.email} />
                  <Field label="Phone" value={u.phone || '—'} />
                  <Field label="Location" value={[u.city, u.state].filter(Boolean).join(', ') || '—'} />
                  <Field label="Submitted" value={formatDate(u.createdAt)} />
                </dl>

                <Badge variant="warning" className="mb-4">Pending review</Badge>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" disabled={busyId === u.id} onClick={() => decide(u, true)}>
                    <Check size={16} className="mr-2" /> Approve
                  </Button>
                  <Button variant="danger" className="flex-1" disabled={busyId === u.id} onClick={() => decide(u, false)}>
                    <X size={16} className="mr-2" /> Reject
                  </Button>
                </div>
              </div>

              <div className="w-full lg:w-2/3">
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Submitted document</div>
                {u.aadhaarUrl ? (
                  <a href={u.aadhaarUrl} target="_blank" rel="noopener noreferrer" className="block border border-gray-200 rounded-lg p-2 bg-gray-50 hover:border-primary transition-colors">
                    <img src={u.aadhaarUrl} alt={`Document submitted by ${u.name}`} className="max-h-72 w-full object-contain rounded" />
                    <span className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                      <ExternalLink size={12} /> Open full size
                    </span>
                  </a>
                ) : (
                  <div className="h-48 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    No document uploaded
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-gray-500 w-20 shrink-0">{label}</dt>
      <dd className="text-gray-900 truncate">{value}</dd>
    </div>
  );
}
