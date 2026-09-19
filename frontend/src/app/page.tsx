'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import './landing.css';

const IndiaMap = dynamic(() => import('@/components/IndiaMap'), {
  ssr: false,
  loading: () => <section className="active-buddies" aria-hidden="true" style={{ minHeight: 520 }} />,
});
import {
  Search, MapPin, ArrowRight, ShieldCheck, DollarSign, Star,
  MessageSquare, Users, CheckCircle2, Sparkles, Briefcase, Heart,
  FileText, UserPlus, Compass, Wallet, PartyPopper
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Categories', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#about' },
];

const HERO_STATS = [
  { value: '100K+', label: 'Active Buddies' },
  { value: '50K+', label: 'Connections Made' },
  { value: '4.9★', label: 'Trust Score' },
  { value: '200+', label: 'Cities Across India' },
];

const CATEGORIES = [
  { icon: '🌙', name: 'Nightout Buddy', rate: '₹2000', period: '/Hour', desc: 'Safe, fun company for your night out', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
  { icon: '🎬', name: 'Movie Buddy', rate: '₹1000', period: '/Hour', desc: 'Enjoy films with great company', gradient: 'linear-gradient(135deg, #ea580c, #fb923c)' },
  { icon: '🛍️', name: 'Shopping Buddy', rate: '₹1000', period: '/Hour', desc: 'Personal assist for a smarter shop', gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' },
  { icon: '💃', name: 'Clubbing Buddy', rate: '₹2000', period: '/Hour', desc: 'Your go-to partner for a great night', gradient: 'linear-gradient(135deg, #7c3aed, #c084fc)' },
  { icon: '✈️', name: 'Travel Buddy', rate: '₹1500', period: '/Hour', desc: 'A trusted companion for every journey', gradient: 'linear-gradient(135deg, #059669, #34d399)' },
  { icon: '🎮', name: 'Gaming Buddy', rate: '₹1000', period: '/Hour', desc: 'Level up with a skilled gaming partner', gradient: 'linear-gradient(135deg, #4f46e5, #818cf8)' },
  { icon: '💃', name: 'Dance Buddy', rate: '₹1000', period: '/Hour', desc: 'Move to the beat with a dance partner', gradient: 'linear-gradient(135deg, #db2777, #f472b6)' },
  { icon: '🏋️', name: 'Fitness Buddy', rate: '₹1000', period: '/Hour', desc: 'Expert motivation for your fitness goals', gradient: 'linear-gradient(135deg, #dc2626, #f97316)' },
  { icon: '🚗', name: 'Driving Buddy', rate: '₹1000', period: '/Hour', desc: 'Reliable, safe driving whenever you need', gradient: 'linear-gradient(135deg, #475569, #94a3b8)' },
  { icon: '🗣️', name: 'Language Buddy', rate: '₹1000', period: '/Hour', desc: 'Practice and learn languages together', gradient: 'linear-gradient(135deg, #0284c7, #67e8f9)' },
  { icon: '📸', name: 'Photography Buddy', rate: '₹2000', period: '/Hour', desc: 'Capture perfect moments with a photo partner', gradient: 'linear-gradient(135deg, #ca8a04, #facc15)' },
  { icon: '🧭', name: 'City Explorer Buddy', rate: '₹1000', period: '/Hour', desc: 'Discover hidden gems and local spots with a city-savvy guide', gradient: 'linear-gradient(135deg, #0d9488, #2dd4bf)' },
  { icon: '📋', name: 'Intern Buddy', rate: '₹300', period: '/Hour', desc: 'Learn, grow, and gain real-world experience alongside a mentor', gradient: 'linear-gradient(135deg, #1d4ed8, #60a5fa)' },
  { icon: '🎤', name: 'Interview Buddy', rate: '₹500', period: '/Hour', desc: 'Ace your next interview with mock sessions and expert feedback', gradient: 'linear-gradient(135deg, #b45309, #fbbf24)' },
  { icon: '☕', name: 'Cafe Buddy', rate: '₹500', period: '/Hour', desc: 'Great conversations over coffee with a friendly companion', gradient: 'linear-gradient(135deg, #92400e, #d6a76a)' },
  { icon: '🚙', name: 'Car Pooling Buddy', rate: '₹300', period: '/Trip', desc: 'Share rides, split costs, and travel with trusted companions', gradient: 'linear-gradient(135deg, #334155, #64748b)' },
];

const CLIENT_STEPS = [
  { number: '01', icon: FileText, title: 'Post Your Plan', desc: 'Share what you want to do hit the gym, explore the city, catch a movie, travel somewhere new. It takes under 2 minutes.', stat: '12K+', label: 'Open Plans' },
  { number: '02', icon: Users, title: 'Choose a verified Buddy', desc: 'Verified Buddies nearby who share your interests see your post and send you a chat request. Browse their profiles and pick your vibe.', stat: '100K+', label: 'Verified Buddies' },
  { number: '03', icon: MessageSquare, title: 'Connect & Negotiate', desc: 'Accept a Buddy and a private chat opens instantly. Plan the details, set your own price and meet up.', stat: '50K+', label: 'Connections Made' },
  { number: '04', icon: PartyPopper, title: 'Meet Up & Enjoy', desc: 'Show up, enjoy the experience, and rate your Buddy. Every great outing builds your story and their reputation.', stat: '50K+', label: 'Meetups Done' },
];

const BUDDY_STEPS = [
  { number: '01', icon: UserPlus, title: 'Set Up Your Profile', desc: 'Tell people who you are, what activities you love, and where you are. Set your availability and let your personality shine.', stat: '100K+', label: 'Buddies on Platform', earn: false },
  { number: '02', icon: Compass, title: 'Browse Nearby Plans', desc: 'See activity requests posted by people near you. Filter by interest, location, or Buddy category find plans that match your energy.', stat: '12K+', label: 'Plans Live Now', earn: false },
  { number: '03', icon: Wallet, title: 'Accept plans & Earn', desc: 'Get connect with people nearby, accept the plans that fit your schedule, set your own rates and get paid directly.', stat: '₹2K/hr', label: 'Earn Up To', earn: true },
  { number: '04', icon: Heart, title: 'Meet Up & Enjoy', desc: 'Show up, enjoy the experience, and rate your Client. Every great outing builds your story and their reputation', stat: '2,000', label: 'Online Now', earn: false },
];

const FEATURES = [
  { icon: MapPin, title: 'Location-Based Discovery', desc: 'Find Buddies in your city, neighborhood, or wherever your next adventure takes you using real-time geo-filtering.' },
  { icon: MessageSquare, title: 'Private Real-Time Chat', desc: "Don't overshare before you meet. Connect instantly, plan your activity, share details, and coordinate via our built-in secure in-app chat." },
  { icon: ShieldCheck, title: 'Verified Profiles', desc: "All Buddies go through an ID verification process. See their verified status clearly so you know exactly who you're connecting with." },
  { icon: Sparkles, title: 'Instant Notifications', desc: 'Get notified the moment someone wants to join your plan, or when your chat request gets accepted. Stay in the loop, always.' },
  { icon: DollarSign, title: 'Activity Based Fees', desc: 'Buddies set custom rates based on types of plans. Set your own fee, charge per hour, per event or per day.' },
  { icon: Star, title: 'Flexible Roles', desc: "Switch efforts smoothly when you're ready to group, host connections, or if you simply just want to join a plan near you." },
];

const PLANS = [
  { name: 'Basic', tagline: 'Try BuddySearch at your own pace', price: '₹249', original: '₹498', off: '50% OFF', period: '₹83/month', periodNote: 'billed for 3 months', features: ['Browse buddy discovery feed', 'View buddy profiles (name, avatar, city, services)', 'Post up to 5 plan requests / month', 'Standard position in discover feed'], accent: '#5b8dee', iconBg: '#eef3fd', cta: 'Start Basic', highlighted: false },
  { name: 'Standard', tagline: 'More plans, more visibility', price: '₹349', original: '₹998', off: '65% OFF', period: '₹58/month', periodNote: 'billed for 6 months', features: ['Everything in Basic', 'Post up to 10 plan requests / month', 'View user social profile links', 'Priority placement in discover'], accent: '#10b981', iconBg: '#ecfdf5', cta: 'Get Standard', highlighted: false },
  { name: 'Premium', tagline: 'The plan most people choose', price: '₹449', original: '₹1600', off: '72% OFF', period: '₹37/month', periodNote: 'billed for 12 months', features: ['Everything in Standard', 'Post up to 15 plan requests / month', 'Higher priority placement in feed', '"Premium" badge on your profile'], accent: '#f96566', iconBg: '#fff1f2', cta: 'Go Premium', highlighted: true },
  { name: 'Star Member', tagline: 'Lifetime access, pay once', price: '₹649', original: '₹2949', off: '78% OFF', period: 'one-time', periodNote: 'lifetime access', features: ['Everything in Premium', 'Unlimited plan requests', 'Pinned to top of discover', '"Star" badge on your profile', 'Lifetime access — pay once'], accent: '#8b5cf6', iconBg: '#f5f3ff', cta: 'Become a Star', highlighted: false },
];

const TESTIMONIALS = [
  { name: 'Meera Kapoor', role: 'Client – Movie Buddy · Mumbai', quote: 'I never had anyone to catch the latest releases with. Found a Movie Buddy on BuddySearch and we have watched six films together already. It feels like going with an old friend every single time.', img: 11 },
  { name: 'Rahul Sinha', role: 'Client – Gaming Buddy · Bangalore', quote: "Been gaming solo for years and it gets boring fast. Found a Gaming Buddy on BuddySearch and we've been grinding ranked matches every weekend since. Finally have someone to strategise with — no toxicity, just good vibes.", img: 12 },
  { name: 'Divya Nair', role: 'Client – Shopping Buddy · Delhi', quote: "I needed help picking out an outfit for my sister's wedding. My Shopping Buddy had incredible taste and kept me from overspending. Matched within 10 minutes, worth every rupee.", img: 13 },
  { name: 'Arjun Mehta', role: 'Buddy – Gym Trainer · Pune', quote: "I was freelancing as a personal trainer but struggling to find consistent clients. Since joining BuddySearch as a Gym Buddy, I'm fully booked on weekends. The Pro plan's visibility boost made all the difference.", img: 14 },
  { name: 'Sneha Pillai', role: 'Client – Travel Buddy · Hyderabad', quote: 'Travelling solo felt daunting until I found a Travel Buddy on BuddySearch. She knew all the hidden spots in Coorg and made the whole trip feel like going with a friend. Will definitely book again.', img: 15 },
  { name: 'Kavya Das', role: 'Buddy – Dance & Nightout · Chennai', quote: 'I offer both Dance and Nightout Buddy services. The chat request system is seamless — clients describe what they need, I accept, and we sort the rest in the chat. My calendar stays full every week.', img: 16 },
  { name: 'Priya Sharma', role: 'Client – Cafe Buddy · Mumbai', quote: 'I used to dread going to new cafes alone. Found a Cafe Buddy in 5 minutes and we spent hours chatting. Now I do it every weekend. BuddySearch has genuinely changed how I explore my own city.', img: 20 },
  { name: 'Ananya Roy', role: 'Buddy – Dance Instructor · Kolkata', quote: 'Teaching dance was always my passion but finding students was hard. BuddySearch brought consistent bookings every week. The platform handles everything so I can just focus on dancing.', img: 21 },
];

function Step({ number, icon: Icon, title, desc, stat, label, variant, isLast, earn = false }: {
  number: string; icon: React.ElementType; title: string; desc: string; stat: string; label: string; variant: 'client' | 'buddy'; isLast: boolean; earn?: boolean;
}) {
  const cardMod = earn ? `hiw__step-card--${variant} hiw__step-card--buddy-earn` : `hiw__step-card--${variant}`;
  const statMod = earn ? 'hiw__stat--buddy-earn' : `hiw__stat--${variant}`;
  return (
    <div className="hiw__step">
      <div className={`hiw__step-num hiw__step-num--${variant}`}>{number}</div>
      {!isLast && <div className={`hiw__step-connector hiw__step-connector--${variant}`} aria-hidden="true" />}
      <div className={`hiw__step-card ${cardMod}`}>
        <div className="hiw__step-head">
          <div className={`hiw__step-icon hiw__step-icon--${variant}`}><Icon size={18} /></div>
          <div className={`hiw__stat ${statMod}`}>
            <span className="hiw__stat-num">{stat}</span>
            <span className="hiw__stat-lbl">{label}</span>
          </div>
        </div>
        <h3 className="hiw__step-title">{title}</h3>
        <p className="hiw__step-desc">{desc}</p>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: (typeof PLANS)[number] }) {
  return (
    <div
      className={`pricing__card${plan.highlighted ? ' pricing__card--highlighted' : ''}`}
      style={{ '--accent': plan.accent, '--icon-bg': plan.iconBg } as React.CSSProperties}
    >
      {plan.highlighted && <div className="pricing__badge">Most Popular</div>}
      <div className="pricing__icon"><Star size={22} /></div>
      <div className="pricing__plan-header">
        <div className="pricing__plan-name">{plan.name}</div>
        <div className="pricing__tagline">{plan.tagline}</div>
      </div>
      <div className="pricing__price-row">
        <span className="pricing__price-amount">{plan.price}</span>
        <span className="pricing__price-original">{plan.original}</span>
        <span className="pricing__discount-tag">{plan.off}</span>
      </div>
      <div className="pricing__per-month">
        <span className="pricing__per-month-amount">{plan.period}</span>
        <span className="pricing__per-month-label">· {plan.periodNote}</span>
      </div>
      <ul className="pricing__features">
        {plan.features.map((f) => (
          <li key={f} className="pricing__feature">
            <span className="pricing__feature-check"><CheckCircle2 size={12} /></span>
            {f}
          </li>
        ))}
      </ul>
      <Link href="/signup" className={`pricing__cta${plan.highlighted ? ' pricing__cta--solid' : ''}`}>{plan.cta}</Link>
      <p className="pricing__taxes">Inclusive of taxes</p>
    </div>
  );
}

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <article className="tm-card">
      <div className="tm-card__avatar-wrap">
        <div className="tm-card__avatar" aria-hidden="true">
          {t.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
        </div>
      </div>
      <div className="tm-card__body">
        <div className="tm-card__author-info">
          <div className="tm-card__name">{t.name}</div>
          <div className="tm-card__meta">{t.role}</div>
        </div>
        <div className="tm-card__stars" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} fill="#F96566" color="#F96566" />
          ))}
        </div>
        <p className="tm-card__text">“{t.quote}”</p>
      </div>
    </article>
  );
}

export default function LandingPage() {
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
    <div className="landing-page">
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">
          <Link href="/" className="navbar__logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/logo.png" alt="BuddySearch" className="navbar__logo-img" />
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

      <section className="hero">
        <div className="hero__blob hero__blob--1" aria-hidden="true" />
        <div className="hero__blob hero__blob--2" aria-hidden="true" />
        <div className="hero__blob hero__blob--3" aria-hidden="true" />
        <div className="container hero__inner">
          <div className="hero__content">
            <div className="hero__badge">
              <span className="hero__badge-dot" aria-hidden="true" />
              India’s #1 Social Companionship hiring Platform
            </div>
            <h1 className="hero__title">
              Hire a Buddy<br />
              <span className="hero__title-row">
                or <span className="hero__title-accent hero__title-accent--underline">Become One.</span>
              </span>
            </h1>
            <div className="hero__features">
              <div className="hero__feature">
                <span className="hero__feature-icon" style={{ background: '#fee2e2' }}>
                  <Users size={18} color="#ef4444" />
                </span>
                <span className="hero__feature-text">Find your people.</span>
              </div>
              <span className="hero__feature-divider" aria-hidden="true" />
              <div className="hero__feature">
                <span className="hero__feature-icon" style={{ background: '#fef3c7' }}>
                  <Briefcase size={18} color="#f59e0b" />
                </span>
                <span className="hero__feature-text">Hire for your plans.</span>
              </div>
              <span className="hero__feature-divider" aria-hidden="true" />
              <div className="hero__feature">
                <span className="hero__feature-icon" style={{ background: '#dcfce7' }}>
                  <Heart size={18} fill="#22c55e" color="#22c55e" />
                </span>
                <span className="hero__feature-text">Make it happen.</span>
              </div>
            </div>
            <p className="hero__subtitle">
              India’s social companion platform to find, hire, or connect with verified companions for every plan. From cafés and concerts to travel and adventures. BuddySearch makes social experiences effortless, while giving companions the opportunity to earn along the way.
            </p>
            <div className="hero__actions">
              <Link href="/find" className="btn-primary hero__cta-main">
                <Search size={18} strokeWidth={2.5} /> Hire a Buddy
              </Link>
              <Link href="/signup" className="btn-secondary hero__cta-hire">
                <Briefcase size={18} strokeWidth={2.5} /> Become a Buddy <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
            <div className="hero__stats">
              {HERO_STATS.map((s) => (
                <div className="hero__stat" key={s.label}>
                  <span className="hero__stat-value">{s.value}</span>
                  <span className="hero__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero__visual">
            <span className="hero__sparkle hero__sparkle--1" aria-hidden="true">✦</span>
            <span className="hero__sparkle hero__sparkle--2" aria-hidden="true">✦</span>
            <div className="hero__img-wrap">
              <img
                src="/activities-on-buddy-search.webp"
                alt="Friends enjoying activities together with BuddySearch"
                className="hero__img"
              />
            </div>
          </div>
        </div>
      </section>

      <IndiaMap />

      <section className="hiw" id="how-it-works">
        <div className="container">
          <div className="hiw__header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">Simple to start,<br /><span>built for real connections</span></h2>
            <p className="section-subtitle">BuddySearch works for two kinds of people those who have a plan and need a companion, and those who love making new friends.</p>
          </div>
          <div className="hiw__tabs-wrapper">
            <div className="hiw__flow">
              <div className="hiw__flow-label hiw__flow-label--client">
                <Search size={15} strokeWidth={2.5} /> I need a Buddy
              </div>
              <div className="hiw__steps">
                {CLIENT_STEPS.map((s, i) => (
                  <Step key={s.number} {...s} variant="client" isLast={i === CLIENT_STEPS.length - 1} />
                ))}
              </div>
            </div>
            <div className="hiw__divider" aria-hidden="true"><span>or</span></div>
            <div className="hiw__flow">
              <div className="hiw__flow-label hiw__flow-label--buddy">
                <ShieldCheck size={15} strokeWidth={2.5} /> I want to be a Buddy
              </div>
              <div className="hiw__steps">
                {BUDDY_STEPS.map((s, i) => (
                  <Step key={s.number} {...s} variant="buddy" isLast={i === BUDDY_STEPS.length - 1} earn={s.earn} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="services" id="services">
        <div className="container">
          <div className="services__header">
            <span className="section-tag">What are you looking for</span>
            <h2 className="section-title">A Buddy for <span>every plan</span></h2>
            <p className="section-subtitle">Whether it&apos;s coffee, travel, movies, shopping, fitness, events, or simply exploring your city. Find, hire, or become a verified companion in minutes. Real people. Real experiences. Real opportunities to earn.</p>
          </div>
          <div className="services__grid">
            {CATEGORIES.map((cat) => (
              <div className="services__card" key={cat.name}>
                <div className="services__card-top">
                  <div className="services__card-icon-wrap" style={{ background: cat.gradient }}>
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{cat.icon}</span>
                  </div>
                  <div className="services__card-rate-badge">
                    <span className="services__card-rate-amount">{cat.rate}</span>
                    <span className="services__card-rate-period">{cat.period}</span>
                  </div>
                </div>
                <div className="services__card-body">
                  <h3 className="services__card-name">{cat.name}</h3>
                  <p className="services__card-desc">{cat.desc}</p>
                </div>
                <Link href="/find" className="services__card-action">Book Now <ArrowRight size={12} /></Link>
              </div>
            ))}
          </div>
          <div className="services__footer">
            <p className="services__footer-note">Can&apos;t find your category? Post a plan anyway — verified Buddies nearby will still see it.</p>
            <Link href="/find" className="btn-primary">Browse All Categories <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features__header">
            <span className="section-tag">Why BuddySearch</span>
            <h2 className="section-title">Built for real connections,<br />built for friendship</h2>
            <p className="section-subtitle">Every feature is designed to make finding - and hiring - a Buddy as natural and safe as possible.</p>
          </div>
          <div className="features__grid">
            {FEATURES.map((f) => (
              <div className="features__card" key={f.title}>
                <div className="features__card-icon-wrap"><f.icon size={22} /></div>
                <h3 className="features__card-title">{f.title}</h3>
                <p className="features__card-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="earning" id="earning">
        <div className="earning__blob earning__blob--1" aria-hidden="true" />
        <div className="earning__blob earning__blob--2" aria-hidden="true" />
        <div className="container earning__inner">
          <div className="earning__left">
            <span className="earning__tag">💸 For Buddies</span>
            <h2 className="earning__title">Turn your free time into&nbsp;<span className="earning__title-highlight"> real income</span></h2>
            <p className="earning__subtitle">India&apos;s fastest-growing social platform. Set your own rates, choose your activities, and earn up to ₹2,000/hr - on your terms.</p>
            <div className="earning__stats">
              <div className="earning__stat">
                <div className="earning__stat-value">₹2K/hr</div>
                <div className="earning__stat-label">Per Hour</div>
              </div>
              <div className="earning__stat">
                <div className="earning__stat-value">200+</div>
                <div className="earning__stat-label">Cities Across India</div>
              </div>
              <div className="earning__stat">
                <span className="earning__stat-badge">50% OFF</span>
                <div className="earning__stat-value">
                  <s className="earning__stat-original">₹498</s>
                  ₹249
                </div>
                <div className="earning__stat-label">Join From</div>
              </div>
            </div>
            <div className="earning__cta-wrap">
              <Link href="/signup" className="earning__cta">Start Earning Today <ArrowRight size={16} strokeWidth={2.5} /></Link>
            </div>
          </div>
          <div className="earning__right">
            <h3 className="earning__how-title">How Buddies Earn</h3>
            <div className="earning__how-grid">
              <div className="earning__how-card">
                <div className="earning__how-icon">☕</div>
                <div>
                  <div className="earning__how-card-title">Hangout &amp; Companionship</div>
                  <div className="earning__how-card-rate">₹500 – ₹1,500/hr</div>
                  <div className="earning__how-card-example">10 hrs → ₹5K–₹15K</div>
                </div>
              </div>
              <div className="earning__how-card">
                <div className="earning__how-icon">🎉</div>
                <div>
                  <div className="earning__how-card-title">Events &amp; Outings</div>
                  <div className="earning__how-card-rate">₹1,000 – ₹2,000/hr</div>
                  <div className="earning__how-card-example">10 hrs → ₹10K–₹20K</div>
                </div>
              </div>
              <div className="earning__how-card">
                <div className="earning__how-icon">✈️</div>
                <div>
                  <div className="earning__how-card-title">Travel &amp; Adventures</div>
                  <div className="earning__how-card-rate">₹1,500 – ₹2,000/hr</div>
                  <div className="earning__how-card-example">Weekend trips add up fast</div>
                </div>
              </div>
            </div>
            <div className="earning__trust">
              <span className="earning__trust-item"><CheckCircle2 size={14} /> Verified profiles</span>
              <span className="earning__trust-item"><CheckCircle2 size={14} /> Direct payments</span>
              <span className="earning__trust-item"><CheckCircle2 size={14} /> Flexible hours</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="container">
          <div className="pricing__header">
            <span className="section-tag">Pricing</span>
            <h2 className="section-title">Simple, transparent<br />plans for everyone</h2>
            <p className="section-subtitle">No hidden fees. Pick the plan that fits your pace. Limited time offer.</p>
          </div>
          <div className="pricing__grid">
            {PLANS.map((p) => <PlanCard key={p.name} plan={p} />)}
          </div>
          <div className="pricing__carousel-wrap">
            <div className="pricing__carousel-track">
              {PLANS.map((p) => (
                <div className="pricing__carousel-slide" key={p.name}>
                  <PlanCard plan={p} />
                </div>
              ))}
            </div>
          </div>
          <p className="pricing__note">Prices shown for a limited time. Taxes extra where applicable.</p>
        </div>
      </section>

      <section className="testimonials" id="about">
        <div className="container">
          <div className="testimonials__header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">Real people,<br /><span>real results</span></h2>
            <p className="section-subtitle">From late-night outings to weekend adventures — real people share how BuddySearch made every moment better.</p>
          </div>
        </div>
        <div className="tm-marquee">
          <div className="tm-marquee__track tm-marquee__track--fwd">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard key={`fwd-${i}`} t={t} />
            ))}
          </div>
        </div>
        <div className="tm-marquee tm-marquee--rev">
          <div className="tm-marquee__track tm-marquee__track--rev">
            {[...TESTIMONIALS].reverse().concat(TESTIMONIALS).map((t, i) => (
              <TestimonialCard key={`rev-${i}`} t={t} />
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-section__blob cta-section__blob--1" aria-hidden="true" />
        <div className="cta-section__blob cta-section__blob--2" aria-hidden="true" />
        <div className="container cta-section__inner">
          <div className="cta-section__eyebrow">
            <span className="cta-section__live-dot" aria-hidden="true" />
            Trusted By Lakhs across India
          </div>
          <h2 className="cta-section__title">Your next adventure<br />needs a Buddy.</h2>
          <p className="cta-section__subtitle">Connect, explore, belong. Lakhs of people across India are already finding companions for every plan, every activity, every day.</p>
          <div className="cta-section__actions">
            <Link href="/find" className="btn-white">
              <Search size={18} strokeWidth={2.5} /> Hire a Buddy Now
            </Link>
            <Link href="/signup" className="btn-outline-white">
              Become a Buddy <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
          <p className="cta-section__note">Free to join. No credit card required.</p>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer__top">
            <div>
              <Link href="/" className="footer__logo-link">
                <img src="/buddy_search_white_grey.png" alt="BuddySearch" className="footer__logo" />
              </Link>
              <p className="footer__brand-desc">India&apos;s leading social companion platform to find, hire, or become a verified companion for every plan.</p>
            </div>
            <div className="footer__links">
              <div>
                <h4 className="footer__col-title">Product</h4>
                <div className="footer__col-links">
                  <a className="footer__col-link" href="#how-it-works">How It Works</a>
                  <a className="footer__col-link" href="#services">Categories</a>
                  <a className="footer__col-link" href="#pricing">Pricing</a>
                  <Link className="footer__col-link" href="/find">Find a Buddy</Link>
                </div>
              </div>
              <div>
                <h4 className="footer__col-title">Company</h4>
                <div className="footer__col-links">
                  <a className="footer__col-link" href="#about">About Us</a>
                  <Link className="footer__col-link" href="/signup">Become a Buddy</Link>
                  <Link className="footer__col-link" href="/login">Log In</Link>
                </div>
              </div>
              <div>
                <h4 className="footer__col-title">Legal</h4>
                <div className="footer__col-links">
                  <a className="footer__col-link" href="#">Privacy Policy</a>
                  <a className="footer__col-link" href="#">Terms of Service</a>
                  <a className="footer__col-link" href="#">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            <p className="footer__copy">© {new Date().getFullYear()} BuddySearch India. All rights reserved.</p>
            <div className="footer__legal-links">
              <a className="footer__legal-link" href="#">Terms</a>
              <span className="footer__legal-sep">·</span>
              <a className="footer__legal-link" href="#">Privacy</a>
              <span className="footer__legal-sep">·</span>
              <a className="footer__legal-link" href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
