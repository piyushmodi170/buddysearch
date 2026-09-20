import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostView } from '@/components/seo/BlogPostView';
import { BLOG_BY_SLUG, BLOG_POSTS } from '@/lib/blog';
import { pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = BLOG_BY_SLUG[params.slug];
  if (!post) return pageMetadata('/blog');
  return pageMetadata(`/blog/${post.slug}`);
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const post = BLOG_BY_SLUG[params.slug];
  if (!post) notFound();
  return <BlogPostView post={post} />;
}
