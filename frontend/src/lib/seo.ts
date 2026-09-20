import type { Metadata } from 'next';

import { AEO_ARTICLES, aeoPath } from './aeo';

export const SITE_URL = (() => {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || 'https://buddysearch.online').replace(/\/$/, '');
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase();
    if (host === 'buddysearch.in' || host === 'www.buddysearch.in' || host === 'www.buddysearch.online') {
      return 'https://buddysearch.online';
    }
    return `${url.protocol}//${url.host}`.replace(/\/$/, '');
  } catch {
    return 'https://buddysearch.online';
  }
})();

export const SITE = {
  name: 'Buddy Search',
  brand: 'BuddySearch',
  url: SITE_URL,
  locale: 'en_IN',
  language: 'en-IN',
  country: 'India',
  domain: 'buddysearch.online',
  tagline: "India's #1 social companionship hiring platform",
  description:
    'Buddy Search is a friendship-first platform in India to hire a verified companion for movies, travel, dining, events, and everyday plans — or become a Buddy and earn.',
  keywords: [
    'rent a friend India',
    'friend for hire',
    'find travel partners',
    'find a travel buddy',
    'travel buddy find',
    'india travel partner',
    'find a buddy',
    'india travel buddy',
    'indian travel buddy',
    'movie buddy hire',
    'social companion booking',
    'activity partner rental',
    'friendship companionship platform',
  ],
};

export const PRIVATE_PREFIXES = [
  '/admin',
  '/onboarding',
  '/dashboard',
  '/discover',
  '/find',
  '/hire',
  '/messages',
  '/notifications',
  '/posts',
  '/requests',
  '/profile',
  '/account',
  '/membership',
  '/help',
] as const;

type PageSeo = {
  title: string;
  description: string;
  path: string;
  index: boolean;
  keywords?: string[];
};

const page = (
  path: string,
  title: string,
  description: string,
  index: boolean,
  keywords?: string[],
): PageSeo => ({ path, title, description, index, keywords });

/** Catalog of every App Router page. Unknown paths inherit from the longest matching prefix. */
export const PAGE_SEO: Record<string, PageSeo> = {
  '/': page(
    '/',
    "Buddy Search — India's #1 social companionship hiring platform",
    SITE.description,
    true,
    SITE.keywords,
  ),
  '/about': page(
    '/about',
    'About Buddy Search',
    'Buddy Search connects people in India with verified companions for activities, adventures, and everyday moments — friendship-first, always.',
    true,
  ),
  '/privacy': page(
    '/privacy',
    'Privacy Policy',
    'How Buddy Search collects, uses, and protects personal information for members in India.',
    true,
  ),
  '/terms': page(
    '/terms',
    'Terms of Service',
    'The terms that govern using Buddy Search to hire a companion or become a Buddy in India.',
    true,
  ),
  '/disclaimer': page(
    '/disclaimer',
    'Disclaimer',
    'Buddy Search is a technology platform that connects people in India for platonic, activity-based companionship.',
    true,
  ),
  '/login': page(
    '/login',
    'Log in',
    'Log in to Buddy Search to hire a movie buddy, travel companion, or activity partner in India.',
    true,
  ),
  '/signup': page(
    '/signup',
    'Create your Buddy Search account',
    'Join Buddy Search to find a buddy in India or become a verified companion and earn on your terms.',
    true,
  ),
  '/forgot-password': page(
    '/forgot-password',
    'Reset your password',
    'Request a Buddy Search password reset link for your account.',
    false,
  ),
  '/reset-password': page(
    '/reset-password',
    'Choose a new password',
    'Set a new password for your Buddy Search account.',
    false,
  ),
  '/verify-email': page(
    '/verify-email',
    'Verify your email',
    'Confirm your email address to finish creating your Buddy Search account.',
    false,
  ),
  '/onboarding': page('/onboarding', 'Complete your profile', 'Finish your Buddy Search profile.', false),
  '/find': page('/find', 'Find a Buddy', 'Browse verified companions near you in India.', false),
  '/hire': page('/hire', 'Hire feed', 'See activity plans and hire a buddy on Buddy Search.', false),
  '/discover': page('/discover', 'Discover', 'Discover people and plans on Buddy Search.', false),
  '/dashboard': page('/dashboard', 'Home', 'Your Buddy Search home.', false),
  '/messages': page('/messages', 'Messages', 'Chat with companions on Buddy Search.', false),
  '/notifications': page('/notifications', 'Notifications', 'Your Buddy Search alerts.', false),
  '/posts': page('/posts', 'My posts', 'Manage the plans you posted on Buddy Search.', false),
  '/requests': page('/requests', 'Requests', 'Incoming and outgoing Buddy Search requests.', false),
  '/profile': page('/profile', 'Profile', 'Edit your Buddy Search profile.', false),
  '/account': page('/account', 'Account', 'Manage your Buddy Search account.', false),
  '/membership': page('/membership', 'Membership', 'Choose a Buddy Search membership plan.', false),
  '/help': page('/help', 'Help', 'Buddy Search frequently asked questions.', false),
  '/admin': page('/admin', 'Admin', 'Buddy Search owner admin.', false),
  '/answers': page(
    '/answers',
    'Answers about hiring a buddy in India',
    'Short, voice-search answers: how to hire a movie buddy, find a travel companion, or rent a friend in India on Buddy Search.',
    true,
    SITE.keywords,
  ),
  ...Object.fromEntries(
    AEO_ARTICLES.map((article) => [
      aeoPath(article.slug),
      page(aeoPath(article.slug), article.title, article.description, true, article.keywords),
    ]),
  ),
};

export const PUBLIC_SITEMAP_PATHS = Object.values(PAGE_SEO)
  .filter((entry) => entry.index)
  .map((entry) => entry.path);

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is Buddy Search?',
    a: 'Buddy Search is India’s friendship-first social companionship hiring platform. You can hire a verified companion for movies, travel, dining, events, and everyday plans, or become a Buddy and earn.',
  },
  {
    q: 'Where can I hire a movie buddy in India?',
    a: 'Create a Buddy Search account, open Find a Buddy, and filter for Movie Buddy. Verified companions in cities across India accept plans for films, concerts, and nights out.',
  },
  {
    q: 'Is Buddy Search a dating app?',
    a: 'No. Buddy Search is built for platonic companionship and shared activities — friendship-first, not dating.',
  },
  {
    q: 'How do Buddies get paid?',
    a: 'Buddies set their own rates. Payment terms are agreed in the in-app chat before you meet. Membership unlocks posting plans and discovery; activity fees are between you and your Buddy.',
  },
  {
    q: 'Is it safe to hire a companion?',
    a: 'Buddies go through ID verification. Chat stays in-app until you choose to meet, and you can report profiles that break the rules.',
  },
];

export const SERVICES = [
  { name: 'Movie Buddy Hire', description: 'Company for films, premieres, and cinema outings across India.' },
  { name: 'Travel Companion Services', description: 'A trusted travel buddy for trips, trains, and new cities.' },
  { name: 'Social Companion Booking', description: 'Friendly company for dinners, events, and everyday plans.' },
  { name: 'Activity Partner Rental', description: 'A partner for gym, gaming, shopping, dance, and hobbies.' },
  { name: 'Friendship Companionship Platform', description: 'A membership platform to find or become a verified Buddy.' },
];

const resolvePage = (pathname: string): PageSeo => {
  const clean = pathname.split('?')[0].replace(/\/$/, '') || '/';
  if (PAGE_SEO[clean]) return PAGE_SEO[clean];
  const prefix = PRIVATE_PREFIXES.find((item) => clean === item || clean.startsWith(`${item}/`));
  if (prefix && PAGE_SEO[prefix]) {
    return { ...PAGE_SEO[prefix], path: clean, index: false };
  }
  const leaf = clean.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Page';
  const titled = leaf.replace(/\b\w/g, (c) => c.toUpperCase());
  return page(clean, titled, `${titled} on Buddy Search, India’s social companionship platform.`, false);
};

export const absoluteUrl = (path = '/') => {
  if (path.startsWith('http')) return path;
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
};

export function pageMetadata(pathname: string): Metadata {
  const entry = resolvePage(pathname);
  const url = absoluteUrl(entry.path);
  const image = absoluteUrl('/activities-on-buddy-search.webp');
  return {
    title: entry.title.includes('Buddy Search') ? { absolute: entry.title } : entry.title,
    description: entry.description,
    keywords: entry.keywords || SITE.keywords,
    alternates: { canonical: url },
    robots: entry.index
      ? { index: true, follow: true, googleBot: { index: true, follow: true } }
      : { index: false, follow: false, googleBot: { index: false, follow: false } },
    openGraph: {
      type: 'website',
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title: entry.title,
      description: entry.description,
      images: [{ url: image, alt: 'Friends enjoying activities together with Buddy Search' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: entry.title,
      description: entry.description,
      images: [image],
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    alternateName: SITE.brand,
    url: SITE.url,
    logo: absoluteUrl('/logo.png'),
    description: SITE.description,
    sameAs: ['https://buddysearch.online', 'https://buddysearch.in'],
    areaServed: { '@type': 'Country', name: SITE.country },
    knowsLanguage: 'en-IN',
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    alternateName: [SITE.brand, 'buddysearch.online', 'buddysearch.in'],
    url: SITE.url,
    inLanguage: SITE.language,
    description: SITE.description,
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  };
}

export function homeJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE.name,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '249', priceCurrency: 'INR' },
      description: SITE.description,
      url: SITE.url,
      inLanguage: SITE.language,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    ...SERVICES.map((service) => ({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      areaServed: { '@type': 'Country', name: SITE.country },
    })),
  ];
}

export function llmsTxt() {
  return `# ${SITE.name}

> ${SITE.description}

Buddy Search (BuddySearch) is a social companionship platform for ${SITE.country} (${SITE.language}).
The official site is ${absoluteUrl('/')}. buddysearch.in redirects to buddysearch.online.
It is friendship-first: people hire verified companions for shared activities, or become a Buddy and earn. It is not a dating app.

## Site

- Home: ${absoluteUrl('/')}
- About: ${absoluteUrl('/about')}
- Answers: ${absoluteUrl('/answers')}
${AEO_ARTICLES.map((article) => `- ${article.query}: ${absoluteUrl(aeoPath(article.slug))}`).join('\n')}
- Create account: ${absoluteUrl('/signup')}
- Log in: ${absoluteUrl('/login')}
- Privacy: ${absoluteUrl('/privacy')}
- Terms: ${absoluteUrl('/terms')}
- LLM index: ${absoluteUrl('/llms.txt')}

Member tools (login required, not for indexing): Find a Buddy, Hire feed, Messages, Membership.

## Topics

${SERVICES.map((s) => `- ${s.name}: ${s.description}`).join('\n')}

## Target customers

- People in India looking for company for movies, dining, events, or travel
- Young professionals and students new to a city
- Anyone who wants a verified, platonic activity partner

## Competitive advantage

Buddy Search offers a safe, friendship-first platform in India where anyone can hire a real, relatable companion for any activity — making social experiences accessible regardless of their personal social circle.

## Optional sitemap

- ${absoluteUrl('/sitemap.xml')}
- ${absoluteUrl('/robots.txt')}
`;
}

export function isIndexablePath(pathname: string) {
  return resolvePage(pathname).index;
}
