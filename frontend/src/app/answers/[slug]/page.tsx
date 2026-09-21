import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AeoArticleView } from '@/components/seo/AeoArticleView';
import { AEO_ARTICLES, AEO_BY_SLUG } from '@/lib/aeo';
import { absoluteUrl, pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return AEO_ARTICLES.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = AEO_BY_SLUG[params.slug];
  if (!article) return pageMetadata('/answers');
  const meta = pageMetadata(`/answers/${article.slug}`);
  if (article.canonicalPath) {
    return { ...meta, alternates: { canonical: absoluteUrl(article.canonicalPath) } };
  }
  return meta;
}

export default function AeoAnswerPage({ params }: { params: { slug: string } }) {
  const article = AEO_BY_SLUG[params.slug];
  if (!article) notFound();
  return <AeoArticleView article={article} />;
}
