import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostView } from '@/components/seo/BlogPostView';
import { SeoAgentPostView } from '@/components/seo/SeoAgentPostView';
import { BLOG_BY_SLUG } from '@/lib/blog';
import { pageMetadata } from '@/lib/seo';
import { fetchPublishedSeoArticle } from '@/lib/seo-agent-posts';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const staticPost = BLOG_BY_SLUG[params.slug];
  if (staticPost) return pageMetadata(`/blog/${staticPost.slug}`);
  const agent = await fetchPublishedSeoArticle(params.slug);
  if (!agent) return pageMetadata('/blog');
  return {
    ...pageMetadata('/blog'),
    title: { absolute: `${agent.title} | Buddy Search` },
    description: agent.description,
    alternates: { canonical: `https://buddysearch.online/blog/${agent.slug}` },
  };
}

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const staticPost = BLOG_BY_SLUG[params.slug];
  if (staticPost) return <BlogPostView post={staticPost} />;
  const agent = await fetchPublishedSeoArticle(params.slug);
  if (!agent) notFound();
  return <SeoAgentPostView post={agent} />;
}
