'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

type Article = {
  externalId: string;
  slug: string;
  title: string;
  status: string;
  category: string;
  sourceCreatedAt: string;
};

export default function AdminSeoArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/api/admin/seo-articles')
      .then((res) => setArticles(res.data.data.articles || []))
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setStatus = async (id: string, action: 'publish' | 'unpublish') => {
    setBusy(id);
    try {
      await api.post(`/api/admin/seo-articles/${id}/${action}`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Update failed');
    } finally {
      setBusy('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-gray-900">SEO Agent articles</h1>
      <p className="text-sm text-gray-500 mb-6">
        Webhook drafts stay hidden on /blog until you publish. Endpoint:{' '}
        <code className="text-xs">https://buddysearch.online/api/webhooks/seo-agent</code>
      </p>
      {error ? (
        <Card className="flex items-start gap-3 border-red-200 bg-red-50 mb-4">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : null}
      {!articles.length ? (
        <Card>
          <p className="text-sm text-gray-600">No webhook articles yet. Send a test event from The SEO Agent.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Card key={article.externalId} className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <FileText className="text-gray-400 shrink-0 mt-1" size={20} />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{article.title}</p>
                  <p className="text-xs text-gray-500">
                    {article.status} · {article.category} · {article.slug}
                  </p>
                  {article.status === 'published' ? (
                    <Link className="text-xs text-primary font-semibold" href={`/blog/${article.slug}`} target="_blank">
                      View live
                    </Link>
                  ) : null}
                </div>
              </div>
              {article.status === 'published' ? (
                <Button variant="outline" disabled={busy === article.externalId} onClick={() => setStatus(article.externalId, 'unpublish')}>
                  Move to draft
                </Button>
              ) : (
                <Button disabled={busy === article.externalId} onClick={() => setStatus(article.externalId, 'publish')}>
                  Publish
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
