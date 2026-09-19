'use client';
import React, { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function GoogleSignIn({
  role,
  className,
}: {
  label?: string;
  role?: 'CLIENT' | 'BUDDY' | 'BOTH';
  className?: string;
}) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [clientId, setClientId] = useState('');
  const [ready, setReady] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef(role);
  roleRef.current = role;

  useEffect(() => {
    const controller = new AbortController();
    api.get('/api/auth/google/config', { signal: controller.signal, timeout: 8000 })
      .then((res) => setClientId(res.data.data?.clientId || ''))
      .catch(() => setClientId(''));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!clientId) return;
    const finish = async (idToken: string) => {
      try {
        const res = await api.post('/api/auth/google', { idToken, role: roleRef.current }, { timeout: 20000 });
        const data = res.data.data || res.data;
        if (!data?.user || !data?.token) throw new Error('Google sign-in failed');
        login(data.user, data.token);
        toast.success('Signed in with Google');
        const needsOnboarding = data.user.onboardingCompleted === false && !data.user.isAdmin;
        router.replace(needsOnboarding ? '/onboarding' : '/hire');
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.message || 'Google sign-in failed');
      }
    };

    const init = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res: { credential?: string }) => {
          if (!res?.credential) {
            toast.error('Google did not return a sign-in token. Try email signup.');
            return;
          }
          void finish(res.credential);
        },
      });
      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        shape: 'pill',
        width: String(Math.min(400, buttonRef.current.clientWidth || 360)),
      });
      setReady(true);
    };

    const existing = document.getElementById('google-gsi') as HTMLScriptElement | null;
    if (window.google?.accounts?.id) {
      init();
      return;
    }
    if (existing) {
      existing.addEventListener('load', init, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = init;
    script.onerror = () => toast.error('Could not load Google. Use email to create an account.');
    document.head.appendChild(script);
  }, [clientId, login, router]);

  if (!clientId) return null;

  return (
    <div className={className ?? 'mt-5'}>
      <div ref={buttonRef} className="flex justify-center min-h-[44px] w-full" />
      {!ready && <p className="text-center text-xs text-gray-400 mt-2">Loading Google…</p>}
    </div>
  );
}
