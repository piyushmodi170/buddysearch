'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';
import { cn } from '@/lib/utils';

const ROLES: { id: 'CLIENT' | 'BUDDY' | 'BOTH'; label: string }[] = [
  { id: 'CLIENT', label: 'I need a Buddy' },
  { id: 'BUDDY', label: 'I am a Buddy' },
  { id: 'BOTH', label: 'Both' },
];

const fieldClass =
  'w-full h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'BOTH' as 'CLIENT' | 'BUDDY' | 'BOTH',
  });

  const handleManualSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!formData.email.includes('@')) {
      toast.error('Please use a valid email address');
      return;
    }
    const phone = formData.phone.replace(/\D/g, '');
    if (phone && phone.length !== 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    if (!agreed) {
      toast.error('Please agree to the Terms of Service to continue');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/signup', {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: phone || undefined,
        role: formData.role,
      }, { timeout: 10000 });
      const data = res.data.data || res.data;
      login(data.user, data.token);
      toast.success('Account created. Complete your profile to continue.');
      router.replace('/onboarding');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px]">
        <p className="text-center text-sm text-gray-400 mb-6">Start for free — no credit card needed</p>

        <div className="flex rounded-full bg-rose-50 p-1 mb-8">
          {ROLES.map((role) => {
            const active = formData.role === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setFormData({ ...formData, role: role.id })}
                className={cn(
                  'flex-1 h-11 rounded-full text-sm font-semibold transition-colors',
                  active ? 'bg-white text-[#F04438] shadow-sm' : 'text-gray-400'
                )}
              >
                {role.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleManualSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input
              className={fieldClass}
              required
              placeholder="Piyush Modi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input
              className={fieldClass}
              type="email"
              required
              placeholder="you@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <div className="flex gap-2">
              <span className="h-12 px-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-500 flex items-center">+91</span>
              <input
                className={fieldClass}
                inputMode="numeric"
                maxLength={10}
                placeholder="9229869940"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                className={`${fieldClass} pr-11`}
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#F04438] hover:bg-[#D92D20] text-white text-base font-bold shadow-[0_8px_24px_rgba(240,68,56,0.35)] mt-2 disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Continue'}
          </button>
        </form>

        <label className="mt-5 flex items-start gap-2 text-sm text-gray-500">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary"
          />
          <span>
            I have read and agree to the{' '}
            <Link href="/help" className="text-[#F04438] font-medium">Terms of Service</Link>,{' '}
            <Link href="/help" className="text-[#F04438] font-medium">Privacy Policy</Link>
            {' '}and{' '}
            <Link href="/help" className="text-[#F04438] font-medium">Code of Conduct</Link>
          </span>
        </label>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400">or</span>
          </div>
        </div>

        <GoogleSignIn label="Continue with Google" role={formData.role} />

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#F04438]">Log in</Link>
        </p>
      </div>
    </div>
  );
}
