'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ChevronDown, HelpCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const FAQS = [
  { q: "How does BuddySearch work?", a: "BuddySearch connects people looking for companionship for various activities. You can browse profiles, post requests, and chat securely." },
  { q: "Is BuddySearch safe?", a: "Yes. We require Aadhaar verification for all Buddies before they can offer services. We also have reporting features and secure in-app messaging." },
  { q: "How do I get paid?", a: "You arrange payment terms directly with your Buddy/Client through our secure chat. Always agree on terms before meeting." },
  { q: "Can I cancel my premium membership?", a: "Yes, you can cancel at any time from your account settings. However, we do not offer refunds for the current billing cycle." },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">How can we help?</h1>
        <p className="text-gray-500">Browse our FAQs or get in touch with our support team.</p>
      </div>

      <Card className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50 focus:outline-none"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                {faq.q}
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="p-4 pt-0 text-gray-600 text-sm bg-gray-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-primary-light/10 border-primary/20 text-center p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
        <p className="text-gray-600 mb-6">Our support team is always ready to assist you.</p>
        <Button className="shadow-md">
          <Mail size={18} className="mr-2" /> Contact Support
        </Button>
      </Card>
    </div>
  );
}
