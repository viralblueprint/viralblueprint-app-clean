'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Rocket, Calendar, CreditCard, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { PLANS } from '@/lib/stripe';

export default function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const planId = searchParams.get('plan') || 'pro';
  const plan = PLANS[planId as keyof typeof PLANS] || PLANS.pro;

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/');
        return;
      }
      
      setUser(user);
    };

    checkUser();
  }, [router]);

  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Welcome to Viral Blueprint! 🎉
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your 7-day free trial has started
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Your Trial Details
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <Rocket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {plan.name} Plan
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Full access to all {plan.name.toLowerCase()} features
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Trial Ends: {trialEndDate.toLocaleDateString()}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Cancel anytime before this date to avoid charges
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  ${plan.price}/month after trial
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You won't be charged until your trial ends
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>Explore the viral video database</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>Analyze trending patterns</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>Create custom albums</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>Generate viral content reports</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact support at support@viralblueprint.com
          </p>
        </div>
      </div>
    </div>
  );
}