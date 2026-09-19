'use client';
import React, { useState } from 'react';
import { Search, MapPin, Filter, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const MOCK_BUDDIES = [
  { id: 1, name: 'Priya Sharma', role: 'Premium Buddy', city: 'Mumbai', image: 'https://i.pravatar.cc/150?img=1', online: true, interests: ['Movies', 'Cafes', 'Shopping'] },
  { id: 2, name: 'Rahul Verma', role: 'Verified Buddy', city: 'Delhi', image: 'https://i.pravatar.cc/150?img=11', online: false, interests: ['Sports', 'Gaming'] },
  { id: 3, name: 'Sneha Patel', role: 'New Buddy', city: 'Bangalore', image: 'https://i.pravatar.cc/150?img=5', online: true, interests: ['Travel', 'Photography', 'Food'] },
  { id: 4, name: 'Amit Kumar', role: 'Verified Buddy', city: 'Pune', image: 'https://i.pravatar.cc/150?img=15', online: true, interests: ['Gym', 'Running'] },
  { id: 5, name: 'Neha Singh', role: 'Premium Buddy', city: 'Mumbai', image: 'https://i.pravatar.cc/150?img=9', online: false, interests: ['Art', 'Museums', 'Events'] },
  { id: 6, name: 'Vikram Das', role: 'Verified Buddy', city: 'Hyderabad', image: 'https://i.pravatar.cc/150?img=12', online: true, interests: ['Tech Events', 'Networking'] },
];

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('for-you');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full md:w-96">
          <Input 
            icon={<Search size={18} />} 
            placeholder="Search by name, interest, city..." 
            className="w-full bg-gray-50 border-transparent focus:bg-white"
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_BUDDIES.map((buddy) => (
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
                {buddy.interests.map((interest, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                    {interest}
                  </span>
                ))}
              </div>
              <div className="mt-6">
                <Button className="w-full shadow-md"><MessageSquare size={16} className="mr-2"/> Chat Now</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
