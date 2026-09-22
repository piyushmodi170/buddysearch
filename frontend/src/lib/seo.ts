import type { Metadata } from 'next';

import { AEO_ARTICLES, aeoPath } from './aeo';
import { BLOG_POSTS, blogPath } from './blog';

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
  tagline: "India's activity companion marketplace",
  description:
    'Buddy Search is an India marketplace to book a verified activity companion for movies, travel, dining, gym, and plans — or become a Buddy and earn. Free to join. Not dating.',
  keywords: [
    'buddy search',
    'Buddy Search',
    'buddysearch.online',
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
    'Buddy Search | Hire a Buddy in India (Official Site)',
    'Buddy Search is India’s site to hire a verified buddy for movies, travel, or gym. About ₹300–₹2,000/hr. Friendship-first, not dating.',
    true,
    SITE.keywords,
  ),
  '/about': page(
    '/about',
    'About Buddy Search: verified companion hiring in India',
    'Buddy Search is India’s friendship-first marketplace to hire a verified companion for movies, travel, dining, and plans — or become a Buddy and earn. Not dating.',
    true,
  ),
  '/privacy': page(
    '/privacy',
    'Privacy Policy | Buddy Search India',
    'How Buddy Search collects account, chat, verification, and payment data for members in India, who we share it with, and how to request deletion.',
    true,
  ),
  '/terms': page(
    '/terms',
    'Terms of Service | Buddy Search India',
    'Rules for hiring a buddy or becoming a Buddy in India: platonic activity plans only, membership vs activity fees, verification, bans, and Indian law.',
    true,
  ),
  '/disclaimer': page(
    '/disclaimer',
    'Disclaimer | Buddy Search safety and liability',
    'Buddy Search is a technology platform. We do not employ companions. ID checks reduce risk. You decide whether to meet. Public first meets, in-app chat, report tools.',
    true,
  ),
  '/payments': page(
    '/payments',
    'How money works — UPI membership',
    'Buddy Search collects membership with UPI. Razorpay cards are not available for companion hiring. Hourly fees stay between members.',
    true,
  ),
  '/press': page(
    '/press',
    'Press kit: how to cite Buddy Search',
    'Official name, URL, and directory copy for Buddy Search (buddysearch.online). No Wikipedia article yet. Contact for listings.',
    true,
  ),
  '/contact': page(
    '/contact',
    'Contact Buddy Search',
    'Email Buddy Search in India: piyushmodi170@gmail.com. Safety reports, press, and directory listings. Official site buddysearch.online.',
    true,
  ),
  '/authors': page(
    '/authors',
    'Buddy Search authors',
    'Who writes Buddy Search guides: the in-house editorial desk in India. Platonic companion hiring, KYC checks, UPI fees.',
    true,
  ),
  '/authors/editorial': page(
    '/authors/editorial',
    'Buddy Search Editorial',
    'Buddy Search Editorial writes India companion-hiring guides since 2026. ID checks, public meets, ₹300–₹2,000/hr. Not dating.',
    true,
  ),
  '/login': page(
    '/login',
    'Log in to Buddy Search',
    'Log in to Buddy Search to hire a movie buddy, travel companion, or activity partner in India.',
    false,
  ),
  '/signup': page(
    '/signup',
    'Create your Buddy Search account',
    'Join Buddy Search to find a buddy in India or become a verified companion and earn on your terms.',
    false,
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
  '/blog': page(
    '/blog',
    'Buddy Search blog: hire a buddy, travel companion, and more',
    'Detailed SEO guides on hiring a buddy in India, movie buddy hire, travel companions, safety, pricing, and becoming a Buddy.',
    true,
    SITE.keywords,
  ),
  ...Object.fromEntries(
    AEO_ARTICLES.map((article) => [
      aeoPath(article.slug),
      page(aeoPath(article.slug), article.title, article.description, true, article.keywords),
    ]),
  ),
  ...Object.fromEntries(
    BLOG_POSTS.map((post) => [
      blogPath(post.slug),
      page(blogPath(post.slug), post.title, post.description, true, post.keywords),
    ]),
  ),
};

export const PUBLIC_SITEMAP_PATHS = Object.values(PAGE_SEO)
  .filter((entry) => entry.index)
  .map((entry) => entry.path);

/** Stable lastmod so utility URLs are not stamped "today" on every crawl. */
export function sitemapLastModified(path: string): Date {
  if (
    path === '/' ||
    path === '/about' ||
    path === '/privacy' ||
    path === '/terms' ||
    path === '/disclaimer' ||
    path === '/payments' ||
    path === '/press' ||
    path === '/contact' ||
    path === '/authors' ||
    path === '/authors/editorial' ||
    path === '/answers' ||
    path === '/blog'
  ) {
    return new Date('2026-09-21T00:00:00.000Z');
  }
  const post = BLOG_POSTS.find((item) => blogPath(item.slug) === path);
  if (post) return new Date(`${post.date}T00:00:00.000Z`);
  return new Date('2026-09-20T00:00:00.000Z');
}

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is Buddy Search?',
    a: 'Buddy Search is an India marketplace to book a verified activity companion for movies, travel, dining, gym, and plans, or become a Buddy and earn. It is not a social network or dating app.',
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
    a: 'Buddies set their own rates. Payment terms are agreed in the in-app chat before you meet. Platform membership is paid with UPI. Activity fees are between you and your Buddy.',
  },
  {
    q: 'Is it safe to hire a companion?',
    a: 'Buddies go through ID verification. Chat stays in-app until you choose to meet, and you can report profiles that break the rules.',
  },
  {
    q: 'How much does Buddy Search cost?',
    a: 'Membership is Basic ₹249, Standard ₹349, Premium ₹449, and Star ₹649, paid with UPI (cards are not available). The Buddy’s activity fee is separate and agreed in chat, typically about ₹300 to ₹2,000 per hour. Tickets, food, and cabs are extra unless you both write otherwise.',
  },
  {
    q: 'How does ID verification work?',
    a: 'Members submit government ID as asked in the app. A verification badge means that check was completed. It lowers impersonation risk. It does not guarantee behaviour. First meets should still be in public.',
  },
  {
    q: 'Which cities does Buddy Search cover?',
    a: 'Buddy Search is built for India. Plans are posted by city and neighbourhood — Bangalore, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune, Kolkata, and other towns where members are active. Supply is whoever is verified and nearby, not a guaranteed roster in every pin code.',
  },
  {
    q: 'What if a meet goes wrong?',
    a: 'Leave the venue, tell a trusted person, and report the profile in the app. Buddy Search can suspend accounts. We do not send staff to the meet. For a crime, contact local police. Activity fees are between you and the Buddy.',
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
  return page(clean, titled, `${titled} on Buddy Search, India’s activity companion marketplace.`, false);
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
    alternateName: [SITE.brand, 'buddysearch.online'],
    url: SITE.url,
    logo: absoluteUrl('/logo.png'),
    description: SITE.description,
    foundingDate: '2026',
    email: 'piyushmodi170@gmail.com',
    address: { '@type': 'PostalAddress', addressCountry: 'IN' },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'piyushmodi170@gmail.com',
      contactType: 'customer support',
      areaServed: 'IN',
      availableLanguage: 'English',
      url: absoluteUrl('/contact'),
    },
    slogan: "India's marketplace to book a verified activity companion",
    knowsAbout: ['rent a friend India', 'movie buddy', 'travel companion', 'gym buddy', 'part-time companion jobs'],
    areaServed: { '@type': 'Country', name: SITE.country },
    knowsLanguage: 'en-IN',
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    alternateName: [SITE.brand, 'buddysearch.online'],
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
      '@type': 'WebPage',
      name: SITE.name,
      url: SITE.url,
      datePublished: '2026-09-19',
      dateModified: '2026-09-22',
      description: PAGE_SEO['/'].description,
      inLanguage: SITE.language,
      author: { '@type': 'Person', name: 'Buddy Search Editorial', url: absoluteUrl('/authors/editorial') },
      isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE.name,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '249',
        highPrice: '649',
        priceCurrency: 'INR',
        offerCount: '4',
      },
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

Buddy Search (BuddySearch) is an activity companion marketplace for ${SITE.country} (${SITE.language}).
The official site is [buddysearch.online](${absoluteUrl('/')}). [buddysearch.in](https://buddysearch.in) redirects to [buddysearch.online](https://buddysearch.online).
It is a membership marketplace for friendship-first activity bookings: people book verified companions for shared activities, or become a Buddy and earn. It is not a social network, dating app, or escort service.

## Site

- [Home](${absoluteUrl('/')}): Buddy Search homepage
- [About](${absoluteUrl('/about')}): What Buddy Search is
- [Answers](${absoluteUrl('/answers')}): Short voice-search answers
- [Blog](${absoluteUrl('/blog')}): Detailed guides
${BLOG_POSTS.map((post) => `- [${post.title}](${absoluteUrl(blogPath(post.slug))})`).join('\n')}
${AEO_ARTICLES.map((article) => `- [${article.query}](${absoluteUrl(aeoPath(article.slug))})`).join('\n')}
- [Create account](${absoluteUrl('/signup')})
- [Log in](${absoluteUrl('/login')})
- [Privacy](${absoluteUrl('/privacy')})
- [Terms](${absoluteUrl('/terms')})
- [How payments work](${absoluteUrl('/payments')})
- [Press kit](${absoluteUrl('/press')})
- [Contact](${absoluteUrl('/contact')}): piyushmodi170@gmail.com, India
- [Authors](${absoluteUrl('/authors/editorial')}): in-house editorial desk
- [LLM index](${absoluteUrl('/llms.txt')})
- [LLM full content](${absoluteUrl('/llms-full.txt')})

Member tools (login required, not for indexing): Find a Buddy, Hire feed, Messages, Membership.

## Topics

${SERVICES.map((s) => `- ${s.name}: ${s.description}`).join('\n')}

## Target customers

- People in India looking for company for movies, dining, events, or travel
- Young professionals and students new to a city
- Anyone who wants a verified, platonic activity partner

## Competitive advantage

Buddy Search offers a membership marketplace in India where anyone can book a verified activity companion — movie, gym, travel, cafe — without using a dating or social network product.

## Optional sitemap

- [Sitemap](${absoluteUrl('/sitemap.xml')})
- [Robots](${absoluteUrl('/robots.txt')})
`;
}

export function isIndexablePath(pathname: string) {
  return resolvePage(pathname).index;
}
