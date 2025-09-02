'use client';

import { useState, useEffect } from 'react';
import { Lock, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CheckoutPopup from './CheckoutPopup';
import { PLANS } from '@/lib/stripe';

interface LockedContentProps {
  children: React.ReactNode;
  isLocked: boolean;
  requiredPlan?: 'pro';
}

export default function LockedContent({ children, isLocked, requiredPlan = 'pro' }: LockedContentProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();
  const plan = PLANS[requiredPlan];

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred/Locked Content */}
      <div className="relative overflow-hidden">
        <div className="blur-sm opacity-40 pointer-events-none select-none">
          {children}
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/80 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900/80" />
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 flex items-start justify-center pt-20">
        <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
          {/* Lock Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Crown className="w-5 h-5 text-yellow-900" />
            </div>
          </div>

          {/* Message */}
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
            Premium Content
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Unlock this content and all premium features with a subscription
          </p>

          {/* Features */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300">Unlimited Access</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300">All Features</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300">Priority Support</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Start 7-Day Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            
          </div>

          {/* Trust Badge */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            No payment today • Cancel anytime • Instant access
          </p>
        </div>
      </div>

      {/* Checkout Popup */}
      <CheckoutPopup
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        plan={plan}
      />
    </div>
  );
}