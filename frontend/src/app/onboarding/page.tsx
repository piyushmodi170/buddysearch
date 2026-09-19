'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { needsEmailVerification, postAuthPath } from '@/lib/utils';
import '../onboarding.css';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
  'Chandigarh', 'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
];

const GENDERS = [
  { value: 'female', label: 'Female', icon: '♀' },
  { value: 'male', label: 'Male', icon: '♂' },
  { value: 'other', label: 'Other', icon: '◆' },
];

type Interest = { id: string; label: string; slug: string; emoji?: string | null };

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [stateQuery, setStateQuery] = useState('');
  const [form, setForm] = useState({
    gender: '',
    state: '',
    city: '',
    pincode: '',
    interestIds: [] as string[],
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: '',
    bio: '',
    availableForRequests: true,
  });

  const isBuddy = user?.role === 'BUDDY' || user?.role === 'BOTH';
  const totalSteps = 3;

  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useAuthStore.persist.onFinishHydration(finish);
    if (useAuthStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (needsEmailVerification(user)) {
      router.replace(postAuthPath(user));
      return;
    }
    if (user?.onboardingCompleted || user?.isAdmin) {
      router.replace('/hire');
    }
  }, [hydrated, isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/api/users/interest-options').then((res) => {
      setInterests(res.data.data || []);
    }).catch(() => {
      setInterests([
        { id: 'dance-buddy', label: 'Dance Buddy', slug: 'dance-buddy', emoji: '💃' },
        { id: 'tech-buddy', label: 'Tech Buddy', slug: 'tech-buddy', emoji: '💻' },
        { id: 'nightout-buddy', label: 'Nightout Buddy', slug: 'nightout-buddy', emoji: '🌙' },
        { id: 'clubbing-buddy', label: 'Clubbing Buddy', slug: 'clubbing-buddy', emoji: '⭐' },
        { id: 'travel-buddy', label: 'Travel Buddy', slug: 'travel-buddy', emoji: '✈️' },
        { id: 'movie-buddy', label: 'Movie Buddy', slug: 'movie-buddy', emoji: '🎬' },
        { id: 'gym-buddy', label: 'Gym Buddy', slug: 'gym-buddy', emoji: '💪' },
        { id: 'cafe-buddy', label: 'Cafe Buddy', slug: 'cafe-buddy', emoji: '☕' },
      ]);
    });
  }, [isAuthenticated]);

  const setField = (key: string, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (id: string) => {
    setForm((prev) => {
      if (prev.interestIds.includes(id)) {
        return { ...prev, interestIds: prev.interestIds.filter((x) => x !== id) };
      }
      if (prev.interestIds.length >= 4) {
        toast.error('You can select up to 4 services only');
        return prev;
      }
      return { ...prev, interestIds: [...prev.interestIds, id] };
    });
  };

  const stateOptions = useMemo(() => {
    const q = stateQuery.toLowerCase();
    return STATES.filter((s) => s.toLowerCase().includes(q)).slice(0, 12);
  }, [stateQuery]);

  const validateStep = () => {
    if (step === 1) {
      if (!form.gender) { toast.error('Please select your gender'); return false; }
      if (!form.state) { toast.error('Please select your state'); return false; }
      if (!form.city.trim()) { toast.error('Please enter your city'); return false; }
      if (!/^\d{6}$/.test(form.pincode)) { toast.error('Please enter a valid 6-digit pincode'); return false; }
    }
    if (step === 2) {
      if (isBuddy && form.interestIds.length === 0) {
        toast.error('Please select at least one service you offer');
        return false;
      }
    }
    if (step === 3 && isBuddy && !form.bio.trim()) {
      toast.error('Please write a short bio');
      return false;
    }
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, totalSteps));
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    if (!validateStep()) return;
    setSaving(true);
    try {
      const res = await api.post('/api/users/onboarding', form);
      const profile = res.data.data || res.data;
      updateUser(profile);
      toast.success(res.data.message || 'Profile completed!');
      router.replace('/hire');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const stepLabel = step === 1
    ? 'Location & Gender'
    : step === 2
      ? 'Your Services'
      : 'Bio & Social Links';

  if (!hydrated || !isAuthenticated || user?.onboardingCompleted) {
    return null;
  }

  return (
    <div className="onboarding">
      <div className="onboarding__container">
        <div className="onboarding__header">
          <h1 className="onboarding__title">Complete Your Profile</h1>
          <p className="onboarding__subtitle">Just a few more details to get you started on BuddySearch</p>
        </div>
        <div className="onboarding__progress">
          <div className="onboarding__progress-bar">
            <div className="onboarding__progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
          <span className="onboarding__progress-text">Step {step} of {totalSteps} — {stepLabel}</span>
        </div>

        <div className="onboarding__content">
          {step === 1 && (
            <div className="onboarding__step">
              <div className="onboarding__field">
                <label className="onboarding__label">Gender *</label>
                <div className="onboarding__gender-grid">
                  {GENDERS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      className={`onboarding__gender-btn${form.gender === g.value ? ' onboarding__gender-btn--active' : ''}`}
                      onClick={() => setField('gender', g.value)}
                    >
                      <span className="onboarding__gender-icon">{g.icon}</span>
                      <span>{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="onboarding__field">
                <label className="onboarding__label">State *</label>
                <input
                  className="onboarding__input"
                  placeholder="Search state..."
                  value={stateQuery || form.state}
                  onChange={(e) => { setStateQuery(e.target.value); setField('state', ''); }}
                  onFocus={() => setStateQuery(form.state || stateQuery)}
                />
                {stateQuery && (
                  <div className="onboarding__dropdown">
                    {stateOptions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`onboarding__dropdown-item${form.state === s ? ' active' : ''}`}
                        onClick={() => { setField('state', s); setStateQuery(''); }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="onboarding__field">
                <label className="onboarding__label">City *</label>
                <input
                  className="onboarding__input"
                  placeholder="Enter your city"
                  value={form.city}
                  onChange={(e) => setField('city', e.target.value)}
                />
              </div>
              <div className="onboarding__field">
                <label className="onboarding__label">Pincode *</label>
                <input
                  className="onboarding__input"
                  placeholder="6-digit pincode"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding__step">
              <div className="onboarding__field">
                <label className="onboarding__label">My Interests</label>
                <p className="onboarding__hint">Select up to 4 services. Tap to add/remove.</p>
                <p className="onboarding__hint" style={{ color: form.interestIds.length >= 4 ? '#F96566' : undefined }}>
                  {form.interestIds.length}/4 selected
                </p>
                <div className="onboarding__services-grid">
                  {interests.map((item) => {
                    const active = form.interestIds.includes(item.id) || form.interestIds.includes(item.slug);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`onboarding__service-chip${active ? ' onboarding__service-chip--active' : ''}`}
                        onClick={() => toggleInterest(item.id)}
                      >
                        <span>{item.emoji || '✦'}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onboarding__step">
              <div className="onboarding__field">
                <label className="onboarding__label">{isBuddy ? 'Bio *' : 'Bio'}</label>
                <textarea
                  className="onboarding__textarea"
                  rows={5}
                  maxLength={500}
                  placeholder="Tell people who you are and the plans you enjoy..."
                  value={form.bio}
                  onChange={(e) => setField('bio', e.target.value)}
                />
                <div className="onboarding__char-count">{form.bio.length}/500</div>
              </div>
              {isBuddy && (
              <label className="onboarding__field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form.availableForRequests}
                  onChange={(e) => setField('availableForRequests', e.target.checked)}
                />
                <span className="onboarding__label" style={{ margin: 0 }}>Available for new requests</span>
              </label>
              )}
              <div className="onboarding__field">
                <label className="onboarding__label">Social Links (shown on your public profile)</label>
                <div className="onboarding__social-inputs">
                  <div className="onboarding__social-row">
                    <span className="onboarding__social-icon">IG</span>
                    <input className="onboarding__input" placeholder="Instagram URL or @handle" value={form.instagram} onChange={(e) => setField('instagram', e.target.value)} />
                  </div>
                  <div className="onboarding__social-row">
                    <span className="onboarding__social-icon">f</span>
                    <input className="onboarding__input" placeholder="Facebook profile URL" value={form.facebook} onChange={(e) => setField('facebook', e.target.value)} />
                  </div>
                  <div className="onboarding__social-row">
                    <span className="onboarding__social-icon">in</span>
                    <input className="onboarding__input" placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => setField('linkedin', e.target.value)} />
                  </div>
                  <div className="onboarding__social-row">
                    <span className="onboarding__social-icon">𝕏</span>
                    <input className="onboarding__input" placeholder="@handle" value={form.twitter} onChange={(e) => setField('twitter', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="onboarding__actions">
          <button type="button" className="onboarding__btn onboarding__btn--secondary" onClick={back} disabled={step === 1 || saving}>
            Back
          </button>
          <div className="onboarding__actions-right">
            {step < totalSteps ? (
              <button type="button" className="onboarding__btn onboarding__btn--primary" onClick={next}>
                Continue
              </button>
            ) : (
              <button type="button" className="onboarding__btn onboarding__btn--primary" onClick={submit} disabled={saving}>
                {saving ? 'Saving…' : 'Finish'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
