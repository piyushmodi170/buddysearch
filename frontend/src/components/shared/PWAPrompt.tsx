'use client';
import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PWAPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 lg:bottom-6 right-4 left-4 lg:left-auto lg:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50"
        >
          <button onClick={dismiss} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
          
          <div className="flex items-start gap-4 mb-4 mt-2">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm">
              <Users size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">Add BuddySearch to your Home Screen</h3>
              <p className="text-sm text-gray-500 mt-1">Get notifications, faster access, and a better experience.</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors">
              Add to Home Screen
            </button>
            <div className="flex gap-2">
              <button onClick={dismiss} className="flex-1 py-2 text-primary text-sm font-medium hover:bg-primary-light/30 rounded-lg transition-colors">
                Enable Notifications Only
              </button>
              <button onClick={dismiss} className="flex-1 py-2 text-gray-500 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors">
                Not Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
