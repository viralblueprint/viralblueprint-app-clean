'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, Calendar, AlertCircle, Loader2, Check, X, 
  Shield, TrendingUp, Users, Target, Video, Crown,
  ChevronRight, RefreshCw, PauseCircle, PlayCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { PLANS } from '@/lib/stripe';
import Navigation from '@/components/Navigation';
import CheckoutPopup from '@/components/CheckoutPopup';

export default function MembershipPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        router.push('/');
        return;
      }

      setUser(currentUser);

      // Get subscription data
      const { data } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setActionLoading(true);
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
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/resume-subscription', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Subscription resumed successfully!');
        await fetchSubscription();
      } else {
        throw new Error('Failed to resume subscription');
      }
    } catch (error) {
      console.error('Resume error:', error);
      alert('Failed to resume subscription. Please try again or contact support.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create portal session');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const plan = PLANS.pro;
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isCancelled = subscription?.status === 'canceled' || subscription?.cancel_at_period_end;
  const isTrialing = subscription?.status === 'trialing';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Membership & Billing
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage your subscription and billing details
        </p>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Account Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email Address</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {user?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Member Since</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {subscription ? (
          <>
            {/* Subscription Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Subscription Status
                </h2>
                <div className={`px-4 py-2 rounded-full font-medium ${
                  isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  isCancelled ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {isTrialing ? '🎉 Free Trial' : 
                   isActive ? '✓ Active' : 
                   isCancelled ? '⚠ Cancelled' : 
                   'Inactive'}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-start">
                  <Crown className="w-5 h-5 text-purple-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {plan.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      ${plan.price}/month
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {isTrialing ? 'Trial Ends' : 'Next Billing Date'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {subscription.trial_end ? 
                        new Date(subscription.trial_end).toLocaleDateString() :
                        subscription.current_period_end ?
                        new Date(subscription.current_period_end).toLocaleDateString() :
                        'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {isCancelled && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                        Subscription Cancelled
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                        You'll retain access to your subscription features until the end of your current billing period.
                        You can resume your subscription at any time before it expires.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {isActive && !isCancelled ? (
                  <>
                    <button
                      onClick={handleUpdatePayment}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      <CreditCard className="inline w-5 h-5 mr-2" />
                      Update Payment Method
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    >
                      <PauseCircle className="inline w-5 h-5 mr-2" />
                      Cancel Subscription
                    </button>
                  </>
                ) : isCancelled ? (
                  <button
                    onClick={handleResumeSubscription}
                    disabled={actionLoading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <PlayCircle className="inline w-5 h-5 mr-2" />
                    Resume Subscription
                  </button>
                ) : null}
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Plan Features
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-400">
                    Need help? Contact support at support@viralblueprint.com
                  </p>
                  <button
                    onClick={() => router.push('/patterns')}
                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                  >
                    Go to Viral Database
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No Subscription Card */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No Active Subscription
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start your 7-day free trial to access all premium features
            </p>
            <button
              onClick={() => setShowCheckout(true)}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
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
        plan={plan}
      />
    </div>
  );
}