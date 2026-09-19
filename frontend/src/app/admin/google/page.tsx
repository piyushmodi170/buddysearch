'use client';
import { SettingsForm } from '@/components/admin/SettingsForm';

export default function AdminGooglePage() {
  return (
    <SettingsForm
      group="google"
      title="Google login"
      description="Create an OAuth 2.0 Web client in Google Cloud Console. Authorized JavaScript origins must include https://buddysearch.in and http://localhost:3000. Authorized redirect URIs are not required for GIS ID tokens."
      fields={[
        { name: 'clientId', label: 'Client ID', placeholder: '….apps.googleusercontent.com' },
        { name: 'clientSecret', label: 'Client secret', type: 'password', hint: 'Stored server-side only. Masked after save.' },
      ]}
    />
  );
}
