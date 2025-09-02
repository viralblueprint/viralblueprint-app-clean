'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Check, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';

interface TrialSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };
}

export default function TrialSignupModal({ isOpen, onClose, selectedPlan }: TrialSignupModalProps) {
  const [step, setStep] = useState<'signup' | 'payment'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  if (!isOpen) return null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign up the user
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signupError) throw signupError;

      if (data.user) {
        // Move to payment step
        setStep('payment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create checkout session with trial
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          trialDays: 7,
          successUrl: `${window.location.origin}/welcome?plan=${selectedPlan.id}`,
          cancelUrl: window.location.origin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start trial');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to setup payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>

        {step === 'signup' ? (
          <>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Start Your 7-Day Free Trial
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No charges for 7 days. Cancel anytime.
            </p>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                {selectedPlan.name} - ${selectedPlan.price}/month
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                After 7-day free trial
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  'Continue to Payment'
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Account Created!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Now let's set up your payment method
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Payment Information
                </span>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Card will be saved for future billing</li>
                <li>• No charges for 7 days</li>
                <li>• Cancel anytime before trial ends</li>
              </ul>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up payment...
                </span>
              ) : (
                'Add Payment Method'
              )}
            </button>

            {error && (
              <div className="text-red-500 text-sm mt-4">{error}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}