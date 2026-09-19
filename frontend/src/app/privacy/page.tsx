import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { SITE, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/privacy');

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Privacy Policy',
          url: `${SITE.url}/privacy`,
        }}
      />
      <PublicDoc title="Privacy Policy">
        <p>Last updated: 19 September 2026.</p>
        <p>
          Buddy Search (&quot;we&quot;) operates {SITE.domain}. We collect the account details you submit (name, email,
          phone, profile, and verification documents), usage data needed to run matching and chat, and payment
          metadata from our payment partner when you buy membership.
        </p>
        <p>
          We use that information to operate the platform, prevent abuse, send transactional email (OTP, receipts),
          and improve matching. We do not sell personal data. Hosting, email, and payment processors may process
          data on our behalf in India or other regions they operate in.
        </p>
        <p>
          You can update profile fields in Account settings. To request deletion of your account, contact support
          from the email on the account. Cookies are used for login sessions and basic analytics.
        </p>
        <p>
          This policy is a plain-language summary for members in India. Questions: use the in-app Help page after
          you sign in.
        </p>
      </PublicDoc>
    </>
  );
}
