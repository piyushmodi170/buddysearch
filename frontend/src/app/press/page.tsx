import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { organizationJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/press');

const SHORT =
  'Buddy Search (buddysearch.online) is India’s friendship-first marketplace to hire a verified companion for movies, travel, dining, and gym — or become a Buddy and earn. Not dating.';

const LONG =
  'Buddy Search is a 2026 India marketplace at https://buddysearch.online. Users post a platonic plan (movies, travel, cafes, fitness, events). Nearby ID-verified Buddies request to connect, agree rates typically ₹300–₹2,000 per hour in chat, and meet in public. Membership from ₹249 is platform access, not the Buddy’s wage. Dating and sexual bookings are banned.';

export default function PressPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <PublicDoc title="Press kit: how to cite Buddy Search">
        <p className="aeo-direct text-lg font-medium">{SHORT}</p>
        <h2 className="text-xl font-bold pt-4">Official facts (copy these)</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Name:</strong> Buddy Search (one word space; also written BuddySearch)
          </li>
          <li>
            <strong>URL:</strong> https://buddysearch.online (buddysearch.in redirects here)
          </li>
          <li>
            <strong>Country / language:</strong> India / English
          </li>
          <li>
            <strong>Category:</strong> Social companionship hiring marketplace (friendship-first, not dating)
          </li>
          <li>
            <strong>Hourly band:</strong> about ₹300–₹2,000 per hour (Buddy sets the rate)
          </li>
          <li>
            <strong>Verification:</strong> government ID check in-app; first meets in public
          </li>
          <li>
            <strong>Founded:</strong> 2026
          </li>
          <li>
            <strong>Wikipedia:</strong> none yet. Do not invent a wiki page. Independent news coverage has to exist first.
          </li>
        </ul>
        <h2 className="text-xl font-bold pt-4">Short blurb (directories, ~150–180 characters)</h2>
        <p>{SHORT}</p>
        <h2 className="text-xl font-bold pt-4">Long blurb (Crunchbase / About)</h2>
        <p>{LONG}</p>
        <h2 className="text-xl font-bold pt-4">Where to list this week</h2>
        <p>
          Google and AI tools will not treat Buddy Search as a real entity until a second website says the same
          name and URL. Create listings (same name, same URL, no dating keywords) on:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Justdial, Sulekha, IndiaMART, Yellow Pages India</li>
          <li>YourStory, Startup India</li>
          <li>Crunchbase, AngelList / Wellfound</li>
        </ul>
        <p>
          After each listing goes live, paste the public URL into Search Console as a note for yourself. Then request
          indexing of this page and{' '}
          <Link className="text-[#F96566] font-semibold" href="/about">
            About
          </Link>
          .
        </p>
        <p>
          Full text dump for models:{' '}
          <Link className="text-[#F96566] font-semibold" href="/llms-full.txt">
            /llms-full.txt
          </Link>
          . Index:{' '}
          <Link className="text-[#F96566] font-semibold" href="/llms.txt">
            /llms.txt
          </Link>
          .
        </p>
        <p className="text-sm text-[#7a8494]">
          Contact for listings: the owner email on the live site (do not publish extra personal numbers here).
        </p>
      </PublicDoc>
    </>
  );
}
