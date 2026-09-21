import type { MetadataRoute } from 'next';
import { PUBLIC_SITEMAP_PATHS, SITE, sitemapLastModified } from '@/lib/seo';
import { blogPath } from '@/lib/blog';
import { fetchPublishedSeoArticles } from '@/lib/seo-agent-posts';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const existing = new Set(PUBLIC_SITEMAP_PATHS);
  const agent = await fetchPublishedSeoArticles();
  const extra = agent
    .map((post) => blogPath(post.slug))
    .filter((path) => !existing.has(path));

  return [...PUBLIC_SITEMAP_PATHS, ...extra].map((path) => ({
    url: `${SITE.url}${path === '/' ? '' : path}`,
    lastModified: sitemapLastModified(path),
    changeFrequency: path === '/' ? 'weekly' : path.startsWith('/blog/') ? 'monthly' : 'yearly',
    priority: path === '/' ? 1 : path === '/blog' || path === '/about' ? 0.8 : path.startsWith('/blog/') ? 0.7 : 0.5,
  }));
}
