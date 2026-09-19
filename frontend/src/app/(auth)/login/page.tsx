'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Users, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please enter your email and password');
      return;
    }
    if (!formData.email.includes('@')) {
      toast.error('Please sign in with your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      const data = res.data.data || res.data;
      if (data && data.user && data.token) {
        login(data.user, data.token);
      } else {
        throw new Error('Invalid response');
      }
      toast.success('Signed in successfully!');
      const needsOnboarding = data.user && data.user.onboardingCompleted === false && !data.user.isAdmin;
      router.push(needsOnboarding ? '/onboarding' : '/hire');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">BuddySearch</span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-gray-500 mb-6">Sign in with Google or your Gmail address and password.</p>

          <GoogleSignIn label="Continue with Google" />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">Or sign in with email</span>
            </div>
          </div>

          {/* Manual Input Form (ID & Password) */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              placeholder="e.g. you@example.com"
              icon={<Mail size={18} />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                icon={<Lock size={18} />}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full mt-4" size="lg" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:text-primary-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-primary-dark items-center justify-center p-12 text-white">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Find the perfect companion for your next adventure.</h2>
          <p className="text-lg text-primary-light mb-8">
            Connect with verified people in your city who share your interests and are ready to hang out.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-white flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i}`} alt="user" />
                </div>
              ))}
            </div>
            <span>Join 10,000+ happy users today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
