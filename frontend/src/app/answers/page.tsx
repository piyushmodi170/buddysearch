import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { AEO_ARTICLES, aeoPath } from '@/lib/aeo';
import { SITE, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/answers');

const intro =
  "Buddy Search is India's friendship-first place to hire a verified companion or become a Buddy. These pages answer common voice and AI-search questions in plain language.";

export default function AnswersIndexPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Buddy Search answers',
          url: `${SITE.url}/answers`,
          description: intro,
        }}
      />
      <PublicDoc title="Direct answers about Buddy Search">
        <p className="aeo-direct text-lg font-medium">{intro}</p>
        <h2 className="text-xl font-bold pt-4">Pick a question</h2>
        <ul className="list-disc pl-5 space-y-3">
          {AEO_ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link className="text-[#F96566] font-semibold" href={aeoPath(article.slug)}>
                {article.query}
              </Link>
              <p className="mt-1 text-sm text-[#7a8494]">{article.directAnswer}</p>
            </li>
          ))}
        </ul>
      </PublicDoc>
    </>
  );
}
