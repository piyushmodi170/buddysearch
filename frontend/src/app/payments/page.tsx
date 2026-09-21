import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { CONTACT } from '@/lib/eeat';
import { SITE, PAGE_SEO, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/payments');

export default function PaymentsPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'How Buddy Search membership payments work',
          url: `${SITE.url}/payments`,
          datePublished: '2026-09-21',
          dateModified: '2026-09-21',
          description: PAGE_SEO['/payments'].description,
        }}
      />
      <PublicDoc title="How Buddy Search membership payments work">
        <p className="aeo-direct text-lg font-medium">
          Buddy Search is a membership marketplace in India for booking a verified activity companion (movie, gym,
          travel, cafe). It is not a social network, dating app, matrimonial site, or escort directory. Checkout — when
          a payment provider is enabled — collects only platform membership (from ₹249). Hourly companion fees are
          agreed in chat and paid between members, usually over UPI. We do not take that hourly fee through card
          checkout.
        </p>

        <h2 className="text-xl font-bold pt-4">What the product is</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>A two-sided marketplace: post a named activity plan, or offer time as a Buddy.</li>
          <li>Bookings have a city, activity, and end time. When the hours end, the booking ends.</li>
          <li>In-app chat exists only to agree the plan, rate, and a public meeting spot.</li>
          <li>There is no friends graph, public social feed, or “find people to date” flow.</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">What we are not</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Not a social networking platform (no follower graph, no public timeline).</li>
          <li>Not a dating, match-making, or matrimonial product.</li>
          <li>Not an escort, adult, or sexual-services directory. Those bookings are banned.</li>
          <li>Not a friend-finder for romance. Plans are movies, travel, gym, cafe, and similar activities.</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">What a payment provider would collect</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Basic / Standard / Premium / Star membership for discovery and posting tools (from ₹249).</li>
          <li>That fee is for software access. It is not a Buddy’s wage and not a date.</li>
          <li>Activity fees, tickets, food, and cabs are between Client and Buddy. Not on our checkout.</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">Suggested merchant category</h2>
        <p>
          For payment-partner review: personal / local activity booking marketplace and membership software. Country
          of operation: India. Contact:{' '}
          <a className="text-[#F96566] font-semibold" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
          .
        </p>
        <p>
          Related pages:{' '}
          <Link className="text-[#F96566] font-semibold" href="/about">
            About
          </Link>
          ,{' '}
          <Link className="text-[#F96566] font-semibold" href="/terms">
            Terms
          </Link>
          ,{' '}
          <Link className="text-[#F96566] font-semibold" href="/disclaimer">
            Disclaimer
          </Link>
          .
        </p>
      </PublicDoc>
    </>
  );
}
