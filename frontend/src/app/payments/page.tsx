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
          name: PAGE_SEO['/payments'].title,
          url: `${SITE.url}/payments`,
          datePublished: '2026-09-21',
          dateModified: '2026-09-21',
          description: PAGE_SEO['/payments'].description,
        }}
      />
      <PublicDoc title="How money works on Buddy Search">
        <p className="aeo-direct text-lg font-medium">
          Buddy Search cannot use Razorpay cards. Aggregators reject companion hiring (friend finders,
          match-making, hiring / professional networking). Platform membership is collected with UPI
          to the owner VPA. Hourly companion fees stay between members. This is not a social network,
          dating app, or escort directory.
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
          <li>Membership: UPI to the owner ID shown on the membership page. Paste the UTR. The owner confirms it.</li>
          <li>Hire and Find remain usable while that UTR is waiting.</li>
          <li>Activity fees, tickets, food, and cabs are between Client and Buddy.</li>
          <li>Razorpay / card checkout is not offered. Resubmitting KYC as ecommerce will not get cards.</li>
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
