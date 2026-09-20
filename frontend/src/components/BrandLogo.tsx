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
      <img src="/logo.png" alt="BuddySearch" className={imgClassName} width={1743} height={319} />
    </Link>
  );
}
