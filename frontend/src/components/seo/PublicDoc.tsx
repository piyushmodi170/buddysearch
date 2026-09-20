import React from 'react';
import Link from 'next/link';

export function PublicDoc({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F9EFEF] text-[#3D4550]">
      <header className="bg-white border-b border-[#f0e0e0]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-[#F96566] text-lg">Buddy Search</Link>
          <nav className="flex gap-4 text-sm font-medium">
            <Link href="/about" className="hover:text-[#F96566]">About</Link>
            <Link href="/answers" className="hover:text-[#F96566]">Answers</Link>
            <Link href="/signup" className="hover:text-[#F96566]">Join</Link>
            <Link href="/login" className="hover:text-[#F96566]">Log in</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        <div className="space-y-4 text-[15px] leading-7">{children}</div>
      </main>
    </div>
  );
}
