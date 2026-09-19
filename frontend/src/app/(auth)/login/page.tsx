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

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      toast.error('Please enter your Email/ID and Password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        phone: formData.identifier,
        password: formData.password
      });
      const data = res.data.data || res.data;
      if (data && data.user && data.token) {
        login(data.user, data.token);
      } else {
        throw new Error('Invalid response');
      }
      toast.success('Signed in successfully!');
      router.push('/hire');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    toast.error('Google sign-in is not configured yet. Please use email and password.');
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
          <p className="text-gray-500 mb-6">Sign in with your Google account or fill in your ID & password.</p>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full py-5 flex items-center justify-center border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold shadow-sm text-sm mb-6"
            onClick={() => handleGoogleLogin()}
            isLoading={loading}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">Or Sign In with ID & Password</span>
            </div>
          </div>

          {/* Manual Input Form (ID & Password) */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <Input
              label="Email ID or Phone Number"
              type="text"
              required
              placeholder="e.g. piyush.modi@gmail.com or 9999999999"
              icon={<Mail size={18} />}
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
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
