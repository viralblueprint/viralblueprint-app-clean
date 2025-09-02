'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard, Shield, Clock, Check, Loader2, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createClient } from '@/lib/supabase-browser';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutPopupProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };
}

function CheckoutForm({ plan, onClose }: { plan: CheckoutPopupProps['plan'], onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Step 1: Create account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (signUpError) throw signUpError;

      // Step 2: Sign in to establish session
      if (signUpData.user) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        // Small delay to ensure session is fully established
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Step 3: Create payment method
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card element not found');
        }

        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            email: email,
            name: name,
          },
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        // Step 4: Create subscription with payment method
        const response = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            planId: plan.id,
            email: email,
            name: name,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create subscription');
        }

        // Step 5: Handle 3D Secure if required
        if (data.clientSecret) {
          const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);
          
          if (confirmError) {
            throw new Error(confirmError.message);
          }
        }

        // Success! Wait a moment for database to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reload the current page to update subscription status
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Inter", sans-serif',
        lineHeight: '24px',
        padding: '10px',
      },
      invalid: {
        color: '#9e2146',
        iconColor: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Account Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <User className="inline w-4 h-4 mr-1" />
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          required
          autoComplete="name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Mail className="inline w-4 h-4 mr-1" />
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Lock className="inline w-4 h-4 mr-1" />
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          minLength={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          required
          autoComplete="new-password"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Minimum 6 characters
        </p>
      </div>

      {/* Payment Information */}
      <div className="border-t dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <CreditCard className="inline w-4 h-4 mr-1" />
            Card Information
          </label>
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure & Encrypted</span>
          </div>
        </div>
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
          <CardElement 
            options={cardElementOptions}
            onChange={(e) => setCardComplete(e.complete)}
          />
        </div>
        <div className="mt-2 flex items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your card will be charged ${plan.price}/month after your 7-day free trial
          </p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-6 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-6 object-contain" />
          <span className="text-xs text-gray-500 ml-2">and more...</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* What happens next */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
          What happens next:
        </h4>
        <ol className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
          <li>✓ Your account will be created instantly</li>
          <li>✓ Card verified (not charged today)</li>
          <li>✓ 7-day free trial starts immediately</li>
          <li>✓ Cancel anytime before trial ends</li>
        </ol>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !stripe || !elements || !email || !password || !name || !cardComplete}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </span>
        ) : (
          'Start Free Trial'
        )}
      </button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Lock className="w-3 h-3" />
        <span>256-bit SSL encrypted transaction</span>
      </div>
    </form>
  );
}

function CheckoutFormWrapper({ plan, onClose }: { plan: CheckoutPopupProps['plan'], onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm plan={plan} onClose={onClose} />
    </Elements>
  );
}

export default function CheckoutPopup({ isOpen, onClose, plan }: CheckoutPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-bold mb-2">
            Start Your Free Trial
          </h2>
          <p className="text-purple-100">
            Create your account and add payment info
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm">7-Day Free Trial</span>
            </div>
          </div>

          {/* Stripe Elements Provider with mounting check */}
          <CheckoutFormWrapper plan={plan} onClose={onClose} />

          {/* Trust & Security Info */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p className="font-semibold mb-1">Your payment is secure</p>
                <p>We use industry-standard encryption and never store your card details on our servers. All payment processing is handled securely by Stripe.</p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy.
            You can cancel anytime during your trial period with no charges.
          </p>
        </div>
      </div>
    </div>
  );
}