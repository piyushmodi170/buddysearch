'use client';
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function BrandLogo({
  href = '/hire',
  className,
  imgClassName = 'h-8 w-auto',
}: {
  href?: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link href={href} className={cn('flex items-center', className)}>
      <img
        src="/logo-nav.webp"
        alt="BuddySearch"
        className={imgClassName}
        width={437}
        height={80}
        decoding="async"
      />
    </Link>
  );
}
