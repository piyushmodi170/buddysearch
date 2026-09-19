'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Save, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';
import { ErrorCard, Spinner } from '../../../components/admin/AdminControls';

interface Plan {
  id: string; name: string; displayName: string; tagline: string;
  price: number; originalPrice: number; discount: number;
  durationMonths: number; postLimit: number; features: string[] | unknown;
  isPopular: boolean; sortOrder: number;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<Plan>>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/plans');
      setPlans(res.data.data);
      setDrafts({});
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const edit = (id: string, patch: Partial<Plan>) =>
    setDrafts(d => ({ ...d, [id]: { ...d[id], ...patch } }));

  const save = async (plan: Plan) => {
    const patch = drafts[plan.id];
    if (!patch || Object.keys(patch).length === 0) return;
    setBusyId(plan.id);
    try {
      await api.put(`/api/admin/plans/${plan.id}`, patch);
      toast.success(`${plan.displayName} updated`);
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const val = <K extends keyof Plan>(p: Plan, key: K): Plan[K] =>
    (drafts[p.id]?.[key] ?? p[key]) as Plan[K];

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Membership Plans</h1>
        <p className="text-sm text-gray-500 mt-1">Pricing shown to users on the membership page. Changes apply immediately.</p>
      </div>

      <ErrorCard message={error} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map(p => {
          const dirty = !!drafts[p.id] && Object.keys(drafts[p.id]).length > 0;
          const features = Array.isArray(p.features) ? p.features as string[] : [];
          return (
            <Card key={p.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{p.displayName}</h2>
                    {p.isPopular && <Badge variant="info"><Star size={11} className="mr-1" />Popular</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{p.name} · sort {p.sortOrder}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{formatPrice(val(p, 'price'))}</div>
                  <div className="text-xs text-gray-400">{val(p, 'durationMonths')} months</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <Input label="Display name" value={String(val(p, 'displayName'))} onChange={e => edit(p.id, { displayName: e.target.value })} />
                <Input label="Tagline" value={String(val(p, 'tagline'))} onChange={e => edit(p.id, { tagline: e.target.value })} />
                <Input label="Price (₹)" type="number" value={String(val(p, 'price'))} onChange={e => edit(p.id, { price: Number(e.target.value) })} />
                <Input label="Original price (₹)" type="number" value={String(val(p, 'originalPrice'))} onChange={e => edit(p.id, { originalPrice: Number(e.target.value) })} />
                <Input label="Discount (%)" type="number" value={String(val(p, 'discount'))} onChange={e => edit(p.id, { discount: Number(e.target.value) })} />
                <Input label="Duration (months)" type="number" value={String(val(p, 'durationMonths'))} onChange={e => edit(p.id, { durationMonths: Number(e.target.value) })} />
                <Input label="Post limit" type="number" value={String(val(p, 'postLimit'))} onChange={e => edit(p.id, { postLimit: Number(e.target.value) })} />
                <Input label="Sort order" type="number" value={String(val(p, 'sortOrder'))} onChange={e => edit(p.id, { sortOrder: Number(e.target.value) })} />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(val(p, 'isPopular'))}
                  onChange={e => edit(p.id, { isPopular: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                Highlight as &ldquo;Most popular&rdquo;
              </label>

              {features.length > 0 && (
                <ul className="text-xs text-gray-500 space-y-1 mb-4 list-disc list-inside">
                  {features.slice(0, 4).map((f, i) => <li key={i} className="truncate">{f}</li>)}
                  {features.length > 4 && <li className="list-none text-gray-400">+{features.length - 4} more</li>}
                </ul>
              )}

              <Button size="sm" disabled={!dirty || busyId === p.id} isLoading={busyId === p.id} onClick={() => save(p)}>
                <Save size={14} className="mr-1.5" /> {dirty ? 'Save changes' : 'No changes'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
