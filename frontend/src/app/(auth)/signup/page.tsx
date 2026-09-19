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

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="mr-2">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    password: '',
    role: 'CLIENT' as 'CLIENT' | 'BUDDY' | 'BOTH',
  });

  const handleManualSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.identifier || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const isEmail = formData.identifier.includes('@');
      const payload = {
        name: formData.name,
        email: isEmail ? formData.identifier : `${formData.identifier}@buddysearch.in`,
        phone: !isEmail ? formData.identifier : undefined,
        password: formData.password,
        role: formData.role
      };

      const res = await api.post('/api/auth/signup', payload);
      const data = res.data.data || res.data;
      login(data.user, data.token);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    toast.error('Google sign-up is not configured yet. Please use the form below.');
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
          <p className="text-gray-500 mb-6">Sign up with Google or fill in your details manually.</p>

          {/* Google Signup Button */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full py-5 flex items-center justify-center border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold shadow-sm text-sm mb-6"
            onClick={handleGoogleSignup}
            isLoading={loading}
          >
            <GoogleIcon />
            Sign Up with Google
          </Button>

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
              label="Email ID or Phone Number"
              type="text"
              required
              placeholder="e.g. piyush.modi@gmail.com or 9999999999"
              icon={<Mail size={18} />}
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
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