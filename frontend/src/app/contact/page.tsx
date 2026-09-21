import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { AUTHOR, CONTACT } from '@/lib/eeat';
import { SITE, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/contact');

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Buddy Search',
          url: `${SITE.url}/contact`,
          mainEntity: {
            '@type': 'Organization',
            name: CONTACT.operator,
            email: CONTACT.email,
            url: CONTACT.site,
            areaServed: CONTACT.country,
          },
        }}
      />
      <PublicDoc title="Contact Buddy Search">
        <p className="aeo-direct text-lg font-medium">
          The answer is email. Write {CONTACT.email} for account, safety reports, press, and directory listings. We
          operate in India. We do not publish a fake street to pass a checklist.
        </p>
        <h2 className="text-xl font-bold pt-4">Email</h2>
        <p>
          <a className="text-[#F96566] font-semibold" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
        </p>
        <h2 className="text-xl font-bold pt-4">Where we operate</h2>
        <p>
          Country: {CONTACT.country}. Official site: {CONTACT.site}. Use in-app Help after you log in for live
          membership issues.
        </p>
        <h2 className="text-xl font-bold pt-4">Press and listings</h2>
        <p>
          Copy the official name and blurb from{' '}
          <Link className="text-[#F96566] font-semibold" href="/press">
            /press
          </Link>
          . There is no Wikipedia or Wikidata item yet.
        </p>
      </PublicDoc>
    </>
  );
}
