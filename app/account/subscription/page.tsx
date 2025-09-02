'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Calendar, AlertCircle, Loader2, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { PLANS } from '@/lib/stripe';
import CheckoutPopup from '@/components/CheckoutPopup';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/test-auth');
        return;
      }

      const { data } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access at the end of your billing period.')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Subscription cancelled successfully. You will have access until the end of your billing period.');
        await fetchSubscription();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel subscription. Please try again or contact support.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const plan = subscription ? PLANS[subscription.plan_id as keyof typeof PLANS] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Subscription Management
        </h1>

        {subscription && plan ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h2>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <Check className="w-5 h-5 mr-2" />
                  <span className="font-medium">Active Subscription</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${plan.price}
                </p>
                <p className="text-gray-500 dark:text-gray-400">per month</p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Subscription Started
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(subscription.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CreditCard className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Payment Method
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Card ending in •••• (via Stripe)
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t dark:border-gray-700 pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Plan Features
              </h3>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="px-6 py-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
              >
                {cancelling ? (
                  <span className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Cancelling...
                  </span>
                ) : (
                  'Cancel Subscription'
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  If you cancel, you'll retain access to your subscription features until the end of your current billing period.
                  You can resubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No Active Subscription
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have an active subscription. Choose a plan to get started!
            </p>
            <button
              onClick={() => setShowCheckout(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Start Free Trial
            </button>
          </div>
        )}
      </div>
      
      {/* Checkout Popup */}
      <CheckoutPopup
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        plan={PLANS.pro}
      />
    </div>
  );
}