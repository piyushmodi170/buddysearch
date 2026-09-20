'use client';
import React, { useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Mail, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { renderPreviewVars, wrapPreviewHtml } from '@/lib/emailPreview';

export type EmailTemplateDraft = {
  id: string;
  slug: string;
  name: string;
  description: string;
  kind: 'SYSTEM' | 'MARKETING';
  subject: string;
  body: string;
  active: boolean;
};

const CHIPS: Record<string, string[]> = {
  'email-otp': ['name', 'code', 'minutes'],
  'password-reset': ['name', 'code', 'minutes'],
  welcome: ['name', 'appName', 'appUrl'],
  'payment-confirmation': ['name', 'plan', 'amount', 'appUrl'],
  'purchase-thanks': ['name', 'plan', 'appName'],
  'incomplete-profile': ['name', 'appName', 'appUrl'],
  'unpaid-membership': ['name', 'appName', 'appUrl', 'logoUrl'],
};

const ALL_CHIPS = ['name', 'code', 'minutes', 'email', 'appName', 'appUrl', 'logoUrl', 'plan', 'amount'];

export function TemplateEditor({
  tpl,
  creating,
  onClose,
  onSave,
}: {
  tpl: EmailTemplateDraft;
  creating: boolean;
  onClose: () => void;
  onSave: (tpl: EmailTemplateDraft) => void | Promise<void>;
}) {
  const adminEmail = useAuthStore((s) => s.user?.email) || '';
  const [draft, setDraft] = useState(tpl);
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [testTo, setTestTo] = useState(adminEmail || 'test@example.com');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const chips = CHIPS[draft.slug] || ALL_CHIPS;
  const previewHtml = useMemo(
    () => wrapPreviewHtml(renderPreviewVars(draft.body), renderPreviewVars('{{appName}}')),
    [draft.body]
  );

  const insertVar = (key: string) => {
    const token = `{{${key}}}`;
    const el = bodyRef.current;
    if (!el) {
      setDraft((d) => ({ ...d, body: `${d.body}${token}` }));
      return;
    }
    const start = el.selectionStart ?? draft.body.length;
    const end = el.selectionEnd ?? start;
    const next = draft.body.slice(0, start) + token + draft.body.slice(end);
    setDraft((d) => ({ ...d, body: next }));
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    setSending(true);
    try {
      await api.post('/api/admin/email/templates/test', {
        to: testTo,
        subject: draft.subject,
        body: draft.body,
        slug: draft.slug,
      });
      toast.success(`Preview sent to ${testTo}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send test');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <header className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Mail className="text-primary shrink-0" size={20} />
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 truncate">
              {creating ? 'New template' : `Edit: ${draft.name || 'Email template'}`}
            </h2>
            <p className="text-xs text-gray-400">{draft.kind === 'SYSTEM' ? 'System template' : 'Marketing template'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50"
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
        <div className="overflow-y-auto p-4 md:p-6 space-y-4 border-r border-gray-100">
          <Input
            label="Subject"
            value={draft.subject}
            onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
            placeholder="Your {{appName}} verification code: {{code}}"
          />
          <Input
            label="Description (admin notes)"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
          {!creating && draft.kind === 'MARKETING' && (
            <Input label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          )}
          {creating && (
            <Input label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          )}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Email Body (HTML supported)</label>
              <span className="text-xs text-gray-400">{draft.body.length} chars</span>
            </div>
            <textarea
              ref={bodyRef}
              className="w-full min-h-[280px] rounded-md border border-gray-300 p-3 text-sm font-mono"
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Click to insert a variable:</p>
            <div className="flex flex-wrap gap-2">
              {chips.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => insertVar(key)}
                  className="text-xs font-mono px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 hover:border-primary hover:text-primary"
                >
                  {`{{${key}}}`}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              className="rounded border-gray-300 text-primary"
            />
            Template enabled
          </label>
          <div className="flex items-end gap-2">
            <Input label="" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="test@example.com" />
            <Button variant="outline" isLoading={sending} onClick={sendTest}>
              <Send size={14} className="mr-1" /> Send Test
            </Button>
          </div>
        </div>

        {showPreview && (
          <div className="hidden lg:flex flex-col bg-gray-50 min-h-0">
            <div className="px-6 py-3 text-sm text-gray-500 border-b border-gray-200 bg-white">
              Live preview (sample data) · {renderPreviewVars(draft.subject)}
            </div>
            <iframe title="Email preview" className="flex-1 w-full bg-gray-50 border-0" srcDoc={previewHtml} />
          </div>
        )}
      </div>

      <footer className="flex items-center justify-end gap-2 px-4 md:px-6 py-3 border-t border-gray-200 bg-white shrink-0">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={saving} onClick={save}>Save Template</Button>
      </footer>
    </div>
  );
}
