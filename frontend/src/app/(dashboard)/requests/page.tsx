'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, MoreHorizontal, Plus, Calendar, MapPin, IndianRupee, Loader2, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface RequestItem {
  id: string;
  title: string;
  category: string;
  description?: string;
  budget?: number;
  location?: string;
  status: 'OPEN' | 'CLOSED' | 'EXPIRED';
  createdAt: string | Date;
  dateTime?: string | Date;
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Edit State Tracking
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editBudget, setEditBudget] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'OPEN' | 'CLOSED' | 'EXPIRED'>('OPEN');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load Requests from API
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/requests');
      const list = res.data?.data?.data;
      setRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Start Editing a Request
  const startEditing = (req: RequestItem) => {
    setEditingId(req.id);
    setEditTitle(req.title);
    setEditCategory(req.category || 'General');
    setEditDescription(req.description || '');
    setEditBudget(req.budget !== undefined && req.budget !== null ? String(req.budget) : '');
    setEditLocation(req.location || '');
    setEditStatus(req.status || 'OPEN');
  };

  // Cancel Editing
  const cancelEditing = () => {
    setEditingId(null);
  };

  // Save Request Changes
  const handleSave = async (id: string) => {
    if (!editTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    const updatedData = {
      title: editTitle.trim(),
      category: editCategory.trim() || 'General',
      description: editDescription.trim(),
      budget: editBudget ? parseFloat(editBudget) : undefined,
      location: editLocation.trim(),
      status: editStatus,
    };

    try {
      await api.put(`/api/requests/${id}`, updatedData);
      setRequests(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
      toast.success('Request updated successfully!');
      setEditingId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not update request');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Request
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    setDeletingId(id);
    try {
      await api.delete(`/api/requests/${id}`);
      setRequests(prev => prev.filter(item => item.id !== id));
      toast.success('Request deleted');
    } catch (err) {
      toast.error('Could not delete request');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your posted requests and incoming buddy offers.
          </p>
        </div>
        <Link href="/posts">
          <Button className="shadow-md bg-red-500 hover:bg-red-600 text-white font-semibold">
            <Plus size={18} className="mr-2" /> Post New Request
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 border-dashed border-2">
          <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Plus size={24} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No requests yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm">Post a request to find the perfect buddy for your activity.</p>
          <Link href="/posts">
            <Button className="bg-red-500 hover:bg-red-600 text-white">Post Your First Request</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => {
            const isEditing = editingId === req.id;

            return (
              <Card 
                key={req.id} 
                className={`transition-all border ${isEditing ? 'ring-2 ring-red-400 border-red-300 shadow-md bg-white' : 'hover:border-gray-300 shadow-sm'}`}
              >
                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-red-100 text-red-600 border border-red-200">
                      {isEditing ? editCategory : req.category}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border ${
                      (isEditing ? editStatus : req.status) === 'OPEN' 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                        : 'bg-gray-100 text-gray-600 border-gray-300'
                    }`}>
                      {isEditing ? editStatus : req.status}
                    </span>
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => startEditing(req)}
                        title="Edit Request"
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(req.id)}
                        disabled={deletingId === req.id}
                        title="Delete Request"
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        {deletingId === req.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* EDIT MODE FORM */}
                {isEditing ? (
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                        <Edit2 size={16} className="text-red-500" /> Edit Request
                      </h3>
                      <button 
                        onClick={cancelEditing} 
                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>

                    {/* Title Input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                      <input 
                        type="text" 
                        maxLength={150}
                        value={editTitle} 
                        onChange={(e) => setEditTitle(e.target.value)} 
                        className="w-full px-3 me-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent font-medium"
                        placeholder="Request title..."
                      />
                      <div className="flex justify-end mt-1">
                        <span className="text-[10px] text-gray-400">{editTitle.length}/150</span>
                      </div>
                    </div>

                    {/* Category Input */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                        <input 
                          type="text" 
                          value={editCategory} 
                          onChange={(e) => setEditCategory(e.target.value)} 
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                          placeholder="e.g. Nightout Buddy, Fitness, Travel"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                        <select 
                          value={editStatus} 
                          onChange={(e) => setEditStatus(e.target.value as 'OPEN' | 'CLOSED' | 'EXPIRED')}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white font-medium"
                        >
                          <option value="OPEN">Open (Accepting Buddies)</option>
                          <option value="CLOSED">Closed</option>
                          <option value="EXPIRED">Expired</option>
                        </select>
                      </div>
                    </div>

                    {/* Description Textarea */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                      <textarea 
                        rows={4}
                        maxLength={500}
                        value={editDescription} 
                        onChange={(e) => setEditDescription(e.target.value)} 
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent leading-relaxed"
                        placeholder="Describe what you are looking for..."
                      />
                      <div className="flex justify-end mt-1">
                        <span className="text-[10px] text-gray-400">{editDescription.length}/500</span>
                      </div>
                    </div>

                    {/* Budget & Location Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Budget (₹) <span className="text-gray-400 font-normal">optional</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-bold">
                            ₹
                          </span>
                          <input 
                            type="number" 
                            value={editBudget} 
                            onChange={(e) => setEditBudget(e.target.value)} 
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent font-semibold"
                            placeholder="499.00"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Set the price you're willing to pay. Leave empty to remove budget.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                        <input 
                          type="text" 
                          value={editLocation} 
                          onChange={(e) => setEditLocation(e.target.value)} 
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                          placeholder="e.g. Bandra, Mumbai"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button 
                        onClick={() => handleSave(req.id)} 
                        disabled={isSaving}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl shadow-md text-sm transition-all"
                      >
                        {isSaving ? (
                          <span className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" /> Saving Changes...
                          </span>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* NORMAL CARD VIEW */
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{req.title}</h3>
                    {req.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {req.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 border-t border-gray-100 pt-3 mt-2">
                      {req.location && (
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin size={14} className="text-red-500"/> {req.location}
                        </span>
                      )}
                      {req.budget !== undefined && req.budget !== null && req.budget > 0 && (
                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                          <IndianRupee size={14} /> {req.budget}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400"/> 
                        {req.dateTime ? new Date(req.dateTime).toLocaleDateString() : new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-400">
                        Posted {formatDistanceToNow(new Date(req.createdAt))} ago
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
