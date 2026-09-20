import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AeoArticleView } from '@/components/seo/AeoArticleView';
import { AEO_ARTICLES, AEO_BY_SLUG } from '@/lib/aeo';
import { pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return AEO_ARTICLES.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = AEO_BY_SLUG[params.slug];
  if (!article) return pageMetadata('/answers');
  return pageMetadata(`/answers/${article.slug}`);
}

export default function AeoAnswerPage({ params }: { params: { slug: string } }) {
  const article = AEO_BY_SLUG[params.slug];
  if (!article) notFound();
  return <AeoArticleView article={article} />;
}
