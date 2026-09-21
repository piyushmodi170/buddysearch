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
          name: 'Buddy Search is free — how money works',
          url: `${SITE.url}/payments`,
          datePublished: '2026-09-21',
          dateModified: '2026-09-21',
          description: PAGE_SEO['/payments'].description,
        }}
      />
      <PublicDoc title="Buddy Search is free — how money works">
        <p className="aeo-direct text-lg font-medium">
          Buddy Search is free to join in India. Hire, Find, chats, and posts do not require a card or Razorpay.
          Hourly companion fees, if you agree them, are paid between members (usually UPI). We do not take that
          hourly fee. This is not a social network, dating app, or escort directory.
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

        <h2 className="text-xl font-bold pt-4">Money</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Platform access is ₹0. No membership checkout.</li>
          <li>Activity fees, tickets, food, and cabs are between Client and Buddy.</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">Contact</h2>
        <p>
          Country of operation: India.{' '}
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
