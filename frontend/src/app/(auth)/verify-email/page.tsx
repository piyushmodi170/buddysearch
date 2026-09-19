'use client';
import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { postAuthPath } from '@/lib/utils';

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, updateUser } = useAuthStore();
  const emailFromQuery = params.get('email') || '';
  const email = useMemo(() => emailFromQuery || user?.email || '', [emailFromQuery, user?.email]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/verify-email', { email, code });
      const next = res.data.data?.user;
      if (next) updateUser(next);
      toast.success('Email verified');
      const nextUser = next || { ...user, emailVerified: true };
      router.replace(postAuthPath(nextUser as any));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not verify email');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await api.post('/api/auth/resend-verification', { email });
      toast.success('If that inbox exists, we sent a new code.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block mb-8">
          <img src="/logo.png" alt="BuddySearch" className="h-9 w-auto" />
        </Link>
        <h1 className="text-3xl font-bold mb-2">Verify your email</h1>
        <p className="text-gray-500 mb-6">Enter the 6-digit code we sent to <strong>{email || 'your inbox'}</strong>.</p>
        <form onSubmit={verify} className="space-y-4">
          <Input label="Verification code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" required />
          <Button type="submit" className="w-full" size="lg" isLoading={loading}>Verify email</Button>
        </form>
        <button type="button" onClick={resend} className="mt-4 text-sm font-semibold text-primary" disabled={resending}>
          {resending ? 'Sending…' : 'Resend code'}
        </button>
        <p className="mt-6 text-sm text-gray-500">
          Check spam if you do not see the email. You must verify this inbox to continue.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
