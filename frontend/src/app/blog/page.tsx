import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { BLOG_POSTS, blogPath } from '@/lib/blog';
import { SITE, pageMetadata } from '@/lib/seo';
import { fetchPublishedSeoArticles } from '@/lib/seo-agent-posts';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = pageMetadata('/blog');

export default async function BlogIndexPage() {
  const agentPosts = await fetchPublishedSeoArticles();
  const staticSlugs = new Set(BLOG_POSTS.map((post) => post.slug));
  const extra = agentPosts.filter((post) => !staticSlugs.has(post.slug));
  const listing = [
    ...BLOG_POSTS.map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      category: post.category,
      date: post.date,
    })),
    ...extra.map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      category: post.category,
      date: post.date,
    })),
  ];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Buddy Search guides',
          url: `${SITE.url}/blog`,
          description: 'Detailed guides on hiring a buddy, travel companions, and friendship-first plans in India.',
          blogPost: listing.map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            url: `${SITE.url}${blogPath(post.slug)}`,
            datePublished: post.date,
          })),
        }}
      />
      <PublicDoc title="Buddy Search blog: detailed guides">
        <p className="aeo-direct text-lg font-medium">
          These guides answer how to hire a buddy in India, how movie and travel companions work, and how to stay
          friendship-first. Each article starts with a direct answer, then steps and FAQs for Google and voice search.
        </p>
        <ul className="space-y-6 pt-4">
          {listing.map((post) => (
            <li key={post.slug} className="border-b border-[#f0e0e0] pb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#F96566]">{post.category}</p>
              <Link className="text-lg font-bold text-[#F96566]" href={blogPath(post.slug)}>
                {post.title}
              </Link>
              <p className="mt-1">{post.description}</p>
            </li>
          ))}
        </ul>
      </PublicDoc>
    </>
  );
}
