import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { AUTHOR, CONTACT } from '@/lib/eeat';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/authors');

export default function AuthorsIndexPage() {
  return (
    <PublicDoc title="Authors">
      <p className="aeo-direct text-lg font-medium">
        Buddy Search guides are written by the in-house desk. Contact {CONTACT.email}.
      </p>
      <ul className="list-disc pl-5">
        <li>
          <Link className="text-[#F96566] font-semibold" href={AUTHOR.path}>
            {AUTHOR.name}
          </Link>
          — {AUTHOR.role}. {AUTHOR.years}.
        </li>
      </ul>
    </PublicDoc>
  );
}
