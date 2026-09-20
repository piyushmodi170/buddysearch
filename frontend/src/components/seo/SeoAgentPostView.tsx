import React from 'react';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { blogPath } from '@/lib/blog';
import { SITE, absoluteUrl } from '@/lib/seo';
import type { SeoAgentPublicArticle } from '@/lib/seo-agent-posts';

function jsonLd(post: SeoAgentPublicArticle) {
  const url = absoluteUrl(blogPath(post.slug));
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: SITE.language,
      url,
      mainEntityOfPage: url,
      image: post.imageUrl || undefined,
      author: { '@type': 'Organization', name: post.author || SITE.name, url: SITE.url },
      publisher: {
        '@type': 'Organization',
        name: SITE.name,
        url: SITE.url,
        logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') },
      },
      keywords: post.tags.join(', '),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  ];
}

export function SeoAgentPostView({ post }: { post: SeoAgentPublicArticle }) {
  return (
    <>
      <JsonLd data={jsonLd(post)} />
      <PublicDoc title={post.title}>
        <p className="text-sm text-[#7a8494]">
          {post.category} · {post.date} · {post.readTimeMinutes} min read · {post.author} ·{' '}
          <Link className="text-[#F96566] font-semibold" href="/blog">
            All guides
          </Link>
        </p>
        {post.description ? <p className="aeo-direct text-lg font-medium">{post.description}</p> : null}
        {post.imageUrl ? (
          // SEO Agent cover URLs are arbitrary hosts; next/image would need a host allowlist.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imageUrl} alt="" className="w-full rounded-lg my-4" />
        ) : null}
        <article
          className="prose prose-lg max-w-none prose-headings:text-[#3D4550] prose-p:text-[#3D4550] prose-a:text-[#F96566] prose-img:rounded-lg prose-li:marker:text-[#F96566]"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
        {post.tags.length ? (
          <p className="pt-6 text-sm text-[#7a8494]">{post.tags.join(' · ')}</p>
        ) : null}
        <p className="pt-4">
          Ready to try this?{' '}
          <Link className="text-[#F96566] font-semibold" href="/signup">
            Create a Buddy Search account
          </Link>
          .
        </p>
      </PublicDoc>
    </>
  );
}
