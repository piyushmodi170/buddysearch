import React from 'react';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { blogPath, relatedPosts, type BlogPost } from '@/lib/blog';
import { SITE, absoluteUrl } from '@/lib/seo';

export function blogJsonLd(post: BlogPost) {
  const url = absoluteUrl(blogPath(post.slug));
  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: SITE.language,
    url,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') },
    },
    keywords: post.keywords.join(', '),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.aeo-direct', '.aeo-steps', '.aeo-faq'],
    },
  };
  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: post.query,
    description: post.directAnswer,
    inLanguage: SITE.language,
    step: post.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };
  return [article, howTo, faq, crumbs];
}

function Section({ section }: { section: BlogPost['sections'][number] }) {
  return (
    <section>
      <h2 className="text-xl font-bold pt-6">{section.heading}</h2>
      {section.paragraphs.map((text) => (
        <p key={text.slice(0, 48)}>{text}</p>
      ))}
      {section.bullets?.length ? (
        <ul className="list-disc pl-5 space-y-2">
          {section.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {section.subheadings?.map((sub) => (
        <div key={sub.heading}>
          <h3 className="text-lg font-semibold pt-3">{sub.heading}</h3>
          {sub.paragraphs.map((text) => (
            <p key={text.slice(0, 48)}>{text}</p>
          ))}
          {sub.bullets?.length ? (
            <ul className="list-disc pl-5 space-y-2">
              {sub.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export function BlogPostView({ post }: { post: BlogPost }) {
  const related = relatedPosts(post);
  return (
    <>
      <JsonLd data={blogJsonLd(post)} />
      <PublicDoc title={post.title}>
        <p className="text-sm text-[#7a8494]">
          {post.category} · {post.date} ·{' '}
          <Link className="text-[#F96566] font-semibold" href="/blog">
            All guides
          </Link>
        </p>
        <p className="aeo-direct text-lg font-medium">{post.directAnswer}</p>

        <h2 className="text-xl font-bold pt-6">Explanation</h2>
        {post.sections.map((section) => (
          <Section key={section.heading} section={section} />
        ))}

        <h2 className="text-xl font-bold pt-6">Steps</h2>
        <ol className="aeo-steps list-decimal pl-5 space-y-3">
          {post.steps.map((step) => (
            <li key={step.name}>
              <h3 className="font-semibold inline">{step.name}. </h3>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>

        {post.table ? (
          <>
            <h2 className="text-xl font-bold pt-6">{post.table.caption}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[#f0e0e0] bg-white">
                <thead>
                  <tr>
                    {post.table.headers.map((header) => (
                      <th key={header} className="text-left p-3 border-b border-[#f0e0e0]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {post.table.rows.map((row) => (
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

        <h2 className="text-xl font-bold pt-6">FAQs</h2>
        <dl className="aeo-faq space-y-4">
          {post.faqs.map((item) => (
            <div key={item.q}>
              <dt>
                <h3 className="font-semibold">{item.q}</h3>
              </dt>
              <dd className="m-0">{item.a}</dd>
            </div>
          ))}
        </dl>

        {related.length ? (
          <>
            <h2 className="text-xl font-bold pt-6">Read next</h2>
            <ul className="list-disc pl-5 space-y-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link className="text-[#F96566] font-semibold" href={blogPath(item.slug)}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
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
