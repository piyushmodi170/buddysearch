'use client';
import React, { useState } from 'react';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminSmtpPage() {
  const email = useAuthStore((s) => s.user?.email) || '';
  const [to, setTo] = useState(email);
  const [sending, setSending] = useState(false);

  const sendTest = async () => {
    setSending(true);
    try {
      await api.post('/api/admin/settings/smtp/test', { to });
      toast.success(`Test email sent to ${to}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send test email');
    } finally {
      setSending(false);
    }
  };

  return (
    <SettingsForm
      group="smtp"
      title="SMTP"
      description="Used for transactional mail from the admin panel. Save settings before sending a test."
      fields={[
        { name: 'host', label: 'Host', placeholder: 'smtp.gmail.com' },
        { name: 'port', label: 'Port', type: 'number', placeholder: '587' },
        { name: 'user', label: 'Username' },
        { name: 'password', label: 'Password', type: 'password', hint: 'Masked after save. Leave unchanged to keep the current password.' },
        { name: 'from', label: 'From email', placeholder: 'BuddySearch <noreply@buddysearch.in>' },
        { name: 'secure', label: 'Use TLS (secure)', type: 'checkbox' },
      ]}
      extra={
        <div className="mt-8 pt-6 border-t border-gray-100 max-w-xl space-y-3">
          <h2 className="font-semibold text-gray-900">Send test email</h2>
          <Input label="Recipient" type="email" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button type="button" variant="outline" isLoading={sending} onClick={sendTest}>Send test</Button>
        </div>
      }
    />
  );
}
