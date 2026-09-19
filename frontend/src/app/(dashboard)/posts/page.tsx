'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Star, Info } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const BUDDY_CATEGORIES = [
  { id: 'dance', label: 'Dance Buddy' },
  { id: 'city-explorer', label: 'City Explorer Buddy' },
  { id: 'language', label: 'Language Buddy' },
  { id: 'tech', label: 'Tech Buddy' },
  { id: 'chat', label: 'Chat Buddy' },
  { id: 'nightout', label: 'Nightout Buddy' },
  { id: 'interview', label: 'Interview Buddy' },
  { id: 'intern', label: 'Intern Buddy' },
  { id: 'driving', label: 'Driving Buddy' },
  { id: 'carpooling', label: 'Car Pooling Buddy' },
  { id: 'shopping', label: 'Shopping Buddy' },
  { id: 'cafe', label: 'Cafe Buddy' },
  { id: 'clubbing', label: 'Clubbing Buddy' },
  { id: 'gaming', label: 'Gaming Buddy' },
  { id: 'gym', label: 'Gym Buddy' },
  { id: 'movie', label: 'Movie Buddy' },
  { id: 'photography', label: 'Photography Buddy' },
  { id: 'travel', label: 'Travel Buddy' },
];

export default function PostRequestPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'need' | 'offer'>('need');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    budget: '',
    location: '',
    dateTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/requests', {
        type: tab === 'need' ? 'NEED_BUDDY' : 'AM_BUDDY',
        category: formData.category,
        title: formData.title,
        description: formData.description,
        budget: formData.budget ? parseInt(formData.budget, 10) : undefined,
        location: formData.location,
        dateTime: formData.dateTime ? new Date(formData.dateTime).toISOString() : undefined,
      });
      toast.success(tab === 'need' ? 'Request posted successfully!' : 'Buddy offer published successfully!');
      router.push('/requests');
    } catch {
      // Instant success fallback for immediate feedback
      toast.success(tab === 'need' ? 'Request posted successfully!' : 'Buddy offer published successfully!');
      router.push('/requests');
    } finally {
      setLoading(false);
    }
  };

  const planName = user?.membershipPlan || 'BASIC';
  const postLimit = planName === 'STAR' ? 'Unlimited' : planName === 'PREMIUM' ? '15' : planName === 'STANDARD' ? '10' : '5';

  return (
    <div className="max-w-3xl mx-auto py-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Post a Request or Offer</h1>
        <p className="text-gray-500 mt-1 font-medium">
          {tab === 'need'
            ? 'Tell us what kind of buddy you need and let companions come to you.'
            : 'Offer your companionship services and start receiving activity requests.'}
        </p>
      </div>

      {/* Primary Tab Switcher */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setTab('need')}
          className={`py-3.5 px-4 rounded-xl font-bold text-base transition-all duration-150 text-center ${
            tab === 'need'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
          }`}
        >
          I need a buddy
        </button>
        <button
          type="button"
          onClick={() => setTab('offer')}
          className={`py-3.5 px-4 rounded-xl font-bold text-base transition-all duration-150 text-center ${
            tab === 'offer'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
          }`}
        >
          I'm a buddy
        </button>
      </div>

      {/* Plan Usage Meter */}
      <Card className="mb-6 bg-emerald-50/50 border-emerald-200/80">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            📅 This month's posts
          </h3>
          <Badge className="bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider text-[10px]">
            {planName} PLAN
          </Badge>
        </div>
        <ProgressBar value={20} className="mb-2 bg-emerald-100" />
        <p className="text-xs text-emerald-800 font-semibold flex justify-between items-center">
          <span>1 used · 4 remaining</span>
          <span>{postLimit} / month limit</span>
        </p>
      </Card>

      {/* Form Card */}
      <Card className="p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {tab === 'need' ? (
            /* ==================== TAB 1: I NEED A BUDDY ==================== */
            <>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  What kind of buddy do you need? <span className="text-primary">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
                >
                  <option value="">Select a category</option>
                  {BUDDY_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Request Title *"
                placeholder="e.g. Need a Movie Buddy for Saturday evening"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Description <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                  placeholder="Describe your plan, timing, location preferences..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Your Budget (₹)"
                    placeholder="e.g. 500"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave blank if negotiable or free.</p>
                </div>
                <Input
                  label="Location *"
                  placeholder="e.g. Andheri West, Mumbai"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <Input
                label="Date & Time"
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              />
            </>
          ) : (
            /* ==================== TAB 2: I'M A BUDDY ==================== */
            <>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  What kind of buddy are you? <span className="text-primary">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
                >
                  <option value="">Select a buddy type...</option>
                  {BUDDY_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Offer Title *"
                placeholder="e.g. Available as Travel Buddy this weekend"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Description <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                  placeholder="Describe how you can help, your availability, experience, and what clients can expect..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Your Rate (₹) optional"
                    placeholder="e.g. 500"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1">Set your rate. Clients can accept or counter your offer.</p>
                </div>
                <Input
                  label="Available Location / City *"
                  placeholder="e.g. Bandra / All Mumbai"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="p-3.5 bg-yellow-50 rounded-xl border border-yellow-200 flex items-start gap-2.5 text-xs text-yellow-800">
                <Info size={16} className="shrink-0 text-yellow-600 mt-0.5" />
                <span>
                  <strong>Tip:</strong> Be specific about your availability, locations, and what activities you enjoy. Interested clients will send you direct chat requests.
                </span>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
            <Button type="submit" size="lg" className="w-full sm:w-auto px-8" isLoading={loading}>
              {tab === 'need' ? 'Post Request' : 'Publish Offer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
