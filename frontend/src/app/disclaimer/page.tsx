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
          name: 'Disclaimer | Buddy Search safety and liability',
          url: `${SITE.url}/disclaimer`,
        }}
      />
      <PublicDoc title="Disclaimer">
        <p className="aeo-direct text-lg font-medium">
          Buddy Search is a technology platform at buddysearch.online. We connect people in India for
          friendship-first, activity-based companionship. We do not employ Buddies, we do not escort anyone to a
          venue, we do not arrange dates, and we are not a party to activity fees agreed in chat.
        </p>
        <h2 className="text-xl font-bold pt-4">Who is responsible at a meet</h2>
        <p>
          You decide whether to accept a chat, whether to meet, and whether to leave. ID verification reduces fake
          profiles. It does not guarantee that a person will behave well. Treat the first meet like meeting any new
          person in a public cafe, mall, theatre, or station.
        </p>
        <h2 className="text-xl font-bold pt-4">If something goes wrong</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Leave. Tell a trusted person where you are.</li>
          <li>Report the profile in the app so we can review and suspend it.</li>
          <li>If a crime occurred, contact local police. Keep the in-app chat as a record of what was agreed.</li>
        </ul>
        <p>
          Buddy Search can remove accounts. We cannot refund a Buddy&apos;s hourly fee that you paid directly, and we
          cannot send a staff member to the location.
        </p>
        <h2 className="text-xl font-bold pt-4">What this product is not</h2>
        <p>
          It is not a dating app, social network, escort directory, tour operator, or employer. Sexual services, fake partners for
          family events, and illegal work are banned. buddysearch.in redirects to the official site
          buddysearch.online.
        </p>
        <h2 className="text-xl font-bold pt-4">Rates</h2>
        <p>
          Illustrative Buddy rates on the site (about ₹300–₹2,000 per hour) are examples, not a promise. Each Buddy
          sets their own number. Buddy Search itself is free. Any hourly fee is between you and the Buddy.
        </p>
      </PublicDoc>
    </>
  );
}
