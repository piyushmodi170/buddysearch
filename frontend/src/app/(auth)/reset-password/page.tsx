'use client';
import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email: email.trim().toLowerCase(), code, password });
      toast.success('Password updated. Sign in with your new password.');
      router.replace('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block mb-8">
          <img src="/logo.png" alt="BuddySearch" className="h-9 w-auto" />
        </Link>
        <h1 className="text-3xl font-bold mb-2">Reset password</h1>
        <p className="text-gray-500 mb-6">Enter the 6-digit code from your email and choose a new password (8+ characters, letter and number).</p>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Reset code" inputMode="numeric" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
          <Input label="New password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ characters with a letter and number" />
          <Button type="submit" className="w-full" size="lg" isLoading={loading}>Update password</Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>}>
      <ResetForm />
    </Suspense>
  );
}
