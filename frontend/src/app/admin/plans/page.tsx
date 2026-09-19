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
  isPopular: boolean; isOneTime?: boolean; sortOrder: number;
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
        <p className="text-sm text-gray-500 mt-1">Pricing shown to users on the membership page. Changes apply immediately. Plan names must be BASIC, STANDARD, PREMIUM, or STAR.</p>
      </div>

      <ErrorCard message={error} />
      <CreatePlanForm onCreated={load} existing={plans.map(p => p.name)} />

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

              <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
              <textarea
                className="w-full min-h-[88px] rounded-md border border-gray-300 px-3 py-2 text-sm mb-4"
                value={Array.isArray(val(p, 'features')) ? (val(p, 'features') as string[]).join('\n') : features.join('\n')}
                onChange={e => edit(p.id, { features: e.target.value.split('\n') })}
              />

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

function CreatePlanForm({ onCreated, existing }: { onCreated: () => Promise<void>; existing: string[] }) {
  const remaining = ['BASIC', 'STANDARD', 'PREMIUM', 'STAR'].filter(n => !existing.includes(n));
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: remaining[0] || 'BASIC',
    displayName: '',
    tagline: '',
    price: 0,
    originalPrice: 0,
    discount: 0,
    durationMonths: 1,
    postLimit: 5,
    features: '',
    isPopular: false,
    isOneTime: false,
    sortOrder: 10,
  });

  if (remaining.length === 0) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/api/admin/plans', {
        ...form,
        features: form.features.split('\n').map(s => s.trim()).filter(Boolean),
      });
      toast.success('Plan created');
      setOpen(false);
      await onCreated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not create plan');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mb-6">
      {!open ? (
        <Button variant="outline" onClick={() => setOpen(true)}>Create plan</Button>
      ) : (
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-gray-700 col-span-2">Tier
            <select className="mt-1 w-full h-10 rounded-md border border-gray-300 px-3 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}>
              {remaining.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <Input label="Display name" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} />
          <Input label="Tagline" value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} />
          <Input label="Price (₹)" type="number" value={String(form.price)} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
          <Input label="Post limit" type="number" value={String(form.postLimit)} onChange={e => setForm({ ...form, postLimit: Number(e.target.value) })} />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
            <textarea className="w-full min-h-[72px] rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} />
          </div>
          <div className="col-span-2 flex gap-2">
            <Button type="submit" isLoading={busy}>Create</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </Card>
  );
}
