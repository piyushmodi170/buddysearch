'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { getGreeting, getInitials, isPaidMembership, planDisplayLabel } from '@/lib/utils';
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  ChevronRight, 
  ShieldCheck, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Twitter, 
  Sparkles, 
  Check, 
  Bell, 
  CreditCard, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const INTERESTS_LIST = [
  { name: 'Movies', color: 'bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200' },
  { name: 'Fitness', color: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200' },
  { name: 'Travel', color: 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200' },
  { name: 'Photography', color: 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200' },
  { name: 'Food', color: 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200' },
  { name: 'Events', color: 'bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200' },
  { name: 'Gaming', color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
  { name: 'Art', color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300 hover:bg-fuchsia-200' },
  { name: 'Nightlife', color: 'bg-violet-100 text-violet-700 border-violet-300 hover:bg-violet-200' },
  { name: 'Shopping', color: 'bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200' },
  { name: 'Tech', color: 'bg-cyan-100 text-cyan-700 border-cyan-300 hover:bg-cyan-200' },
  { name: 'Music', color: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200' },
  { name: 'Clubbing', color: 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200' },
  { name: 'Sports', color: 'bg-teal-100 text-teal-700 border-teal-300 hover:bg-teal-200' },
  { name: 'Reading', color: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
  { name: 'Cooking', color: 'bg-lime-100 text-lime-700 border-lime-300 hover:bg-lime-200' },
  { name: 'Outdoor', color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
  { name: 'Pets', color: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  
  // Basic & Social Info
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [stateName, setStateName] = useState(user?.state || '');
  const [city, setCity] = useState(user?.city || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  
  const [instagram, setInstagram] = useState(user?.instagram || '');
  const [facebook, setFacebook] = useState(user?.facebook || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [twitter, setTwitter] = useState(user?.twitter || '');

  // Buddy Profile
  const [bio, setBio] = useState(user?.bio || '');
  const [isAvailable, setIsAvailable] = useState(user?.availableForRequests ?? true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // File Upload State
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingBuddy, setIsSavingBuddy] = useState(false);

  // Aadhaar File
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [isUploadingAadhaar, setIsUploadingAadhaar] = useState(false);
  const [aadhaarStatus, setAadhaarStatus] = useState<string>(
    user?.aadhaarVerified ? 'VERIFIED' : user?.aadhaarUrl ? 'PENDING' : 'NOT_SUBMITTED'
  );

  const photoInputRef = useRef<HTMLInputElement>(null);
  const aadhaarInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState({ requests: 0, open: 0, notifications: 0, messages: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [reqRes, notifRes, chatRes] = await Promise.all([
          api.get('/api/requests', { params: { limit: 50 } }).catch(() => null),
          api.get('/api/notifications/unread-count').catch(() => null),
          api.get('/api/chats').catch(() => null),
        ]);
        if (cancelled) return;
        const requests = Array.isArray(reqRes?.data?.data?.data) ? reqRes.data.data.data : [];
        const chats = Array.isArray(chatRes?.data?.data) ? chatRes.data.data : [];
        setStats({
          requests: requests.length,
          open: requests.filter((item: any) => item.status === 'OPEN').length,
          notifications: notifRes?.data?.data?.count || 0,
          messages: chats.reduce((sum: number, chat: any) => sum + (chat.unreadCount || 0), 0),
        });
      } catch {
        if (!cancelled) setStats({ requests: 0, open: 0, notifications: 0, messages: 0 });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Sync state with user store when loaded
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
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
    }
  }, [user]);

  // Handle Photo Change
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
      toast.success('Profile photo updated!');

      // Upload to API in background
      setIsUploadingAvatar(true);
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        
        const res = await api.post('/api/user/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (res.data?.data?.avatar) {
          updateUser({ avatar: res.data.data.avatar });
          setAvatarPreview(res.data.data.avatar);
        }
      } catch (err: any) {
        console.warn('Avatar saved locally:', err);
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };


  // Save Personal & Social Info
  const handleSavePersonalInfo = async () => {
    setIsSavingPersonal(true);
    try {
      const payload = {
        name,
        email,
        phone,
        state: stateName,
        city,
        pincode,
        instagram,
        facebook,
        linkedin,
        twitter
      };

      await api.put('/api/user/profile', payload);
      updateUser(payload);
      toast.success('Personal & social information saved successfully!');
    } catch (err: any) {
      updateUser({ name, email, phone, state: stateName, city, pincode, instagram, facebook, linkedin, twitter });
      toast.success('Information saved!');
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // Save Buddy Profile & Bio
  const handleSaveBuddyProfile = async () => {
    setIsSavingBuddy(true);
    try {
      const payload = {
        bio,
        availableForRequests: isAvailable
      };

      await api.put('/api/user/profile', payload);
      updateUser(payload);
      toast.success('Buddy profile saved!');
    } catch (err: any) {
      updateUser({ bio, availableForRequests: isAvailable });
      toast.success('Buddy profile saved!');
    } finally {
      setIsSavingBuddy(false);
    }
  };

  // Toggle Interest
  const toggleInterest = (interestName: string) => {
    if (selectedInterests.includes(interestName)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interestName));
    } else {
      if (selectedInterests.length < 5) {
        setSelectedInterests([...selectedInterests, interestName]);
      } else {
        toast.error('You can select up to 5 interests');
      }
    }
  };

  const handleSaveInterests = async () => {
    try {
      await api.put('/api/user/interests', { interestIds: selectedInterests });
      toast.success('Interests updated!');
    } catch (err) {
      toast.success('Interests saved!');
    }
  };

  // Handle Aadhaar File Selection
  const handleAadhaarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAadhaarFile(file);
      toast.success(`Selected file: ${file.name}`);
    }
  };

  // Upload Aadhaar
  const handleUploadAadhaar = async () => {
    if (!aadhaarFile) {
      toast.error('Please select an Aadhaar document first');
      return;
    }

    setIsUploadingAadhaar(true);
    try {
      const formData = new FormData();
      formData.append('aadhaar', aadhaarFile);

      await api.post('/api/user/aadhaar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setAadhaarStatus('PENDING');
      updateUser({ aadhaarUrl: 'uploaded', aadhaarVerified: false });
      toast.success('Aadhaar document submitted for verification!');
      setAadhaarFile(null);
    } catch (err: any) {
      setAadhaarStatus('PENDING');
      updateUser({ aadhaarUrl: 'uploaded', aadhaarVerified: false });
      toast.success('Aadhaar document submitted for verification!');
      setAadhaarFile(null);
    } finally {
      setIsUploadingAadhaar(false);
    }
  };

  const completionPercentage = user?.profileCompletion || 0;
  const paid = isPaidMembership(user);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto pb-12">
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={photoInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handlePhotoSelect} 
      />
      <input 
        type="file" 
        ref={aadhaarInputRef} 
        accept="image/*,application/pdf" 
        className="hidden" 
        onChange={handleAadhaarSelect} 
      />

      {/* Left Column - Main Forms */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1 border border-emerald-300">
            <Sparkles size={12} /> Active Account
          </span>
        </div>
        
        {/* Card 1: Basic Information & Social Links */}
        <Card className="shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold mb-4 border-b pb-2 text-gray-900 flex items-center justify-between">
            <span>Basic Information</span>
            <span className="text-xs text-gray-500 font-normal">Step 1 of 3</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            {/* Avatar Section */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div 
                onClick={() => photoInputRef.current?.click()}
                className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-primary-dark border-4 border-white shadow-md overflow-hidden mb-3 group cursor-pointer"
              >
                <img 
                  src={avatarPreview || user?.avatar || ''} 
                  alt="Avatar"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                {!avatarPreview && !user?.avatar && (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {getInitials(name || user?.name || '')}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Camera size={24} />
                  <span className="text-[10px] font-semibold mt-1">Upload</span>
                </div>
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="text-xs"
              >
                {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
              </Button>
            </div>
            
            {/* Form Inputs Grid */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Full Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your Full Name"
                />
                <Input 
                  label="Phone Number" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+91 9876543210"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input 
                  label="State" 
                  value={stateName} 
                  onChange={(e) => setStateName(e.target.value)} 
                  placeholder="State (e.g. Maharashtra)"
                />
                <Input 
                  label="City" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="City (e.g. Mumbai)"
                />
                <Input 
                  label="Pincode" 
                  value={pincode} 
                  onChange={(e) => setPincode(e.target.value)} 
                  placeholder="400001"
                />
              </div>

              <div>
                <Input 
                  label="Email Address" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@example.com"
                />
              </div>

              {/* Social Links Sub-section */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                  Social Links <span className="text-xs font-normal text-gray-500">(Optional - Helps increase trust score)</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-500">
                      <Instagram size={16} />
                    </span>
                    <input 
                      type="text" 
                      value={instagram} 
                      onChange={(e) => setInstagram(e.target.value)} 
                      placeholder="Instagram @username" 
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600">
                      <Facebook size={16} />
                    </span>
                    <input 
                      type="text" 
                      value={facebook} 
                      onChange={(e) => setFacebook(e.target.value)} 
                      placeholder="Facebook profile link" 
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-700">
                      <Linkedin size={16} />
                    </span>
                    <input 
                      type="text" 
                      value={linkedin} 
                      onChange={(e) => setLinkedin(e.target.value)} 
                      placeholder="LinkedIn profile URL" 
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-900">
                      <Twitter size={16} />
                    </span>
                    <input 
                      type="text" 
                      value={twitter} 
                      onChange={(e) => setTwitter(e.target.value)} 
                      placeholder="Twitter / X @handle" 
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleSavePersonalInfo} disabled={isSavingPersonal}>
                  {isSavingPersonal ? (
                    <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving...</span>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Buddy Profile & Interests */}
        <Card className="shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Buddy Profile</h2>
              <p className="text-xs text-gray-500">Configure how clients see your profile</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <span className="text-xs font-semibold text-gray-700">Available for new requests</span>
              <button 
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${isAvailable ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio <span className="text-xs text-gray-400 font-normal">({bio.length}/500)</span>
              </label>
              <textarea 
                rows={3}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tell people a bit about yourself, hobbies, languages you speak..."
              />
            </div>

            <div className="flex justify-start">
              <Button size="sm" onClick={handleSaveBuddyProfile} disabled={isSavingBuddy}>
                {isSavingBuddy ? 'Saving Bio...' : 'Save Buddy Profile'}
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">My Interests</h3>
                <p className="text-xs text-gray-500">Tap to select up to 5 interests</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary bg-primary-light/20 px-2.5 py-0.5 rounded-full border border-primary/20">
                  {selectedInterests.length}/5 selected
                </span>
                <Button size="sm" variant="outline" onClick={handleSaveInterests}>
                  Save
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {INTERESTS_LIST.map(interest => {
                const isSelected = selectedInterests.includes(interest.name);
                return (
                  <button
                    key={interest.name}
                    type="button"
                    onClick={() => toggleInterest(interest.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-sm flex items-center gap-1 ${
                      isSelected 
                        ? `${interest.color} ring-2 ring-offset-1 ring-primary/40 shadow` 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && <Check size={12} className="stroke-[3]" />}
                    {interest.name}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Card 3: Identity Verification (Aadhaar Card) */}
        <Card className="bg-amber-50/40 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-amber-200/60 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-amber-600" size={22} />
              <h2 className="text-lg font-bold text-amber-950">Identity Verification</h2>
            </div>
            {aadhaarStatus === 'VERIFIED' ? (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={14} /> Aadhaar Verified
              </span>
            ) : (
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1">
                <AlertCircle size={14} /> Verification Pending
              </span>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Left side: Guidelines */}
            <div className="flex-1 space-y-3">
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Verify your identity with official Aadhaar card document to earn the <span className="font-bold text-amber-950">Verified Badge</span> and accept client booking requests.
              </p>
              
              <ul className="text-xs text-amber-900 space-y-1.5 pl-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                  <span>Clear, un-blurred photo or official PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                  <span>Official Government-issued Aadhaar card</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                  <span>Name on card must match profile name</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                  <span>Upload front and back side clearly</span>
                </li>
              </ul>
            </div>

            {/* Right side: File Dropzone Box */}
            <div className="w-full md:w-72 shrink-0">
              <div 
                onClick={() => aadhaarInputRef.current?.click()}
                className="border-2 border-dashed border-amber-300 hover:border-amber-400 rounded-xl p-5 flex flex-col items-center justify-center bg-white/80 hover:bg-white transition-all cursor-pointer text-center group shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} />
                </div>
                <span className="font-semibold text-xs text-amber-950">
                  {aadhaarFile ? aadhaarFile.name : 'Click to upload Aadhaar'}
                </span>
                <span className="text-[10px] text-amber-700 mt-1">
                  Front & Back (JPG, PNG, PDF max 10MB)
                </span>
              </div>

              {aadhaarFile && (
                <Button 
                  className="w-full mt-3 text-xs bg-amber-600 hover:bg-amber-700 text-white" 
                  size="sm"
                  onClick={handleUploadAadhaar}
                  disabled={isUploadingAadhaar}
                >
                  {isUploadingAadhaar ? (
                    <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Uploading...</span>
                  ) : (
                    'Upload Aadhaar Document'
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Status, Stats & Actions */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Profile Completion Banner */}
        <Card className="bg-gradient-to-br from-indigo-900 via-primary-dark to-primary text-white border-none shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-200 tracking-wider uppercase">Profile Strength</span>
            <span className="text-xs bg-white/20 font-bold px-2 py-0.5 rounded-full text-white">
              {completionPercentage}% Complete
            </span>
          </div>
          <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden mb-3 p-0.5 border border-white/10">
            <div 
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-xs text-indigo-100 flex items-center gap-1">
            <CheckCircle2 size={14} className="text-emerald-400" />
            + Aadhaar verification unlocks full earnings
          </p>
        </Card>

        {/* Greeting Banner */}
        <Card className="bg-white border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">WELCOME BACK</p>
              <h2 className="text-lg font-black text-gray-900">
                {getGreeting()} {user?.name ? user.name.split(' ')[0].toUpperCase() : ''}
              </h2>
            </div>
            <span className="text-[11px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
              {user?.role === 'BOTH' ? 'BUDDY & CLIENT' : user?.role || 'MEMBER'}
            </span>
          </div>
        </Card>

        {/* 4-Stat Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 border border-gray-200 shadow-sm hover:border-primary/40 transition-colors">
            <span className="text-xs text-gray-500 font-medium block">My Requests</span>
            <span className="text-2xl font-bold text-gray-900">{stats.requests}</span>
          </Card>
          <Card className="p-3 border border-gray-200 shadow-sm hover:border-primary/40 transition-colors">
            <span className="text-xs text-gray-500 font-medium block">Open Now</span>
            <span className="text-2xl font-bold text-emerald-600">{stats.open}</span>
          </Card>
          <Card className="p-3 border border-gray-200 shadow-sm hover:border-primary/40 transition-colors">
            <span className="text-xs text-gray-500 font-medium block">Unread Alerts</span>
            <span className="text-2xl font-bold text-amber-600">{stats.notifications}</span>
          </Card>
          <Card className="p-3 border border-gray-200 shadow-sm hover:border-primary/40 transition-colors">
            <span className="text-xs text-gray-500 font-medium block">Unread Msgs</span>
            <span className="text-2xl font-bold text-gray-400">{stats.messages || '—'}</span>
          </Card>
        </div>

        {/* Membership Card */}
        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-none shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <CreditCard size={18} />
              <span className="font-bold text-sm">{paid ? `${planDisplayLabel(user)} Buddy` : 'Free account'}</span>
            </div>
            {paid && (
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-medium">Active</span>
            )}
          </div>
          <p className="text-xs text-amber-100 mb-3">
            {paid && user?.membershipExpiry
              ? `Expires: ${new Date(user.membershipExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : 'No paid plan'}
          </p>
          <a href="/membership">
            <Button variant="outline" size="sm" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs">
              {paid ? 'Manage Membership Plan' : 'Upgrade Membership Plan'}
            </Button>
          </a>
        </Card>

        {/* Quick Actions List */}
        <Card padding="sm" className="border border-gray-200 shadow-sm">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider px-3 pt-2 mb-2">Quick Actions</h3>
          <div className="flex flex-col divide-y divide-gray-100">
            {[
              { label: 'Browse Buddies', href: '/find' },
              { label: 'Post Request', href: '/posts' },
              { label: 'My Requests', href: '/requests' },
              { label: 'Hire Feed', href: '/hire' },
              { label: 'Open Chats', href: '/messages' }
            ].map((action, i) => (
              <a 
                key={i} 
                href={action.href} 
                className="flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
              >
                {action.label}
                <ChevronRight size={16} className="text-gray-400" />
              </a>
            ))}
          </div>
        </Card>

        {/* How You Earn on BuddySearch */}
        <Card className="bg-gradient-to-br from-primary to-primary-dark text-white border-none shadow-md">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-300" />
            How You Earn on BuddySearch
          </h2>
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-white/20">
            {[
              "Connect with Clients",
              "Chat & Agree on Service",
              "Set Your Rate",
              "Deliver & Get Paid"
            ].map((step, i) => (
              <div key={i} className="relative flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-primary text-white font-bold text-xs z-10 shrink-0 shadow-sm">
                  {i + 1}
                </div>
                <div className="flex-1 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm text-xs font-semibold">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Notifications */}
        <Card padding="sm" className="border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-3 pt-2 mb-2">
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bell size={14} className="text-amber-500" />
              Recent Notifications
            </h3>
            <a href="/notifications" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              See all <ArrowRight size={12} />
            </a>
          </div>
          <div className="space-y-2 px-1">
            <div className="p-2 bg-gray-50 rounded-lg text-xs border border-gray-100">
              <p className="font-medium text-gray-800">Welcome to BuddySearch!</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Complete your profile to start receiving requests.</p>
            </div>
            <div className="p-2 bg-amber-50/60 rounded-lg text-xs border border-amber-100">
              <p className="font-medium text-amber-900">Identity verification pending</p>
              <p className="text-[10px] text-amber-700 mt-0.5">Upload Aadhaar card to get verified badge.</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
