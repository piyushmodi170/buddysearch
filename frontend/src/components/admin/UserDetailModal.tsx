'use client';
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import api from '../../lib/api';
import { formatDate, formatPrice, purchasedPlanName } from '../../lib/utils';

const ROLE_ANSWER: Record<string, string> = {
  CLIENT: 'I need a Buddy (Client)',
  BUDDY: 'I am a Buddy',
  BOTH: 'Both — hire and become a Buddy',
};

const GENDER_ANSWER: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};

type Interest = { id: string; label: string; slug: string; emoji?: string | null };

type UserDetail = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  gender?: string | null;
  bio?: string | null;
  avatar?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  lat?: number | null;
  lng?: number | null;
  verified: boolean;
  emailVerified: boolean;
  banned: boolean;
  isAdmin: boolean;
  aadhaarUrl?: string | null;
  googleLinked?: boolean;
  membershipPlan: string;
  membershipExpiry?: string | Date | null;
  isOnline: boolean;
  lastSeen?: string | Date | null;
  profileCompletion: number;
  availableForRequests: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt?: string;
  interests: Interest[];
  requests: {
    id: string; title: string; description?: string | null; category: string; type: string;
    budget?: number | null; location?: string | null; status: string; createdAt: string;
  }[];
  sentOffers: {
    id: string; message?: string | null; status: string; createdAt: string;
    request?: { id: string; title: string; category: string } | null;
  }[];
  payments: {
    id: string; amount: number; status: string; createdAt: string;
    razorpayOrderId?: string | null; razorpayPaymentId?: string | null;
    upiUtr?: string | null; upiReference?: string | null;
    plan?: { name: string; displayName: string } | null;
  }[];
  receivedReviews: {
    id: string; rating: number; comment?: string | null; createdAt: string;
    reviewer?: { name: string; email?: string } | null;
  }[];
  givenReviews: {
    id: string; rating: number; comment?: string | null; createdAt: string;
    reviewee?: { name: string } | null;
  }[];
  chatCount: number;
  messageCount: number;
  notificationCount: number;
  requestCount: number;
  paymentCount: number;
};

function blank(value: unknown) {
  if (value === null || value === undefined || value === '') return 'Not answered';
  return String(value);
}

function yesNo(value: boolean | undefined) {
  return value ? 'Yes' : 'No';
}

function Row({ question, answer, children }: { question: string; answer?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-1 sm:gap-4 py-3 border-b border-gray-100">
      <dt className="text-sm font-medium text-gray-500">{question}</dt>
      <dd className="text-sm text-gray-900 whitespace-pre-wrap break-words m-0">{children || answer}</dd>
    </div>
  );
}

function Linkish({ href }: { href?: string | null }) {
  if (!href) return <>Not answered</>;
  const url = href.startsWith('http') ? href : `https://${href.replace(/^@/, 'instagram.com/')}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary font-medium break-all">
      {href}
    </a>
  );
}

export function UserDetailModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setDetail(null);
      setError('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    setDetail(null);
    api.get(`/api/admin/users/${userId}`)
      .then((res) => {
        if (!cancelled) setDetail(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load this member');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <Modal isOpen={!!userId} onClose={onClose} title={detail?.name || 'Member details'} className="max-w-3xl">
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-gray-400" size={28} />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {detail && (
        <div className="-mt-2">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {detail.avatar
              ? <img src={detail.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
              : <div className="w-14 h-14 rounded-full bg-gray-200" />}
            <div>
              <p className="font-semibold text-gray-900">{detail.name}</p>
              <p className="text-xs text-gray-500">{detail.email}</p>
            </div>
            {detail.banned ? <Badge variant="danger">Banned</Badge> : null}
            {detail.verified ? <Badge variant="success">ID verified</Badge> : <Badge variant="warning">ID unverified</Badge>}
            {detail.onboardingCompleted ? <Badge variant="success">Onboarding done</Badge> : <Badge variant="warning">Onboarding incomplete</Badge>}
          </div>

          <h3 className="text-base font-semibold text-gray-900 mt-6 mb-1">Signup answers</h3>
          <dl>
            <Row question="I need a Buddy / I am a Buddy" answer={ROLE_ANSWER[detail.role] || detail.role} />
            <Row question="Name" answer={blank(detail.name)} />
            <Row question="Email" answer={blank(detail.email)} />
            <Row question="Phone" answer={blank(detail.phone)} />
            <Row question="Signed up with Google" answer={yesNo(detail.googleLinked)} />
            <Row question="Email verified" answer={yesNo(detail.emailVerified)} />
          </dl>

          <h3 className="text-base font-semibold text-gray-900 mt-6 mb-1">Onboarding questions</h3>
          <dl>
            <Row question="Gender" answer={detail.gender ? (GENDER_ANSWER[detail.gender] || detail.gender) : 'Not answered'} />
            <Row question="State" answer={blank(detail.state)} />
            <Row question="City" answer={blank(detail.city)} />
            <Row question="Pincode" answer={blank(detail.pincode)} />
            <Row question="Services / interests">
              {detail.interests?.length
                ? detail.interests.map((item) => `${item.emoji || ''} ${item.label}`.trim()).join(', ')
                : 'Not answered'}
            </Row>
            <Row question="Bio" answer={blank(detail.bio)} />
            <Row question="Available for new requests" answer={yesNo(detail.availableForRequests)} />
            <Row question="Instagram"><Linkish href={detail.instagram} /></Row>
            <Row question="Facebook"><Linkish href={detail.facebook} /></Row>
            <Row question="LinkedIn"><Linkish href={detail.linkedin} /></Row>
            <Row question="Twitter / X"><Linkish href={detail.twitter} /></Row>
            <Row question="Profile photo">
              {detail.avatar
                ? <a href={detail.avatar} target="_blank" rel="noopener noreferrer" className="text-primary font-medium">Open photo</a>
                : 'Not uploaded'}
            </Row>
            <Row question="ID document (Aadhaar / KYC)">
              {detail.aadhaarUrl
                ? <a href={detail.aadhaarUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-medium">Open document</a>
                : 'Not uploaded'}
            </Row>
            {detail.aadhaarUrl ? (
              <Row question="ID preview">
                <img src={detail.aadhaarUrl} alt="ID document" className="max-h-64 rounded-md border border-gray-200" />
              </Row>
            ) : null}
          </dl>

          <h3 className="text-base font-semibold text-gray-900 mt-6 mb-1">Account</h3>
          <dl>
            <Row question="Admin" answer={yesNo(detail.isAdmin)} />
            <Row question="Membership" answer={purchasedPlanName(detail)} />
            <Row question="Plan code" answer={blank(detail.membershipPlan)} />
            <Row question="Membership expiry" answer={detail.membershipExpiry ? formatDate(detail.membershipExpiry) : 'None'} />
            <Row question="Profile completion" answer={`${detail.profileCompletion}%`} />
            <Row question="Online now" answer={yesNo(detail.isOnline)} />
            <Row question="Last seen" answer={detail.lastSeen ? formatDate(detail.lastSeen, true) : 'Never'} />
            <Row question="Joined" answer={formatDate(detail.createdAt)} />
            <Row question="Last updated" answer={detail.updatedAt ? formatDate(detail.updatedAt) : '—'} />
            <Row question="Map pin" answer={detail.lat != null && detail.lng != null ? `${detail.lat}, ${detail.lng}` : 'Not set'} />
            <Row question="Chats / messages / notifications" answer={`${detail.chatCount} chats · ${detail.messageCount} messages · ${detail.notificationCount} notifications`} />
          </dl>

          <h3 className="text-base font-semibold text-gray-900 mt-6 mb-1">Plans posted ({detail.requestCount})</h3>
          {detail.requests?.length ? (
            <ul className="space-y-3">
              {detail.requests.map((item) => (
                <li key={item.id} className="text-sm border border-gray-100 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.type} · {item.category} · {item.status} · {formatDate(item.createdAt)}{item.budget != null ? ` · ${formatPrice(item.budget)}` : ''}{item.location ? ` · ${item.location}` : ''}</p>
                  {item.description ? <p className="mt-2 text-gray-700 whitespace-pre-wrap">{item.description}</p> : null}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-500">No plans posted.</p>}

          <h3 className="text-base font-semibold text-gray-900 mt-6 mb-1">Offers sent</h3>
          {detail.sentOffers?.length ? (
            <ul className="space-y-3">
              {detail.sentOffers.map((item) => (
                <li key={item.id} className="text-sm border border-gray-100 rounded-lg p-3">
                  <p className="font-medium">{item.request?.title || 'Offer'} · {item.status}</p>
                  <p className="text-xs text-gray-500">{item.request?.category} · {formatDate(item.createdAt)}</p>
                  {item.message ? <p className="mt-2 whitespace-pre-wrap">{item.message}</p> : <p className="mt-2 text-gray-400">No message</p>}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-500">No offers sent.</p>}

          <h3 className="text-base font-semibold text-gray-900 mt-6 mb-1">Payments ({detail.paymentCount})</h3>
          {detail.payments?.length ? (
            <ul className="space-y-3">
              {detail.payments.map((item) => (
                <li key={item.id} className="text-sm border border-gray-100 rounded-lg p-3">
                  <p className="font-medium">{item.plan?.displayName || item.plan?.name || 'Plan'} · {formatPrice(item.amount)} · {item.status}</p>
                  <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                  {item.upiUtr ? <p className="text-xs text-gray-500 mt-1">UTR {item.upiUtr}</p> : null}
                  {item.razorpayPaymentId ? <p className="text-xs text-gray-500 mt-1">Payment {item.razorpayPaymentId}</p> : null}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-500">No payments.</p>}

          <h3 className="text-base font-semibold text-gray-900 mt-6 mb-1">Reviews received</h3>
          {detail.receivedReviews?.length ? (
            <ul className="space-y-3">
              {detail.receivedReviews.map((item) => (
                <li key={item.id} className="text-sm border border-gray-100 rounded-lg p-3">
                  <p className="font-medium">{item.rating}/5 · {item.reviewer?.name || 'Member'} · {formatDate(item.createdAt)}</p>
                  <p className="mt-1 whitespace-pre-wrap">{item.comment || 'No written comment'}</p>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-500">No reviews received.</p>}

          <h3 className="text-base font-semibold text-gray-900 mt-6 mb-1">Reviews given</h3>
          {detail.givenReviews?.length ? (
            <ul className="space-y-3">
              {detail.givenReviews.map((item) => (
                <li key={item.id} className="text-sm border border-gray-100 rounded-lg p-3">
                  <p className="font-medium">{item.rating}/5 · for {item.reviewee?.name || 'Member'} · {formatDate(item.createdAt)}</p>
                  <p className="mt-1 whitespace-pre-wrap">{item.comment || 'No written comment'}</p>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-500">No reviews given.</p>}
        </div>
      )}
    </Modal>
  );
}
