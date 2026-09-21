import React from 'react';
import Link from 'next/link';
import { AUTHOR, CONTACT } from '@/lib/eeat';

export function CitationLinks() {
  return (
    <p className="text-sm text-[#7a8494] pt-4">
      Sources:{' '}
      <a className="text-[#F96566] font-semibold" href="https://en.wikipedia.org/wiki/Platonic_love" rel="noopener noreferrer">
        Platonic love (Wikipedia)
      </a>
      ,{' '}
      <a className="text-[#F96566] font-semibold" href="https://en.wikipedia.org/wiki/Know_your_customer" rel="noopener noreferrer">
        Know your customer (Wikipedia)
      </a>
      ,{' '}
      <a className="text-[#F96566] font-semibold" href="https://en.wikipedia.org/wiki/Unified_Payments_Interface" rel="noopener noreferrer">
        UPI (Wikipedia)
      </a>
      ,{' '}
      <a className="text-[#F96566] font-semibold" href="https://www.rbi.org.in/" rel="noopener noreferrer">
        Reserve Bank of India
      </a>
      ,{' '}
      <a className="text-[#F96566] font-semibold" href="https://consumeraffairs.nic.in/" rel="noopener noreferrer">
        Department of Consumer Affairs, Government of India
      </a>
      .
    </p>
  );
}

export function SiteContact() {
  return (
    <p className="text-sm text-[#7a8494]">
      Contact {CONTACT.operator}:{' '}
      <a className="text-[#F96566] font-semibold" href={`mailto:${CONTACT.email}`}>
        {CONTACT.email}
      </a>
      . Operated in {CONTACT.country}.{' '}
      <Link className="text-[#F96566] font-semibold" href="/contact">
        Contact page
      </Link>
      {' · '}
      <Link className="text-[#F96566] font-semibold" href={AUTHOR.path}>
        {AUTHOR.name}
      </Link>
    </p>
  );
}
