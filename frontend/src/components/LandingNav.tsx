'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Categories', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Testimonials', href: '#about' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link href="/" className="navbar__logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img
            src="/logo.png"
            alt="Buddy Search"
            className="navbar__logo-img"
            width={1743}
            height={319}
            decoding="async"
          />
        </Link>
        <ul className="navbar__links">
          {NAV_LINKS.map((l) => (
            <li key={l.href}><a href={l.href} className="navbar__link">{l.label}</a></li>
          ))}
        </ul>
        <div className="navbar__cta">
          <Link href="/login" className="navbar__login">Log In</Link>
          <Link href="/signup" className="btn-primary navbar__signup">Get Started</Link>
        </div>
        <button
          className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
      <div className={`navbar__mobile${menuOpen ? ' navbar__mobile--open' : ''}`}>
        <button className="navbar__mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close">✕</button>
        <ul>
          {NAV_LINKS.map((l) => (
            <li key={l.href}><a href={l.href} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>{l.label}</a></li>
          ))}
        </ul>
        <div className="navbar__mobile-cta">
          <Link href="/login" className="btn-secondary" onClick={() => setMenuOpen(false)}>Log In</Link>
          <Link href="/signup" className="btn-primary" onClick={() => setMenuOpen(false)}>Get Started</Link>
        </div>
      </div>
    </nav>
  );
}
