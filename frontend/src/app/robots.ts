import type { MetadataRoute } from 'next';
import { PRIVATE_PREFIXES, SITE } from '@/lib/seo';

const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'GoogleOther',
  'Applebot',
  'Applebot-Extended',
  'Bingbot',
  'Slurp',
  'DuckDuckBot',
  'Bytespider',
  'CCBot',
  'meta-externalagent',
];

export default function robots(): MetadataRoute.Robots {
  const disallow = PRIVATE_PREFIXES.map((path) => path);
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
