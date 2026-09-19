'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Spinner, ErrorCard } from '@/components/admin/AdminControls';

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  hint?: string;
};

export function SettingsForm({
  group,
  title,
  description,
  fields,
  extra,
}: {
  group: 'razorpay' | 'smtp' | 'google' | 'app';
  title: string;
  description: React.ReactNode;
  fields: Field[];
  extra?: React.ReactNode;
}) {
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/admin/settings/${group}`)
      .then((res) => {
        const data = res.data.data || {};
        const next: Record<string, string | boolean> = {};
        for (const f of fields) {
          const v = data[f.name];
          if (typeof v === 'boolean') next[f.name] = v;
          else next[f.name] = v == null ? '' : String(v);
        }
        setValues(next);
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [group]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        const v = values[f.name];
        if (f.type === 'checkbox') payload[f.name] = Boolean(v);
        else if (f.type === 'number') payload[f.name] = Number(v);
        else payload[f.name] = v;
      }
      const res = await api.put(`/api/admin/settings/${group}`, payload);
      const data = res.data.data || {};
      const next: Record<string, string | boolean> = { ...values };
      for (const f of fields) {
        const v = data[f.name];
        if (v !== undefined) next[f.name] = typeof v === 'boolean' ? v : String(v ?? '');
      }
      setValues(next);
      toast.success('Saved');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <div className="text-sm text-gray-500 mt-1 mb-6">{description}</div>
      <ErrorCard message={error} />
      <Card>
        <form onSubmit={save} className="space-y-4 max-w-xl">
          {fields.map((f) => (
            f.type === 'checkbox' ? (
              <label key={f.name} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(values[f.name])}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.checked }))}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                {f.label}
              </label>
            ) : (
              <div key={f.name}>
                <Input
                  label={f.label}
                  type={f.type || 'text'}
                  placeholder={f.placeholder}
                  value={String(values[f.name] ?? '')}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  autoComplete="off"
                />
                {f.hint && <p className="text-xs text-gray-400 mt-1">{f.hint}</p>}
              </div>
            )
          ))}
          <Button type="submit" isLoading={saving}>Save</Button>
        </form>
        {extra}
      </Card>
    </div>
  );
}
