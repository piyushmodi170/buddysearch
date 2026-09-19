'use client';
import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { AlertCircle, Loader2 } from 'lucide-react';

export function Filter({ options, value, onChange }: {
  options: [string, string][];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      {options.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
    </select>
  );
}

export function Pagination({ page, pages, onChange }: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-6">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      <span className="text-sm text-gray-500">Page {page} of {pages}</span>
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</Button>
    </div>
  );
}

export function ErrorCard({ message }: { message: string }) {
  if (!message) return null;
  return (
    <Card className="flex items-start gap-3 border-red-200 bg-red-50 mb-6">
      <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
      <p className="text-sm text-red-700">{message}</p>
    </Card>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-gray-400" size={32} />
    </div>
  );
}
