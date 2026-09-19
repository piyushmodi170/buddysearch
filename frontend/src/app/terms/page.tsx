import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { SITE, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/terms');

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Terms of Service',
          url: `${SITE.url}/terms`,
        }}
      />
      <PublicDoc title="Terms of Service">
        <p>Last updated: 19 September 2026.</p>
        <p>
          By creating a Buddy Search account you agree to use the service for platonic companionship and lawful
          activities only. Dating, harassment, illegal services, and misrepresentation of identity are not allowed.
        </p>
        <p>
          Membership fees pay for platform access (discovery, posting plans, badges). Activity fees between a Client
          and a Buddy are agreed in chat. We may suspend accounts that fail verification, spam, or break these terms.
        </p>
        <p>
          Listings and profiles must be your own. Do not scrape other people&apos;s photos or identities. Content you
          post remains yours; you grant us a licence to display it on the service.
        </p>
        <p>
          The platform is provided as available. Indian law governs these terms. If a section cannot be enforced,
          the rest still applies.
        </p>
      </PublicDoc>
    </>
  );
}
