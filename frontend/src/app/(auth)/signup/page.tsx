'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Search, Briefcase, Check, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT' as 'CLIENT' | 'BUDDY' | 'BOTH',
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

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role
      };

      const res = await api.post('/api/auth/signup', payload);
      const data = res.data.data || res.data;
      login(data.user, data.token);
      toast.success('Account created successfully!');
      router.push('/hire');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ROLES = [
    { id: 'CLIENT', title: 'I need buddies', desc: 'Post requests and hire companions in your city', icon: Search },
    { id: 'BUDDY', title: 'I want to be a buddy', desc: 'Offer companionship and earn on your schedule', icon: Briefcase },
    { id: 'BOTH', title: 'Both', desc: 'Hire companions and offer services', icon: Users },
  ];

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">BuddySearch</span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-gray-500 mb-6">Create an account with Google or your Gmail address and password.</p>

          <GoogleSignIn label="Sign up with Google" />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">Or Fill Details Manually</span>
            </div>
          </div>

          {/* Manual Signup Form */}
          <form onSubmit={handleManualSignup} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="e.g. Piyush Modi"
              icon={<UserIcon size={18} />}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Email"
              type="email"
              required
              placeholder="e.g. you@example.com"
              icon={<Mail size={18} />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              icon={<Lock size={18} />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select how you want to use BuddySearch:</label>
              <div className="space-y-2.5">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = formData.role === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setFormData({ ...formData, role: r.id as any })}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors relative",
                        isSelected ? "border-primary bg-primary-light/10" : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className={cn("p-1.5 rounded-lg", isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500")}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className={cn("font-bold text-sm", isSelected ? "text-primary" : "text-gray-900")}>{r.title}</h4>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[10px]">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" size="lg" isLoading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-primary-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-gray-50 items-center justify-center p-12">
        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Friends" className="rounded-2xl shadow-xl object-cover h-full w-full max-h-[80vh]" />
      </div>
    </div>
  );
}