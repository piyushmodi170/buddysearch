import React from 'react';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import type { AeoArticle } from '@/lib/aeo';
import { aeoPath } from '@/lib/aeo';
import { SITE, absoluteUrl } from '@/lib/seo';
import { AUTHOR } from '@/lib/eeat';
import { CitationLinks } from '@/components/seo/EeatBits';

export function aeoJsonLd(article: AeoArticle) {
  const url = absoluteUrl(aeoPath(article.slug));
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.query,
    description: article.directAnswer,
    inLanguage: SITE.language,
    step: article.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
  const speakable = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: article.title,
    url,
    datePublished: '2026-09-20',
    dateModified: '2026-09-21',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.aeo-direct', '.aeo-steps', '.aeo-faq'],
    },
    mainEntity: {
      '@type': 'Question',
      name: article.query,
      acceptedAnswer: { '@type': 'Answer', text: article.directAnswer },
    },
  };
  return [speakable, howTo, faq];
}

export function AeoArticleView({ article }: { article: AeoArticle }) {
  return (
    <>
      <JsonLd data={aeoJsonLd(article)} />
      <PublicDoc title={article.query}>
        <p className="text-sm text-[#7a8494]">
          <Link className="text-[#F96566] font-semibold" href={AUTHOR.path}>
            {AUTHOR.name}
          </Link>
          {' · '}
          <time dateTime="2026-09-21">2026-09-21</time>
        </p>
        <p className="aeo-direct text-lg font-medium text-[#3D4550]">{article.directAnswer}</p>
        <blockquote className="border-l-4 border-[#F96566] pl-4 italic">{article.directAnswer}</blockquote>

        <h2 className="text-xl font-bold pt-6">Explanation</h2>
        <p>{article.explanation}</p>

        <h2 className="text-xl font-bold pt-6">Steps</h2>
        <ol className="aeo-steps list-decimal pl-5 space-y-3">
          {article.steps.map((step) => (
            <li key={step.name}>
              <h3 className="font-semibold inline">{step.name}. </h3>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>

        {article.table ? (
          <>
            <h2 className="text-xl font-bold pt-6">{article.table.caption}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[#f0e0e0] bg-white">
                <thead>
                  <tr className="bg-white">
                    {article.table.headers.map((header) => (
                      <th key={header} className="text-left p-3 border-b border-[#f0e0e0]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {article.table.rows.map((row) => (
                    <tr key={row.join('-')}>
                      {row.map((cell) => (
                        <td key={cell} className="p-3 border-t border-[#f0e0e0] align-top">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {article.examples?.length ? (
          <>
            <h2 className="text-xl font-bold pt-6">Examples</h2>
            <ul className="list-disc pl-5 space-y-2">
              {article.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </>
        ) : null}

        <h2 className="text-xl font-bold pt-6">FAQs</h2>
        <dl className="aeo-faq space-y-4">
          {article.faqs.map((item) => (
            <div key={item.q}>
              <dt>
                <h3 className="font-semibold">{item.q}</h3>
              </dt>
              <dd className="m-0">{item.a}</dd>
            </div>
          ))}
        </dl>

        <p className="pt-4">
          Next step:{' '}
          <Link className="text-[#F96566] font-semibold" href="/signup">
            create a Buddy Search account
          </Link>{' '}
          or read more{' '}
          <Link className="text-[#F96566] font-semibold" href="/answers">
            short answers
          </Link>
          .
        </p>
        <CitationLinks />
      </PublicDoc>
    </>
  );
}
