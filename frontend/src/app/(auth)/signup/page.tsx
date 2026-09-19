'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Heart, KeyRound, ShieldCheck, Timer, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';
import { cn } from '@/lib/utils';

const ROLES: { id: 'CLIENT' | 'BUDDY' | 'BOTH'; label: string; cta: string }[] = [
  { id: 'CLIENT', label: 'I need a Buddy', cta: 'Continue as Client' },
  { id: 'BUDDY', label: 'I am a Buddy', cta: 'Continue as Buddy' },
  { id: 'BOTH', label: 'Both', cta: 'Continue as Client & Buddy' },
];

const FEATURES = [
  { icon: Heart, title: 'Dosti that actually sticks', body: 'Connect with people who show up and stay — reliable and real.', badge: 'RELIABLE' },
  { icon: ShieldCheck, title: 'Verified members you can trust', body: 'ID-verified members get a badge, so you know exactly who’s confirmed.', badge: 'ID VERIFIED' },
  { icon: KeyRound, title: "Your city's already in", body: 'From Mumbai to your hometown — chances are, we’re already there.', badge: '200+ CITIES' },
  { icon: Timer, title: 'Hired before your chai gets cold', body: 'Apply, connect, start — all inside a few minutes.', badge: 'SUPER FAST' },
  { icon: Wallet, title: 'Turn free time into real money', body: 'Become a buddy and get paid to hang out, guide, and connect.', badge: 'EARN DAILY' },
];

const fieldClass =
  'w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F04438]/20 focus:border-[#F04438]';

function strongPassword(value: string) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

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
    role: 'CLIENT' as 'CLIENT' | 'BUDDY' | 'BOTH',
  });

  const cta = ROLES.find((role) => role.id === formData.role)?.cta || 'Continue as Client';

  const handleManualSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim().length < 2) {
      toast.error('Enter your full name');
      return;
    }
    if (!formData.email.includes('@')) {
      toast.error('Enter a valid email address');
      return;
    }
    const phone = formData.phone.replace(/\D/g, '');
    if (phone.length !== 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    if (!strongPassword(formData.password)) {
      toast.error('Password needs 8+ characters with a letter and a number');
      return;
    }
    if (!agreed) {
      toast.error('Please agree to the Terms of Service to continue');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/signup', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone,
        role: formData.role,
      }, { timeout: 20000 });
      const data = res.data.data || res.data;
      if (!data?.user || !data?.token) throw new Error('Unable to create your account');
      login(data.user, data.token);
      toast.success(data.user?.emailVerified ? 'Account created.' : 'Account created. Check your email for a verification code.');
      router.replace(data.user?.emailVerified ? '/onboarding' : `/verify-email?email=${encodeURIComponent(formData.email.trim().toLowerCase())}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Unable to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <aside className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#F04438] via-[#F25563] to-[#FB7185] text-white px-10 py-8 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 0, transparent 40%), radial-gradient(circle at 80% 80%, #fff 0, transparent 35%)' }} />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2 mb-10">
            <img src="/logo.png" alt="BuddySearch" className="h-9 w-auto brightness-0 invert" />
          </Link>
          <h1 className="text-4xl xl:text-5xl font-black leading-tight max-w-lg">
            Hire or Become a Buddy for Every Plan.
          </h1>
          <p className="mt-4 text-white/90 max-w-lg text-sm leading-relaxed">
            India’s social companion platform to find, hire, or connect with verified companions for every plan. From cafés and concerts to travel and adventures, BuddySearch makes social experiences effortless, while giving companions the opportunity to earn along the way.
          </p>
          <div className="mt-8 space-y-3 max-w-xl">
            {FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-center gap-3 rounded-2xl bg-white/12 border border-white/15 px-4 py-3 backdrop-blur-sm">
                  <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{item.title}</p>
                    <p className="text-xs text-white/85">{item.body}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-extrabold tracking-wide bg-[#FACC15] text-gray-900 rounded-full px-2 py-1">
                    {item.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative grid grid-cols-4 gap-3 pt-8 text-center">
          {[
            ['100K+', 'ACTIVE BUDDIES'],
            ['50K+', 'CONNECTIONS MADE'],
            ['4.9★', 'TRUST SCORE'],
            ['200+', 'CITIES ACROSS INDIA'],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-xl font-black">{value}</p>
              <p className="text-[10px] font-semibold tracking-wide text-white/80 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex items-center justify-center px-5 py-10 bg-white">
        <div className="w-full max-w-[420px]">
          <h1 className="text-3xl font-extrabold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-400 mt-1 mb-6">Start for free — no credit card needed</p>

          <div className="flex rounded-full bg-[#FDECEC] p-1 mb-6">
            {ROLES.map((role) => {
              const active = formData.role === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.id })}
                  className={cn(
                    'flex-1 h-10 rounded-full text-sm font-semibold transition-colors',
                    active ? 'bg-white text-[#F04438] shadow-sm ring-1 ring-[#F04438]/30' : 'text-gray-500'
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
              <input className={fieldClass} required placeholder="Your full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input className={fieldClass} type="email" required placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <div className="flex gap-2">
                <span className="h-12 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 flex items-center">+91</span>
                <input
                  className={fieldClass}
                  inputMode="numeric"
                  required
                  maxLength={10}
                  placeholder="98765 43210"
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
                  placeholder="Min. 8 characters with a letter and number"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label="Toggle password">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#F04438] hover:bg-[#E11D48] text-white text-base font-bold shadow-[0_8px_24px_rgba(240,68,56,0.28)] disabled:opacity-60"
            >
              {loading ? 'Creating account…' : cta}
            </button>
          </form>

          <label className="mt-4 flex items-start gap-2 text-sm text-gray-500">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#F04438]" />
            <span>
              I have read and agree to the{' '}
              <Link href="/help" className="text-[#F04438] font-medium">Terms of Service</Link>,{' '}
              <Link href="/help" className="text-[#F04438] font-medium">Privacy Policy</Link>
              {' '}and{' '}
              <Link href="/help" className="text-[#F04438] font-medium">Code of Conduct</Link>
            </span>
          </label>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#F04438]">Log in</Link>
          </p>

          <GoogleSignIn role={formData.role} />
        </div>
      </section>
    </div>
  );
}
