import { getApiBaseUrl } from './publicUrl';

export type SeoAgentPublicArticle = {
  id: string;
  slug: string;
  title: string;
  description: string;
  contentHtml: string;
  imageUrl: string;
  tags: string[];
  author: string;
  category: string;
  featured: boolean;
  readTimeMinutes: number;
  date: string;
  status: string;
};

function isPublished(article: SeoAgentPublicArticle): boolean {
  return article.status === 'published';
}

export async function fetchPublishedSeoArticles(): Promise<SeoAgentPublicArticle[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/blog/articles`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { articles?: SeoAgentPublicArticle[] } };
    return (json.data?.articles || []).filter((article) => article?.slug && isPublished(article));
  } catch {
    return [];
  }
}

export async function fetchPublishedSeoArticle(slug: string): Promise<SeoAgentPublicArticle | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/blog/articles/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { article?: SeoAgentPublicArticle } };
    const article = json.data?.article;
    if (!article?.slug || !isPublished(article)) return null;
    return article;
  } catch {
    return null;
  }
}
