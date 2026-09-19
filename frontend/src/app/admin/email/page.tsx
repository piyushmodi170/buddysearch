'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Mail, Save, Send, Plus, Pencil, Trash2, Megaphone, AlertTriangle, Check, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/admin/AdminControls';
import { useAuthStore } from '@/store/useAuthStore';
import { TemplateEditor, type EmailTemplateDraft } from '@/components/admin/TemplateEditor';

type SmtpForm = {
  host: string;
  port: string;
  user: string;
  password: string;
  from: string;
  fromName: string;
  secure: boolean;
};

type Template = EmailTemplateDraft;

const emptySmtp: SmtpForm = {
  host: '', port: '587', user: '', password: '', from: '', fromName: 'BuddySearch', secure: false,
};

export default function AdminEmailPage() {
  const adminEmail = useAuthStore((s) => s.user?.email) || '';
  const [loading, setLoading] = useState(true);
  const [smtp, setSmtp] = useState<SmtpForm>(emptySmtp);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testTo, setTestTo] = useState(adminEmail);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [incomplete, setIncomplete] = useState(0);
  const [reminding, setReminding] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);

  const configured = Boolean(smtp.host && smtp.from);

  const load = async () => {
    try {
      const [smtpRes, tplRes, countRes] = await Promise.all([
        api.get('/api/admin/settings/smtp'),
        api.get('/api/admin/email/templates'),
        api.get('/api/admin/email/incomplete-count'),
      ]);
      const s = smtpRes.data.data || {};
      setSmtp({
        host: s.host || '',
        port: String(s.port || 587),
        user: s.user || '',
        password: s.password || '',
        from: s.from || '',
        fromName: s.fromName || 'BuddySearch',
        secure: Boolean(s.secure),
      });
      setTemplates(tplRes.data.data || []);
      setIncomplete(countRes.data.data?.count || 0);
      if (!testTo && adminEmail) setTestTo(adminEmail);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not load email settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const saveSmtp = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/admin/settings/smtp', {
        host: smtp.host,
        port: Number(smtp.port || 587),
        user: smtp.user,
        password: smtp.password,
        from: smtp.from,
        fromName: smtp.fromName,
        secure: smtp.secure,
      });
      const s = res.data.data || {};
      setSmtp((prev) => ({
        ...prev,
        host: s.host || prev.host,
        port: String(s.port || prev.port),
        user: s.user || prev.user,
        password: s.password || prev.password,
        from: s.from || prev.from,
        fromName: s.fromName || prev.fromName,
        secure: Boolean(s.secure),
      }));
      toast.success('SMTP settings saved');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      await api.post('/api/admin/email/smtp/verify');
      toast.success('SMTP connection works');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Connection failed');
    } finally {
      setTesting(false);
    }
  };

  const sendTest = async () => {
    setSendingTest(true);
    try {
      await api.post('/api/admin/settings/smtp/test', { to: testTo });
      toast.success(`Test email sent to ${testTo}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const remind = async () => {
    setReminding(true);
    try {
      const res = await api.post('/api/admin/email/remind-incomplete', {}, { timeout: 120000 });
      toast.success(res.data.message || 'Reminders sent');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send reminders');
    } finally {
      setReminding(false);
    }
  };

  const toggleTemplate = async (tpl: Template) => {
    try {
      const res = await api.put(`/api/admin/email/templates/${tpl.id}`, { active: !tpl.active });
      setTemplates((rows) => rows.map((row) => (row.id === tpl.id ? res.data.data : row)));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not update template');
    }
  };

  const saveTemplate = async (tpl: Template) => {
    try {
      if (creating) {
        const res = await api.post('/api/admin/email/templates', tpl);
        setTemplates((rows) => [...rows, res.data.data]);
        toast.success('Template created');
      } else {
        const res = await api.put(`/api/admin/email/templates/${tpl.id}`, tpl);
        setTemplates((rows) => rows.map((row) => (row.id === tpl.id ? res.data.data : row)));
        toast.success('Template saved');
      }
      setEditing(null);
      setCreating(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not save template');
    }
  };

  const removeTemplate = async (tpl: Template) => {
    try {
      await api.delete(`/api/admin/email/templates/${tpl.id}`);
      setTemplates((rows) => rows.filter((row) => row.id !== tpl.id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not delete template');
    }
  };

  if (loading) return <Spinner />;

  const system = templates.filter((t) => t.kind === 'SYSTEM');
  const marketing = templates.filter((t) => t.kind === 'MARKETING');

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email</h1>
          <p className="text-sm text-gray-500 mt-1">SMTP, verification OTP, password reset, and campaigns.</p>
        </div>
        <Link href="/admin/email/campaign">
          <Button><Megaphone size={16} className="mr-2" /> Send campaign</Button>
        </Link>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Mail className="text-primary" size={20} />
            <h2 className="font-bold text-gray-900">SMTP Configuration</h2>
          </div>
          <Badge variant={configured ? 'success' : 'warning'}>{configured ? 'Enabled' : 'Disabled'}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="SMTP Host" placeholder="smtp.gmail.com" value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} />
          <Input label="SMTP Port" type="number" value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: e.target.value })} />
          <Input label="SMTP Username / Email" value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} autoComplete="off" />
          <div>
            <Input label="SMTP Password" type="password" value={smtp.password} onChange={(e) => setSmtp({ ...smtp, password: e.target.value })} autoComplete="new-password" />
            <p className="text-xs text-gray-400 mt-1">Leave blank to keep the existing password. Gmail needs an App Password.</p>
          </div>
          <Input label="From Email" placeholder="noreply@buddysearch.online" value={smtp.from} onChange={(e) => setSmtp({ ...smtp, from: e.target.value })} />
          <Input label="From Name" placeholder="BuddySearch" value={smtp.fromName} onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 mt-4">
          <input type="checkbox" checked={smtp.secure} onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked, port: e.target.checked ? '465' : smtp.port })} className="rounded border-gray-300 text-primary" />
          Use SSL/TLS (port 465)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mt-4">
          <Input label="Send test email to (optional)" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
          <div className="flex items-end gap-2">
            <Button variant="outline" isLoading={testing} onClick={testConnection}>Test Connection</Button>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 mt-5">
          <Button variant="outline" isLoading={sendingTest} onClick={sendTest}>Send test email</Button>
          <Button isLoading={saving} onClick={saveSmtp}><Save size={16} className="mr-2" /> Save SMTP Settings</Button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Incomplete Profile Reminder</h2>
              <p className="text-sm text-gray-500 mt-1">
                Send the onboarding reminder to users who have not finished their profile.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Currently <strong>{incomplete}</strong> user{incomplete === 1 ? '' : 's'} missing a complete profile
              </p>
            </div>
          </div>
          <Button variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50" isLoading={reminding} onClick={remind}>
            Send Reminder
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900">Email Templates</h2>
            <p className="text-sm text-gray-500">System templates (OTP, reset, payment) and reusable marketing emails.</p>
          </div>
          <Button
            onClick={() => {
              setCreating(true);
              setEditing({
                id: '',
                slug: '',
                name: '',
                description: '',
                kind: 'MARKETING',
                subject: '',
                body: '<p>Hi {{name}},</p><p></p>',
                active: true,
              });
            }}
          >
            <Plus size={16} className="mr-2" /> New Template
          </Button>
        </div>

        <p className="text-xs font-semibold tracking-wider text-gray-400 mb-2">SYSTEM (AUTOMATED)</p>
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl mb-6">
          {system.map((tpl) => (
            <TemplateRow key={tpl.id} tpl={tpl} onEdit={() => { setCreating(false); setEditing(tpl); }} onToggle={() => toggleTemplate(tpl)} />
          ))}
        </div>

        <p className="text-xs font-semibold tracking-wider text-gray-400 mb-2">MARKETING (REUSABLE)</p>
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
          {marketing.map((tpl) => (
            <TemplateRow
              key={tpl.id}
              tpl={tpl}
              marketing
              onEdit={() => { setCreating(false); setEditing(tpl); }}
              onToggle={() => toggleTemplate(tpl)}
              onDelete={() => removeTemplate(tpl)}
            />
          ))}
          {marketing.length === 0 && <p className="p-4 text-sm text-gray-400">No marketing templates yet.</p>}
        </div>
      </Card>

      {editing && (
        <TemplateEditor
          tpl={editing}
          creating={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={saveTemplate}
        />
      )}
    </div>
  );
}

function TemplateRow({
  tpl, marketing, onEdit, onToggle, onDelete,
}: {
  tpl: Template;
  marketing?: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900">{tpl.name}</p>
          <Badge variant={tpl.active ? 'success' : 'default'}>{tpl.active ? 'Active' : 'Disabled'}</Badge>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{tpl.description || tpl.subject}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {marketing && (
          <Link href={`/admin/email/campaign?template=${tpl.id}`} className="p-2 text-gray-400 hover:text-primary" title="Use in campaign">
            <Send size={16} />
          </Link>
        )}
        <button type="button" onClick={onToggle} className="p-2 text-gray-400 hover:text-gray-700" title={tpl.active ? 'Disable' : 'Enable'}>
          {tpl.active ? <Check size={16} /> : <X size={16} />}
        </button>
        <button type="button" onClick={onEdit} className="p-2 text-gray-400 hover:text-gray-700" title="Edit">
          <Pencil size={16} />
        </button>
        {onDelete && (
          <button type="button" onClick={onDelete} className="p-2 text-gray-400 hover:text-red-600" title="Delete">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
