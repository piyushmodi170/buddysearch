'use client';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const IndiaMap = dynamic(() => import('@/components/IndiaMap'), { ssr: false });

export default function IndiaMapLazy() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let allowed = false;
    let visible = false;
    const maybeLoad = () => {
      if (allowed && visible) setReady(true);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        maybeLoad();
      },
      { rootMargin: '80px 0px' },
    );
    io.observe(node);
    const timer = window.setTimeout(() => {
      allowed = true;
      maybeLoad();
    }, 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref}>
      {ready ? (
        <IndiaMap />
      ) : (
        <section className="active-buddies" aria-hidden="true" style={{ minHeight: 520 }} />
      )}
    </div>
  );
}
