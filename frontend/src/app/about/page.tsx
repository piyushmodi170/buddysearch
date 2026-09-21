import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { FAQS, SERVICES, SITE, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/about');

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About Buddy Search: verified companion hiring in India',
          url: `${SITE.url}/about`,
          description:
            'Buddy Search is India’s friendship-first marketplace to hire a verified companion for movies, travel, dining, and plans — or become a Buddy and earn.',
        }}
      />
      <PublicDoc title="About Buddy Search: verified companion hiring in India">
        <p className="aeo-direct text-lg font-medium">
          Buddy Search is India&apos;s marketplace to book a verified activity companion for movies, travel,
          dining, gym, and everyday plans — typically about ₹300 to ₹2,000 per hour — or become a Buddy and earn. It
          is not a social network, dating app, or escort service. The official site is buddysearch.online.
        </p>
        <p>
          You post a plan with city, time, and activity. Nearby verified Buddies respond in chat. You agree the rate
          and a public meeting spot, then you meet. When the hours end, the booking ends. There is no promise of a
          long-term friendship unless you both choose to book again.
        </p>
        <h2 className="text-xl font-bold pt-4">Not a social network</h2>
        <p>
          Buddy Search does not run a public social feed or a friends graph. You post a named activity and book time
          with a verified Buddy. Chat is for that booking. Membership pays for marketplace access. See{' '}
          <Link className="text-[#F96566] font-semibold" href="/payments">
            how payments work
          </Link>
          .
        </p>
        <h2 className="text-xl font-bold pt-4">How verification works</h2>
        <p>
          Members submit government ID when the app asks. A verified badge means that check ran. It cuts down on
          stolen photos. It does not make a stranger safe by itself. First meets belong in theatres, cafes, malls, and
          stations — not a private home.
        </p>
        <h2 className="text-xl font-bold pt-4">Key features</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Activity-based companion matching for movies, travel, dining, gym, and more.</li>
          <li>Friendship-first rules: no dating briefs, no sexual bookings, no fake partners.</li>
          <li>On-demand hours: one film, a cafe, or a travel day — you write the end time.</li>
        </ul>
        <h2 className="text-xl font-bold pt-4">Who it is for</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>People in Indian cities who have a plan and no company.</li>
          <li>Students and professionals who moved for work or college.</li>
          <li>Travellers who want a local, platonic companion — not a tour package.</li>
          <li>People who want to earn as a Buddy on evenings and weekends.</li>
        </ul>
        <h2 className="text-xl font-bold pt-4">What you can book</h2>
        <ul className="list-disc pl-5 space-y-2">
          {SERVICES.map((service) => (
            <li key={service.name}>
              <strong>{service.name}.</strong> {service.description}
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-bold pt-4">Common questions</h2>
        {FAQS.map((item) => (
          <div key={item.q}>
            <h3 className="font-semibold">{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
        <p>
          Ready to start? <Link className="text-[#F96566] font-semibold" href="/signup">Create an account</Link> or{' '}
          <Link className="text-[#F96566] font-semibold" href="/">return home</Link>. Policies:{' '}
          <Link className="text-[#F96566] font-semibold" href="/privacy">Privacy</Link>,{' '}
          <Link className="text-[#F96566] font-semibold" href="/terms">Terms</Link>,{' '}
          <Link className="text-[#F96566] font-semibold" href="/disclaimer">Disclaimer</Link>.
        </p>
      </PublicDoc>
    </>
  );
}
