import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { SITE, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/disclaimer');

export default function DisclaimerPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Disclaimer',
          url: `${SITE.url}/disclaimer`,
        }}
      />
      <PublicDoc title="Disclaimer">
        <p className="aeo-direct text-lg font-medium">
          Buddy Search is a technology platform that connects people in India for friendship-first, activity-based
          companionship. We do not employ companions, we do not arrange dates, and we are not a party to activity
          fees agreed in chat.
        </p>
        <h2 className="text-xl font-bold pt-4">What this means</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Profiles and plans are posted by members. Verify details in chat before you meet.</li>
          <li>Meet in public places. ID verification reduces risk; it does not guarantee someone&apos;s behaviour.</li>
          <li>Illegal activity, harassment, and sexual services are banned.</li>
        </ul>
        <p>
          The official website is <strong>https://buddysearch.online</strong>. buddysearch.in redirects there.
        </p>
      </PublicDoc>
    </>
  );
}
