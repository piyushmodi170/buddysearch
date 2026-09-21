import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { AEO_ARTICLES, aeoPath } from '@/lib/aeo';
import { FAQS, SITE, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/answers');

const intro =
  "Buddy Search is India's friendship-first place to hire a verified companion (about ₹300–₹2,000/hour) or become a Buddy. Short answers below; full guides live on the blog so Google is not asked to rank two thin URLs for the same question.";

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
        <h2 className="text-xl font-bold pt-4">Facts (one paragraph each)</h2>
        {FAQS.map((item) => (
          <div key={item.q}>
            <h3 className="font-semibold">{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
        <h2 className="text-xl font-bold pt-4">Pick a question</h2>
        <ul className="list-disc pl-5 space-y-3">
          {AEO_ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link className="text-[#F96566] font-semibold" href={article.canonicalPath || aeoPath(article.slug)}>
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
