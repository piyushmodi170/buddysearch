import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicDoc } from '@/components/seo/PublicDoc';
import { SITE, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/privacy');

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Privacy Policy | Buddy Search India',
          url: `${SITE.url}/privacy`,
        }}
      />
      <PublicDoc title="Privacy Policy">
        <p>Last updated: 21 September 2026. Operator: Buddy Search at {SITE.domain}.</p>
        <p className="aeo-direct text-lg font-medium">
          We collect the account, chat, verification, and payment metadata needed to run a companionship marketplace
          in India. We do not sell personal data. You can update profile fields in Account and request deletion from
          the email on the account.
        </p>
        <h2 className="text-xl font-bold pt-4">What we collect</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Account: name, email, phone, password hash or Google account id, city, and profile text.</li>
          <li>Verification: government ID images or numbers you upload when the app asks for a check.</li>
          <li>Usage: plans you post, chats, reports, device and login session cookies.</li>
          <li>Payments: membership order ids, amounts, and status from Razorpay. We do not store full card numbers.</li>
        </ul>
        <h2 className="text-xl font-bold pt-4">How we use it</h2>
        <p>
          We use this information to operate matching and chat, send OTPs and receipts, prevent fake profiles and
          abuse, and improve the product. Transactional email is required for signup and payments. Marketing email is
          only sent if you are a member and we have a lawful basis; you can unsubscribe from marketing.
        </p>
        <h2 className="text-xl font-bold pt-4">Who we share with</h2>
        <p>
          Hosting (including MongoDB and the Coolify server), email delivery, Google sign-in, and Razorpay process
          data on our behalf. They may store copies in India or other regions they operate in. We do not sell lists
          of members to advertisers. We may disclose information if Indian law requires it or to investigate a safety
          report.
        </p>
        <h2 className="text-xl font-bold pt-4">Your choices</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Edit profile fields in Account after you log in.</li>
          <li>Request account deletion by writing from the registered email via in-app Help.</li>
          <li>Cookies: login sessions and basic analytics. Blocking cookies may break sign-in.</li>
        </ul>
        <p>
          Questions about this policy: sign in and open Help, or use the contact email listed for the owner account
          on the official site buddysearch.online.
        </p>
      </PublicDoc>
    </>
  );
}
