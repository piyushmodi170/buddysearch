'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Megaphone, Send, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/admin/AdminControls';

type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
  slug: string;
};

const AUDIENCES = [
  { value: 'active', label: 'Active users only' },
  { value: 'all', label: 'All users' },
  { value: 'incomplete', label: 'Incomplete profiles' },
  { value: 'unpaid', label: 'No membership yet' },
  { value: 'paid', label: 'Paid members' },
];

export default function CampaignClient() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tab, setTab] = useState<'audience' | 'custom'>('audience');
  const [audience, setAudience] = useState('active');
  const [customEmails, setCustomEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('Hi {{name}},\n\n');
  const [slug, setSlug] = useState('');
  const [count, setCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    api.get('/api/admin/email/templates')
      .then((res) => {
        const rows = res.data.data || [];
        setTemplates(rows);
        const pre = params.get('template');
        const match = rows.find((t: Template) => t.id === pre);
        if (match) {
          setSubject(match.subject);
          setBody(match.body);
          setSlug(match.slug);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params]);

  useEffect(() => {
    const emails = customEmails.split(/[,\n;]+/).map((e) => e.trim()).filter(Boolean);
    const key = tab === 'custom' ? 'custom' : audience;
    api.get('/api/admin/email/audience-count', { params: { audience: key, emails: emails.join(',') } })
      .then((res) => setCount(res.data.data?.count || 0))
      .catch(() => setCount(0));
  }, [tab, audience, customEmails]);

  const loadTemplate = (id: string) => {
    const match = templates.find((t) => t.id === id);
    if (!match) return;
    setSubject(match.subject);
    setBody(match.body);
    setSlug(match.slug);
  };

  const send = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and body are required');
      return;
    }
    setSending(true);
    try {
      const res = await api.post('/api/admin/email/campaign', {
        audience: tab === 'custom' ? 'custom' : audience,
        customEmails,
        subject,
        body,
        slug,
      }, { timeout: 120000 });
      toast.success(res.data.message || 'Campaign sent');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send campaign');
    } finally {
      setSending(false);
    }
  };

  const previewHtml = useMemo(
    () => body.replace(/\{\{\s*name\s*\}\}/g, 'Piyush').replace(/\{\{\s*email\s*\}\}/g, 'you@example.com'),
    [body]
  );

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link href="/admin/email" className="text-sm text-gray-500 hover:text-gray-800">← Email</Link>
        <div className="flex items-center gap-2 mt-2">
          <Megaphone className="text-primary" size={22} />
          <h1 className="text-3xl font-bold text-gray-900">Send Email Campaign</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Variables: {'{{name}}'} {'{{email}}'} {'{{plan}}'} {'{{appName}}'} {'{{appUrl}}'}</p>
      </div>

      <Card>
        <div className="flex justify-end mb-4">
          <select
            className="h-10 rounded-md border border-gray-300 px-3 text-sm"
            defaultValue=""
            onChange={(e) => loadTemplate(e.target.value)}
          >
            <option value="">Load from template…</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="flex gap-2 mb-4">
          <button type="button" onClick={() => setTab('audience')} className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === 'audience' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>By Audience</button>
          <button type="button" onClick={() => setTab('custom')} className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === 'custom' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Custom Emails</button>
        </div>

        {tab === 'audience' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
              <select className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" value={audience} onChange={(e) => setAudience(e.target.value)}>
                {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <p className="text-sm text-gray-500">Recipients: <strong>{count} users</strong></p>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom emails (comma or new line)</label>
            <textarea className="w-full min-h-[90px] rounded-md border border-gray-300 p-3 text-sm" value={customEmails} onChange={(e) => setCustomEmails(e.target.value)} placeholder="one@example.com, two@example.com" />
            <p className="text-xs text-gray-400 mt-1">{count} recipient{count === 1 ? '' : 's'}</p>
          </div>
        )}

        <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
          <textarea className="w-full min-h-[220px] rounded-md border border-gray-300 p-3 text-sm" value={body} onChange={(e) => setBody(e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">Plain text — each line becomes a paragraph. HTML is supported.</p>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" onClick={() => setPreview((v) => !v)}><Eye size={16} className="mr-2" /> Preview</Button>
          <Button isLoading={sending} onClick={send}><Send size={16} className="mr-2" /> Send Campaign</Button>
        </div>
        {preview && (
          <div className="mt-4 border rounded-xl p-4 bg-gray-50 text-sm" dangerouslySetInnerHTML={{ __html: previewHtml.replace(/\n/g, '<br/>') }} />
        )}
      </Card>
    </div>
  );
}
