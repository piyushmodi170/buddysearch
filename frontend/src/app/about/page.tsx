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
          name: 'About Buddy Search',
          url: `${SITE.url}/about`,
          description: 'Buddy Search connects people in India with verified companions for activities, adventures, and everyday moments — friendship-first, always.',
        }}
      />
      <PublicDoc title="About Buddy Search">
        <p>
          Buddy Search is India&apos;s #1 social companionship hiring platform. It connects people with real
          companions for activities, adventures, and everyday moments.
        </p>
        <p>
          The platform operates on a friendship-first philosophy: find buddies for movies, exploring new places,
          or simply spending time together. It bridges loneliness and meaningful social connection with verified,
          relatable companions — without depending on your existing social circle.
        </p>
        <h2 className="text-xl font-bold pt-4">Key features</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Activity-based companion matching for movies, travel, dining, and more.</li>
          <li>Friendship-first design that prioritizes genuine social connection over transactional dating.</li>
          <li>On-demand companionship for one-time events or recurring activities.</li>
        </ul>
        <h2 className="text-xl font-bold pt-4">Who it is for</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Introverted people in India who want company for movies, dining, or events.</li>
          <li>Young professionals and students who have moved to a new city.</li>
          <li>Anyone going through a life transition who wants casual social support.</li>
          <li>Adventure seekers looking for a like-minded buddy without a formal group tour.</li>
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
          <Link className="text-[#F96566] font-semibold" href="/">return home</Link>.
        </p>
      </PublicDoc>
    </>
  );
}
