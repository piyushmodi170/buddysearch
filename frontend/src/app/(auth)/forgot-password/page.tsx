'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim().toLowerCase() });
      toast.success('If that inbox exists, we sent a reset code.');
      router.push(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send reset code');
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
        <h1 className="text-3xl font-bold mb-2">Forgot password</h1>
        <p className="text-gray-500 mb-6">We’ll email a 6-digit code so you can set a new password.</p>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Button type="submit" className="w-full" size="lg" isLoading={loading}>Send reset code</Button>
        </form>
        <p className="mt-6 text-sm text-gray-600">
          <Link href="/login" className="font-semibold text-primary">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
