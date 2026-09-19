'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { SettingsForm } from '@/components/admin/SettingsForm';

const PRODUCTION_ORIGINS = [
  'https://buddysearch.online',
  'https://www.buddysearch.online',
  'https://buddysearch.in',
  'https://www.buddysearch.in',
];

const LOCAL_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function uniqueOrigins(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const value = raw.replace(/\/$/, '');
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function CopyList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 font-mono text-xs sm:text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 space-y-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function AdminGooglePage() {
  const [liveOrigin, setLiveOrigin] = useState('');

  useEffect(() => {
    setLiveOrigin(window.location.origin.replace(/\/$/, ''));
  }, []);

  const origins = useMemo(
    () => uniqueOrigins([...PRODUCTION_ORIGINS, ...LOCAL_ORIGINS, liveOrigin]),
    [liveOrigin]
  );

  const redirects = useMemo(
    () => uniqueOrigins(origins.flatMap((origin) => [origin, `${origin}/login`])),
    [origins]
  );

  return (
    <SettingsForm
      group="google"
      title="Google login"
      description={
        <div className="space-y-4 max-w-2xl text-gray-600">
          <p>
            Create an <strong>OAuth 2.0 Client ID</strong> of type <strong>Web application</strong> in
            Google Cloud Console. This site uses Google Identity Services (the Continue with Google
            button sends an ID token). Origins must match the browser URL exactly — no path, no trailing slash.
          </p>
          <div>
            <p className="font-semibold text-gray-800">Authorized JavaScript origins (required)</p>
            <p className="text-xs mt-1">Add every host people use to open the login page:</p>
            <CopyList items={origins} />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Authorized redirect URIs</p>
            <p className="text-xs mt-1">
              Not used by this app (no OAuth redirect callback). Google still often requires at least
              one URI on a Web client — paste these if the console asks. Do not use buddysearch.in
              alone if users open <span className="font-mono">buddysearch.online</span>.
            </p>
            <CopyList items={redirects} />
          </div>
        </div>
      }
      fields={[
        { name: 'clientId', label: 'Client ID', placeholder: '….apps.googleusercontent.com' },
        { name: 'clientSecret', label: 'Client secret', type: 'password', hint: 'Stored server-side only. Masked after save. Not required for GIS ID tokens.' },
      ]}
    />
  );
}
