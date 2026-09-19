'use client';
import React, { useEffect, useState } from 'react';
import { Search, MapPin, Filter, MessageSquare, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import api from '@/lib/api';

function mapBuddy(user: any) {
  const interests = (user.interests || [])
    .map((item: any) => item.interest?.label || item.interest?.slug || item.label)
    .filter(Boolean);
  return {
    id: user.id,
    name: user.name,
    role: user.role === 'BOTH' ? 'Buddy' : user.role === 'BUDDY' ? 'Verified Buddy' : 'Member',
    city: user.city || 'India',
    image: user.avatar,
    online: Boolean(user.isOnline),
    interests,
  };
}

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('for-you');
  const [search, setSearch] = useState('');
  const [buddies, setBuddies] = useState<ReturnType<typeof mapBuddy>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/users/discover', {
          params: { tab: activeTab, search: search || undefined, limit: 30 },
        });
        const rows = res.data?.data?.data || [];
        if (!cancelled) setBuddies(rows.map(mapBuddy));
      } catch {
        if (!cancelled) setBuddies([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeTab, search]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full md:w-96">
          <Input
            icon={<Search size={18} />}
            placeholder="Search by name, interest, city..."
            className="w-full bg-gray-50 border-transparent focus:bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Button variant="outline" className="shrink-0"><MapPin size={16} className="mr-2"/> Location</Button>
          <Button variant="outline" className="shrink-0"><Filter size={16} className="mr-2"/> Filters</Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'for-you', label: 'For You' },
          { id: 'near-you', label: 'Near You' },
          { id: 'new', label: 'New Joiners' },
          { id: 'trending', label: 'Trending' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="max-w-md mx-auto mb-8 bg-gray-100/80 p-1.5"
      />

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : buddies.length === 0 ? (
        <Card className="text-center py-16">
          <h3 className="font-bold text-gray-900 mb-1">No buddies to show yet</h3>
          <p className="text-sm text-gray-500">Real members appear here when they make themselves available.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {buddies.map((buddy) => (
            <Card key={buddy.id} padding="none" className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="h-24 bg-gradient-to-r from-primary-light to-primary opacity-80" />
              <div className="px-5 pb-5 relative">
                <div className="absolute -top-12 border-4 border-white rounded-full bg-white">
                  <Avatar src={buddy.image} size="xl" isOnline={buddy.online} />
                </div>
                <div className="mt-14 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{buddy.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="mr-1" /> {buddy.city}
                    </div>
                  </div>
                  <Badge variant={buddy.role.includes('Premium') ? 'warning' : 'info'}>{buddy.role}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {buddy.interests.map((interest: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                      {interest}
                    </span>
                  ))}
                </div>
                <div className="mt-6">
                  <Link href={`/messages?user=${buddy.id}`}>
                    <Button className="w-full shadow-md"><MessageSquare size={16} className="mr-2"/> Chat Now</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
