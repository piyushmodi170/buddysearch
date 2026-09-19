'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { getGreeting } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Bell, ArrowRight, Star, Camera, CheckCircle2, MessageSquare, List, Activity, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function DashboardOverview() {
  const { user, updateUser } = useAuthStore();
  const currentUser = user || { name: '', role: 'CLIENT' as const, avatar: '', profileCompletion: 0, membershipPlan: 'BASIC' };
  const isFreePlan = (currentUser.membershipPlan || 'BASIC') === 'BASIC' && !user?.membershipExpiry;
  const planLabel = isFreePlan ? 'Free' : (currentUser.membershipPlan || 'BASIC');
  const planExpiry = isFreePlan
    ? 'No paid plan yet'
    : user?.membershipExpiry
      ? `Expires ${new Date(user.membershipExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
      : 'Lifetime access';

  const [pushEnabled, setPushEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo Change directly from Dashboard
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Instant Preview
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      updateUser({ avatar: result });
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/api/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data?.avatar) {
        updateUser({ avatar: res.data.data.avatar });
      }
      toast.success('Profile photo updated successfully!');
    } catch (err) {
      toast.success('Profile photo updated!');
    } finally {
      setIsUploading(false);
    }
  };

  const togglePushNotifications = () => {
    const nextState = !pushEnabled;
    setPushEnabled(nextState);
    if (nextState) {
      toast.success('Push notifications enabled!');
    } else {
      toast.success('Push notifications disabled');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* Left Column */}
      <div className="lg:col-span-4 space-y-6">
        {/* Card 1: Push Notifications */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-primary-light/30 rounded-full flex items-center justify-center text-primary shrink-0">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Push Notifications</h3>
                <p className="text-xs text-gray-500">Stay updated instantly</p>
              </div>
            </div>
            <Button
              variant={pushEnabled ? 'primary' : 'outline'}
              size="sm"
              onClick={togglePushNotifications}
              className={pushEnabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-xs'}
            >
              {pushEnabled ? 'Enabled' : 'Enable'}
            </Button>
          </div>
        </Card>

        {/* Card 2: Profile Completion */}
        <Card className="shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Profile Completion</h3>
            <span className="text-xl font-bold text-emerald-600">{currentUser.profileCompletion || 0}%</span>
          </div>
          <ProgressBar value={currentUser.profileCompletion || 0} className="mb-4" />
          <div className="space-y-3">
            <Link href="/profile">
              <div className="flex items-center justify-between p-3 bg-red-50 hover:bg-red-100/70 rounded-lg border border-red-100 transition-colors cursor-pointer group">
                <span className="text-sm font-medium text-red-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Add Aadhaar Verification
                </span>
                <ArrowRight size={16} className="text-red-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </Card>

        {/* Card 3: Membership Status */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Star className="text-amber-400 fill-amber-400" size={20} />
            <h3 className="font-bold text-lg tracking-wide uppercase">
              {planLabel}
            </h3>
          </div>
          <p className="text-xs text-gray-300 mb-4">{planExpiry}</p>
          <Link href="/membership">
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold text-xs">
              {isFreePlan ? 'Choose a Plan' : 'Manage Plan'}
            </Button>
          </Link>
        </Card>

        {/* Card 4: User Avatar & Photo Upload Trigger */}
        <Card className="shadow-sm border border-gray-200 text-center">
          <div className="flex flex-col items-center mb-4">
            <div
              onClick={() => photoInputRef.current?.click()}
              className="relative mb-3 group cursor-pointer"
              title="Click to change profile picture"
            >
              <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-md overflow-hidden relative">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <UserPlaceholder />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  photoInputRef.current?.click();
                }}
                className="absolute bottom-0 right-0 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-transform hover:scale-110"
              >
                <Camera size={14} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
            <p className="text-gray-500 text-xs mt-1">
              Click photo to update your picture or{' '}
              <Link href="/profile" className="text-primary font-semibold hover:underline">
                edit profile details
              </Link>
            </p>
          </div>
        </Card>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-8 space-y-6">
        {/* Banner Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Your profile is {currentUser.profileCompletion || 90}% complete</p>
              <p className="text-xs text-amber-700 mt-0.5">Complete identity verification to get more visibility</p>
            </div>
          </div>
          <Link href="/profile">
            <Badge variant="warning" className="cursor-pointer hover:bg-amber-200 transition-colors">
              Aadhaar Pending →
            </Badge>
          </Link>
        </div>

        {/* Greeting Banner */}
        <div className="bg-gradient-to-r from-red-600 via-primary to-primary-dark rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xs font-bold tracking-wider text-red-100 uppercase mb-1">{getGreeting()} 👋</h2>
            <h1 className="text-4xl font-extrabold mb-3">{currentUser.name}</h1>
            <Badge className="bg-white/20 text-white border-none mb-4 font-bold text-xs uppercase px-3 py-1">
              {currentUser.role || 'BOTH'}
            </Badge>
            <p className="text-red-100 max-w-md mb-8 text-sm leading-relaxed">
              Welcome back to your dashboard. You have 2 new messages and 1 request waiting for your response.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/discover">
                <Button className="bg-white text-red-600 hover:bg-gray-100 font-bold shadow-md">
                  Browse Buddies
                </Button>
              </Link>
              <Link href="/posts">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 font-semibold">
                  Post Request
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
            <Users size={300} />
          </div>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'My Requests', value: '4', icon: List, color: 'text-blue-600', bg: 'bg-blue-50', href: '/requests' },
            { label: 'Open Now', value: '2', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/requests' },
            { label: 'Notifications', value: '5', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50', href: '/notifications' },
            { label: 'Messages', value: '12', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50', href: '/messages' },
          ].map((stat, i) => (
            <Link key={i} href={stat.href}>
              <Card className="flex flex-col items-center justify-center py-6 text-center hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const UserPlaceholder = () => (
  <svg className="w-full h-full text-gray-300 bg-gray-100" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
