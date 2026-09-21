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
          name: 'Terms of Service | Buddy Search India',
          url: `${SITE.url}/terms`,
        }}
      />
      <PublicDoc title="Terms of Service">
        <p>Last updated: 21 September 2026. These terms govern buddysearch.online in India.</p>
        <p className="aeo-direct text-lg font-medium">
          Buddy Search is a membership marketplace for platonic, activity-based companion bookings. You hire a Buddy
          for a named plan, or you offer time as a Buddy. Dating, sexual services, fake relationships, harassment, and
          illegal work are banned. Membership pays for platform access. Activity fees are agreed between you and the
          other member in chat. Buddy Search is not a social network.
        </p>
        <h2 className="text-xl font-bold pt-4">Accounts and verification</h2>
        <p>
          You must use your own identity. Do not scrape or upload other people&apos;s photos. We may ask for government
          ID. We may suspend or delete accounts that fail checks, spam, ghost paid plans, or break these terms. Email
          verification is required to use the product.
        </p>
        <h2 className="text-xl font-bold pt-4">Money</h2>
        <p>
          Membership (Basic, Standard, Premium, Star) is charged by Buddy Search for discovery, posting, and related
          tools. It is not the Buddy&apos;s hourly wage. Activity fees, tickets, food, and travel are between Client and
          Buddy. Write the rate, hours, and extras in chat before you travel. We can refuse refunds where the platform
          access was delivered. Payment-provider checkout, when enabled, is only for membership. Details:{' '}
          <a className="text-[#F96566] font-semibold" href="/payments">
            /payments
          </a>
          .
        </p>
        <h2 className="text-xl font-bold pt-4">Meets and conduct</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>First meets belong in public places.</li>
          <li>Stop the plan if it turns into dating pressure or anything illegal.</li>
          <li>Report abuse in the app. We can ban accounts. We do not send staff to your meet.</li>
        </ul>
        <h2 className="text-xl font-bold pt-4">Content licence</h2>
        <p>
          You keep ownership of text and photos you post. You grant Buddy Search a licence to display them on the
          service. We may remove listings without notice.
        </p>
        <h2 className="text-xl font-bold pt-4">Liability and law</h2>
        <p>
          The service is provided as available. Members are not our employees. Indian law governs these terms. If one
          clause cannot be enforced, the rest still applies. Disputes should first be raised through in-app Help.
        </p>
      </PublicDoc>
    </>
  );
}
