'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Camera,
  Car,
  Check,
  ClipboardList,
  Coffee,
  Cpu,
  Dumbbell,
  FileText,
  Film,
  Gamepad2,
  IndianRupee,
  List,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Moon,
  Music,
  Phone,
  Plane,
  Search,
  ShoppingBag,
  Star,
  User,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '@/lib/api';
import { getGreeting, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useChatStore } from '@/store/useChatStore';

type InterestOption = { id: string; slug: string; label: string; emoji?: string };

const FALLBACK_INTERESTS: InterestOption[] = [
  { id: 'dance-buddy', slug: 'dance-buddy', label: 'Dance Buddy' },
  { id: 'city-explorer-buddy', slug: 'city-explorer-buddy', label: 'City Explorer Buddy' },
  { id: 'language-buddy', slug: 'language-buddy', label: 'Language Buddy' },
  { id: 'tech-buddy', slug: 'tech-buddy', label: 'Tech Buddy' },
  { id: 'chat-buddy', slug: 'chat-buddy', label: 'Chat Buddy' },
  { id: 'nightout-buddy', slug: 'nightout-buddy', label: 'Nightout Buddy' },
  { id: 'interview-buddy', slug: 'interview-buddy', label: 'Interview Buddy' },
  { id: 'intern-buddy', slug: 'intern-buddy', label: 'Intern Buddy' },
  { id: 'driving-buddy', slug: 'driving-buddy', label: 'Driving Buddy' },
  { id: 'car-pooling-buddy', slug: 'car-pooling-buddy', label: 'Car Pooling Buddy' },
  { id: 'shopping-buddy', slug: 'shopping-buddy', label: 'Shopping Buddy' },
  { id: 'cafe-buddy', slug: 'cafe-buddy', label: 'Cafe Buddy' },
  { id: 'clubbing-buddy', slug: 'clubbing-buddy', label: 'Clubbing Buddy' },
  { id: 'gaming-buddy', slug: 'gaming-buddy', label: 'Gaming Buddy' },
  { id: 'gym-buddy', slug: 'gym-buddy', label: 'Gym Buddy' },
  { id: 'movie-buddy', slug: 'movie-buddy', label: 'Movie Buddy' },
  { id: 'photography-buddy', slug: 'photography-buddy', label: 'Photography Buddy' },
  { id: 'travel-buddy', slug: 'travel-buddy', label: 'Travel Buddy' },
];

const INTEREST_STYLE: Record<string, { icon: typeof Music; idle: string; active: string }> = {
  'dance-buddy': { icon: Music, idle: 'bg-pink-50 text-pink-500 border-pink-100', active: 'bg-white text-pink-600 border-pink-400 ring-2 ring-pink-200' },
  'city-explorer-buddy': { icon: MapPin, idle: 'bg-rose-50 text-rose-400 border-rose-100', active: 'bg-white text-rose-600 border-rose-400 ring-2 ring-rose-200' },
  'language-buddy': { icon: MessageCircle, idle: 'bg-cyan-50 text-cyan-500 border-cyan-100', active: 'bg-white text-cyan-600 border-cyan-400 ring-2 ring-cyan-200' },
  'tech-buddy': { icon: Cpu, idle: 'bg-sky-50 text-sky-500 border-sky-100', active: 'bg-white text-blue-600 border-blue-500 ring-2 ring-blue-200' },
  'chat-buddy': { icon: MessageCircle, idle: 'bg-teal-50 text-teal-500 border-teal-100', active: 'bg-white text-teal-600 border-teal-400 ring-2 ring-teal-200' },
  'nightout-buddy': { icon: Moon, idle: 'bg-violet-50 text-violet-500 border-violet-100', active: 'bg-white text-violet-700 border-violet-500 ring-2 ring-violet-200' },
  'interview-buddy': { icon: Mic, idle: 'bg-rose-50 text-rose-400 border-rose-100', active: 'bg-white text-rose-600 border-rose-400 ring-2 ring-rose-200' },
  'intern-buddy': { icon: ClipboardList, idle: 'bg-pink-50 text-pink-400 border-pink-100', active: 'bg-white text-pink-600 border-pink-400 ring-2 ring-pink-200' },
  'driving-buddy': { icon: Car, idle: 'bg-emerald-50 text-emerald-500 border-emerald-100', active: 'bg-white text-emerald-600 border-emerald-400 ring-2 ring-emerald-200' },
  'car-pooling-buddy': { icon: Car, idle: 'bg-blue-50 text-blue-500 border-blue-100', active: 'bg-white text-blue-600 border-blue-400 ring-2 ring-blue-200' },
  'shopping-buddy': { icon: ShoppingBag, idle: 'bg-indigo-50 text-indigo-400 border-indigo-100', active: 'bg-white text-indigo-600 border-indigo-400 ring-2 ring-indigo-200' },
  'cafe-buddy': { icon: Coffee, idle: 'bg-orange-50 text-orange-500 border-orange-100', active: 'bg-white text-orange-600 border-orange-400 ring-2 ring-orange-200' },
  'clubbing-buddy': { icon: Star, idle: 'bg-fuchsia-50 text-fuchsia-500 border-fuchsia-100', active: 'bg-white text-fuchsia-700 border-fuchsia-500 ring-2 ring-fuchsia-200' },
  'gaming-buddy': { icon: Gamepad2, idle: 'bg-sky-50 text-sky-500 border-sky-100', active: 'bg-white text-sky-700 border-sky-400 ring-2 ring-sky-200' },
  'gym-buddy': { icon: Dumbbell, idle: 'bg-rose-50 text-rose-500 border-rose-100', active: 'bg-white text-rose-600 border-rose-400 ring-2 ring-rose-200' },
  'movie-buddy': { icon: Film, idle: 'bg-amber-50 text-amber-500 border-amber-100', active: 'bg-white text-amber-600 border-amber-400 ring-2 ring-amber-200' },
  'photography-buddy': { icon: Camera, idle: 'bg-yellow-50 text-yellow-600 border-yellow-100', active: 'bg-white text-yellow-700 border-yellow-400 ring-2 ring-yellow-200' },
  'travel-buddy': { icon: Plane, idle: 'bg-green-50 text-green-600 border-green-100', active: 'bg-white text-green-700 border-green-500 ring-2 ring-green-200' },
};

const fieldClass =
  'w-full h-12 rounded-2xl border border-[#F3C6CB] bg-white px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

function titleCase(value?: string | null) {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function planChipLabel(user?: { membershipPlan?: string | null; membership?: string | null } | null) {
  const raw = (user?.membershipPlan || user?.membership || 'BASIC').toString().toUpperCase();
  if (!raw || raw === 'FREE') return 'Basic Buddy';
  return `${raw.charAt(0)}${raw.slice(1).toLowerCase()} Buddy`;
}

function formatExpiry(value?: string | Date | null, short = false) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return short ? format(date, 'd MMM') : format(date, 'd MMM yyyy');
}

function rolePair(role?: string) {
  if (role === 'BOTH') return { identity: 'CLIENT & BUDDY', hero: 'BUDDY & CLIENT' };
  if (role === 'BUDDY') return { identity: 'BUDDY', hero: 'BUDDY' };
  if (role === 'CLIENT') return { identity: 'CLIENT', hero: 'CLIENT' };
  return { identity: 'MEMBER', hero: 'MEMBER' };
}

function extractInterestKeys(profile: any): string[] {
  const rows = profile?.interests || [];
  return rows
    .map((row: any) => row?.interest?.id || row?.interest?.slug || row?.id || row?.slug || row)
    .filter(Boolean)
    .map(String);
}

function interestKey(item: InterestOption) {
  return item.slug || item.id;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadNotifications = useNotificationStore((s) => s.unreadCount);
  const unreadMessages = useChatStore((s) => s.chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0));

  const [stateName, setStateName] = useState(user?.state || '');
  const [city, setCity] = useState(user?.city || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [instagram, setInstagram] = useState(user?.instagram || '');
  const [facebook, setFacebook] = useState(user?.facebook || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [twitter, setTwitter] = useState(user?.twitter || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isAvailable, setIsAvailable] = useState(user?.availableForRequests ?? false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<InterestOption[]>(FALLBACK_INTERESTS);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingBuddy, setIsSavingBuddy] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [isUploadingAadhaar, setIsUploadingAadhaar] = useState(false);
  const [aadhaarStatus, setAadhaarStatus] = useState(
    user?.aadhaarVerified ? 'VERIFIED' : user?.aadhaarUrl ? 'PENDING' : 'NOT_SUBMITTED'
  );
  const [bannerOpen, setBannerOpen] = useState(true);
  const [stats, setStats] = useState({ requests: 0, open: 0 });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const aadhaarInputRef = useRef<HTMLInputElement>(null);
  const saveInterestsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [profileRes, interestRes, reqRes] = await Promise.all([
        api.get('/api/users/profile').catch(() => null),
        api.get('/api/users/interest-options').catch(() => null),
        api.get('/api/requests').catch(() => null),
      ]);
      if (cancelled) return;

      const options: InterestOption[] = interestRes?.data?.data?.length
        ? interestRes.data.data
        : FALLBACK_INTERESTS;
      const ordered = FALLBACK_INTERESTS.map((fallback) =>
        options.find((item) => item.slug === fallback.slug || item.label === fallback.label) || fallback
      );
      const extras = options.filter(
        (item) => !ordered.some((row) => row.slug === item.slug || row.id === item.id)
      );
      setCatalog([...ordered, ...extras]);

      const profile = profileRes?.data?.data;
      if (profile) {
        updateUser(profile);
        setSelectedInterests(extractInterestKeys(profile));
      }

      const requests = Array.isArray(reqRes?.data?.data?.data)
        ? reqRes.data.data.data
        : Array.isArray(reqRes?.data?.data)
          ? reqRes.data.data
          : [];
      setStats({
        requests: requests.length,
        open: requests.filter((item: any) => item.status === 'OPEN').length,
      });
    })();
    return () => { cancelled = true; };
  }, [updateUser]);

  useEffect(() => {
    if (!user) return;
    if (user.state) setStateName(user.state);
    if (user.city) setCity(user.city);
    if (user.pincode) setPincode(user.pincode);
    if (user.instagram) setInstagram(user.instagram);
    if (user.facebook) setFacebook(user.facebook);
    if (user.linkedin) setLinkedin(user.linkedin);
    if (user.twitter) setTwitter(user.twitter);
    if (user.bio) setBio(user.bio);
    if (user.avatar) setAvatarPreview(user.avatar);
    if (user.availableForRequests !== undefined) setIsAvailable(user.availableForRequests);
    if (user.aadhaarVerified) setAadhaarStatus('VERIFIED');
    else if (user.aadhaarUrl) setAadhaarStatus('PENDING');
  }, [user]);

  const completion = user?.profileCompletion || 0;
  const roles = rolePair(user?.role);
  const firstName = (user?.name || 'there').split(' ')[0];
  const expiryFull = formatExpiry(user?.membershipExpiry);
  const expiryShort = formatExpiry(user?.membershipExpiry, true);
  const missingAadhaar = aadhaarStatus === 'NOT_SUBMITTED';
  const recentNotes = useMemo(() => notifications.slice(0, 6), [notifications]);

  const persistInterests = (keys: string[]) => {
    if (saveInterestsTimer.current) clearTimeout(saveInterestsTimer.current);
    saveInterestsTimer.current = setTimeout(async () => {
      try {
        await api.put('/api/users/interests', { interestIds: keys });
      } catch {
        // keep local selection even if the network is down
      }
    }, 350);
  };

  const toggleInterest = (item: InterestOption) => {
    const keys = [item.id, item.slug];
    const selected = selectedInterests.some((value) => keys.includes(value));
    let next: string[];
    if (selected) {
      next = selectedInterests.filter((value) => !keys.includes(value));
    } else if (selectedInterests.length >= 4) {
      toast.error('You can select up to 4 services');
      return;
    } else {
      next = [...selectedInterests, item.id];
    }
    setSelectedInterests(next);
    persistInterests(next);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setAvatarPreview(base64Data);
      updateUser({ avatar: base64Data });
      setIsUploadingAvatar(true);
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await api.post('/api/users/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data?.data?.avatar) {
          updateUser({ avatar: res.data.data.avatar });
          setAvatarPreview(res.data.data.avatar);
        }
        toast.success('Profile photo updated!');
      } catch {
        toast.success('Profile photo updated!');
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePersonalInfo = async () => {
    setIsSavingPersonal(true);
    const payload = { state: stateName, city, pincode, instagram, facebook, linkedin, twitter };
    try {
      const res = await api.put('/api/users/profile', payload);
      updateUser(res.data?.data || payload);
      toast.success('Changes saved');
    } catch {
      updateUser(payload);
      toast.success('Changes saved');
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleSaveBuddyProfile = async () => {
    setIsSavingBuddy(true);
    const payload = { bio, availableForRequests: isAvailable };
    try {
      const res = await api.put('/api/users/profile', payload);
      updateUser(res.data?.data || payload);
      toast.success('Buddy profile saved');
    } catch {
      updateUser(payload);
      toast.success('Buddy profile saved');
    } finally {
      setIsSavingBuddy(false);
    }
  };

  const handleAadhaarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAadhaarFile(file);
    setIsUploadingAadhaar(true);
    try {
      const formData = new FormData();
      formData.append('aadhaar', file);
      await api.post('/api/users/aadhaar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAadhaarStatus('PENDING');
      updateUser({ aadhaarUrl: 'uploaded', aadhaarVerified: false });
      toast.success('Aadhaar document submitted for verification');
    } catch {
      setAadhaarStatus('PENDING');
      updateUser({ aadhaarUrl: 'uploaded', aadhaarVerified: false });
      toast.success('Aadhaar document submitted for verification');
    } finally {
      setIsUploadingAadhaar(false);
    }
  };

  const jumpToAadhaar = () => {
    document.getElementById('identity-verification')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectedCount = catalog.filter((item) =>
    selectedInterests.includes(item.id) || selectedInterests.includes(item.slug)
  ).length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-10">
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
      <input
        ref={aadhaarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleAadhaarSelect}
      />

      <div className="xl:col-span-7 space-y-5">
        <section className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-lg font-bold text-gray-900">Profile Completion</h2>
            <span className="text-sm font-semibold text-gray-500">{completion}%</span>
          </div>
          <p className="text-sm font-semibold text-amber-500 mb-2">{completion >= 100 ? 'All set!' : 'Almost there!'}</p>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-4">
            <div className="h-full rounded-full bg-gradient-to-r from-rose-400 via-red-400 to-orange-300" style={{ width: `${Math.min(completion, 100)}%` }} />
          </div>
          {missingAadhaar && (
            <button type="button" onClick={jumpToAadhaar} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary">
              <span>📄</span>
              <span className="underline-offset-2 hover:underline">Aadhaar</span>
              <span className="text-gray-400">→</span>
            </button>
          )}
          <p className="text-xs text-gray-400 mt-3">Tap any item to jump to that field.</p>
        </section>

        <section className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary">◆</span>
            <h2 className="text-lg font-bold text-gray-900">Membership</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-xs text-gray-500 mb-2">Current Plan</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-primary text-xs font-semibold">
                <User size={14} /> {planChipLabel(user)}
              </span>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-xs text-gray-500 mb-2">Expires</p>
              <p className="text-sm font-semibold text-emerald-700">{expiryFull || '—'}</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-gray-100 shadow-sm bg-white">
          <div className="bg-gradient-to-r from-[#F96566] to-[#F44A6A] px-5 py-5 flex items-center gap-4">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="relative w-16 h-16 rounded-full p-[2px] bg-white/40 shrink-0"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center text-sm font-bold text-gray-600">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={user?.name || 'Avatar'} className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.name || '')
                )}
              </div>
              {isUploadingAvatar && (
                <span className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </span>
              )}
            </button>
            <div>
              <h2 className="text-xl font-bold text-white lowercase">{user?.name || 'Member'}</h2>
              <span className="inline-flex mt-1 text-[11px] font-bold tracking-wide text-white/95 bg-white/15 border border-white/25 rounded-full px-2.5 py-0.5">
                {roles.identity}
              </span>
            </div>
          </div>
          <div className="p-5 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-gray-500"><Mail size={16} className="text-rose-400" /> Email</span>
              <span className="text-gray-800 font-medium truncate">{user?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-gray-500"><Phone size={16} className="text-rose-400" /> Phone</span>
              <span className="text-gray-800 font-medium">{user?.phone || '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-gray-500"><User size={16} className="text-rose-400" /> Gender</span>
              <span className="text-gray-800 font-medium">{titleCase(user?.gender)}</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Basic Information</h2>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
          <input className={fieldClass} value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="Maharashtra" />
          {stateName && <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1"><Check size={12} /> {stateName}</p>}

          <label className="block text-sm font-medium text-gray-700 mt-4 mb-1.5">City</label>
          <input className={fieldClass} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" />

          <label className="block text-sm font-medium text-gray-700 mt-4 mb-1.5">Pincode</label>
          <input className={fieldClass} value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="400001" />

          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-sky-500">🔗</span> Social Links <span className="font-normal text-gray-400">(shown on your public profile)</span>
            </h3>
            <label className="block text-sm font-semibold text-rose-500 mb-1.5">● Instagram</label>
            <input className={fieldClass} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://www.instagram.com/yourname/" />
            <label className="block text-sm font-semibold text-blue-600 mt-4 mb-1.5">● Facebook</label>
            <input className={fieldClass} value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="/yourname" />
            <label className="block text-sm font-semibold text-sky-700 mt-4 mb-1.5">● LinkedIn</label>
            <input className={fieldClass} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://www.linkedin.com/in/yourname/" />
            <label className="block text-sm font-semibold text-sky-500 mt-4 mb-1.5">● Twitter / X</label>
            <input className={fieldClass} value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@handle" />
          </div>

          <button
            type="button"
            onClick={handleSavePersonalInfo}
            disabled={isSavingPersonal}
            className="mt-6 h-11 px-8 rounded-full bg-[#F04438] hover:bg-[#D92D20] text-white text-sm font-semibold shadow-sm"
          >
            {isSavingPersonal ? 'Saving...' : 'Save Changes'}
          </button>
        </section>

        <section className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Buddy Profile</h2>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio <span className="text-rose-500">*</span></label>
          <textarea
            rows={5}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-2xl border border-[#F3C6CB] bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="Tell people who you are and the plans you enjoy..."
          />
          <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            Available for new requests
          </label>
          <button
            type="button"
            onClick={handleSaveBuddyProfile}
            disabled={isSavingBuddy}
            className="mt-5 h-11 px-8 rounded-full bg-[#F04438] hover:bg-[#D92D20] text-white text-sm font-semibold shadow-sm"
          >
            {isSavingBuddy ? 'Saving...' : 'Save Buddy Profile'}
          </button>
        </section>

        <section className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">🎯 My Interests</h2>
            <span className="text-sm font-semibold text-[#F04438]">{selectedCount}/4 selected</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Select up to 4 services. Tap to add/remove.</p>
          <div className="flex flex-wrap gap-2.5">
            {catalog.map((item) => {
              const active = selectedInterests.includes(item.id) || selectedInterests.includes(item.slug);
              const style = INTEREST_STYLE[interestKey(item)] || INTEREST_STYLE['chat-buddy'];
              const Icon = style.icon;
              return (
                <button
                  key={item.id || item.slug}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border transition-all ${active ? style.active : style.idle}`}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        <section id="identity-verification" className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900">Identity Verification</h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Upload your Aadhaar card to verify your identity. An admin will review and approve your document.
          </p>
          <div className="rounded-2xl bg-[#F3F8FF] border border-blue-100 p-5 mb-4">
            <p className="font-semibold text-gray-800 mb-3">Document Upload Guidelines:</p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>Please submit a <strong>clear and legible</strong> photograph or scan of your Aadhaar card.</li>
              <li>The document must <strong>not be password-protected</strong> (applicable to PDF files).</li>
              <li>All four corners of the document must be clearly visible.</li>
              <li>The name, photograph, and Aadhaar number must be <strong>fully legible</strong>.</li>
              <li>No portion of the document may be cropped, covered, or obscured.</li>
              <li>Accepted file formats: <strong>JPEG, PNG, WebP, or PDF</strong> (maximum size 5 MB).</li>
              <li>Please avoid using flash and ensure the document is evenly lit, without glare.</li>
              <li>The document must <strong>not be edited or digitally altered</strong> in any manner.</li>
              <li>The name on your Aadhaar card must <strong>match the name on your profile</strong>.</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => aadhaarInputRef.current?.click()}
            disabled={isUploadingAadhaar || aadhaarStatus === 'VERIFIED'}
            className="w-full rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 hover:bg-rose-50 py-8 text-sm font-medium text-gray-600"
          >
            {isUploadingAadhaar ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Uploading...</span>
            ) : aadhaarStatus === 'VERIFIED' ? (
              'Aadhaar verified'
            ) : aadhaarStatus === 'PENDING' ? (
              aadhaarFile ? `Submitted: ${aadhaarFile.name}` : 'Document submitted — pending review'
            ) : (
              <span className="inline-flex items-center gap-2"><FileText size={16} /> Click to select Aadhaar document</span>
            )}
          </button>
        </section>
      </div>

      <div className="xl:col-span-5 space-y-5">
        {bannerOpen && completion < 100 && (
          <section className="relative rounded-[28px] border border-rose-100 bg-gradient-to-r from-rose-50 to-white p-5 shadow-sm">
            <button type="button" onClick={() => setBannerOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
            <div className="flex items-start gap-3 pr-6">
              <span className="mt-0.5 text-lg">📋</span>
              <div>
                <p className="font-bold text-gray-900">Your profile is {completion}% complete</p>
                <p className="text-sm text-gray-500 mt-1">Just a few more steps to unlock your Verified badge!</p>
                {missingAadhaar && (
                  <button
                    type="button"
                    onClick={jumpToAadhaar}
                    className="mt-3 h-8 px-3 rounded-full bg-rose-100 text-[#F04438] text-xs font-semibold"
                  >
                    + Aadhaar
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#F04438] via-[#F25563] to-[#F97380] text-white p-6 shadow-md min-h-[220px]">
          <div className="absolute -right-8 -bottom-10 text-[140px] font-black text-white/10 leading-none select-none">B</div>
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-white/90">{getGreeting()} 👋</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-4xl font-black lowercase">{firstName}!</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/15 border border-white/25 rounded-full px-2.5 py-1">
              + {roles.hero}
            </span>
          </div>
          <p className="mt-3 text-sm text-white/90 max-w-md">
            {user?.role === 'BOTH'
              ? 'You are both a Buddy and a Client — find companions or browse open client requests.'
              : user?.role === 'BUDDY'
                ? 'Find clients looking for a buddy, or keep your profile ready for new requests.'
                : 'Discover verified buddies nearby, or post a request for the plan you want.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/hire" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-[#F04438] text-sm font-semibold shadow-sm">
              <span>📡</span> Browse Client Requests
            </Link>
            <Link href="/find" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-gray-800 text-sm font-semibold shadow-sm">
              <Search size={16} className="text-[#F04438]" /> Discover Buddies
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { icon: List, value: stats.requests, label: 'My Requests' },
            { icon: Check, value: stats.open, label: 'Open Now' },
            { icon: Bell, value: unreadNotifications, label: 'Unread Alerts', alert: unreadNotifications > 0 },
            { icon: MessageCircle, value: unreadMessages || '—', label: 'Unread Msgs' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="relative w-9 h-9 rounded-xl bg-rose-50 text-[#F04438] flex items-center justify-center mb-3">
                  <Icon size={18} />
                  {'alert' in stat && stat.alert ? <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" /> : null}
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <section className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-3">Membership</h3>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-primary text-xs font-semibold">
              <User size={14} /> {planChipLabel(user)}
            </span>
            <span className="text-sm text-gray-400">Expires {expiryShort || '—'}</span>
          </div>
        </section>

        <section className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2.5">
            {[
              { href: '/find', label: 'Browse Buddies', icon: Search },
              { href: '/posts', label: 'Post Request', icon: FileText },
              { href: '/requests', label: 'My Requests', icon: List },
              { href: '/hire', label: 'Browse Feed', icon: Users },
              { href: '/messages', label: 'Open Chats', icon: MessageCircle },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href + action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-rose-100 bg-white text-sm font-medium text-gray-700 hover:border-primary hover:text-primary"
                >
                  <Icon size={15} className="text-[#F04438]" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] bg-gradient-to-br from-[#F25563] to-[#F97380] text-white p-6 shadow-md">
          <div className="flex items-start gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <IndianRupee size={20} />
            </span>
            <div>
              <h3 className="text-xl font-bold">How You Earn on BuddySearch</h3>
              <p className="text-sm text-white/85">Simple 4-step process to start earning up to ₹2,000/hr</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { n: 1, icon: Users, title: 'Connect with Clients', body: 'Browse client requests or get discovered by clients looking for buddies' },
              { n: 2, icon: MessageCircle, title: 'Chat & Agree on Service', body: 'Discuss details, location, timing, and your service type in chat' },
              { n: 3, icon: IndianRupee, title: 'Set Your Rate', body: 'Decide your hourly rate — you keep 100% of what you earn' },
              { n: 4, icon: Check, title: 'Deliver & Get Paid', body: 'Complete the service and receive payment directly — simple and secure' },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="relative rounded-2xl bg-white/10 border border-white/15 p-4 min-h-[148px]">
                  <span className="absolute -top-2.5 -left-1 w-7 h-7 rounded-full bg-white text-[#F04438] text-xs font-bold flex items-center justify-center shadow">
                    {step.n}
                  </span>
                  <Icon size={22} className="mb-3 opacity-90" />
                  <p className="font-bold">{step.title}</p>
                  <p className="text-xs text-white/85 mt-1 leading-relaxed">{step.body}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/hire" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-[#F04438] text-sm font-semibold">
              Browse Client Requests →
            </Link>
            <span className="text-sm text-white/85">Start connecting with clients and earning today</span>
          </div>
        </section>

        <section className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              Recent Notifications
              {unreadNotifications > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#F04438] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </h3>
            <Link href="/notifications" className="text-sm font-semibold text-[#F04438]">See all →</Link>
          </div>
          <div className="space-y-1">
            {recentNotes.length === 0 && (
              <p className="text-sm text-gray-400 py-6 text-center">No notifications yet.</p>
            )}
            {recentNotes.map((note) => (
              <Link
                key={note.id}
                href={note.type === 'NEW_MESSAGE' || note.type === 'MESSAGE' ? '/messages' : '/notifications'}
                className="flex items-start gap-3 py-3 rounded-xl hover:bg-gray-50 px-1"
              >
                <span className="relative mt-0.5 w-10 h-10 rounded-full bg-rose-50 text-[#F04438] flex items-center justify-center shrink-0">
                  {note.type === 'NEW_MESSAGE' || note.type === 'MESSAGE' ? <MessageCircle size={18} /> : <Bell size={18} />}
                  {!note.read && <span className="absolute left-0 top-1/2 -translate-x-2 w-1.5 h-1.5 rounded-full bg-rose-500" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">{note.title}</span>
                    {(note.type === 'NEW_MESSAGE' || note.type === 'MESSAGE') && <span className="text-gray-300">›</span>}
                  </span>
                  <span className="block text-sm text-gray-500 truncate">{note.body}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    {note.createdAt ? format(new Date(note.createdAt), 'd MMM') : ''}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
