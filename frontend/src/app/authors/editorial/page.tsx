import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { AUTHOR, CONTACT } from '@/lib/eeat';
import { SITE, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/authors/editorial');

export default function EditorialAuthorPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: AUTHOR.name,
          jobTitle: AUTHOR.role,
          worksFor: { '@type': 'Organization', name: SITE.name, url: SITE.url },
          email: CONTACT.email,
          url: `${SITE.url}${AUTHOR.path}`,
          description: AUTHOR.bio,
        }}
      />
      <PublicDoc title={AUTHOR.name}>
        <p className="aeo-direct text-lg font-medium">{AUTHOR.bio}</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Role:</strong> {AUTHOR.role}
          </li>
          <li>
            <strong>Years:</strong> {AUTHOR.years}
          </li>
          <li>
            <strong>Beat:</strong> platonic companion hiring, KYC-style ID checks, UPI activity fees, India cities
          </li>
          <li>
            <strong>Contact:</strong>{' '}
            <a className="text-[#F96566] font-semibold" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
          </li>
        </ul>
        <p>
          Guides:{' '}
          <Link className="text-[#F96566] font-semibold" href="/blog">
            /blog
          </Link>
          . We do not invent guest experts or LinkedIn URLs that do not exist.
        </p>
      </PublicDoc>
    </>
  );
}
