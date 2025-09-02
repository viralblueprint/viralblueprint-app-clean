'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import LockedContent from '@/components/LockedContent';
import { TrendingUp, Video, Users, BarChart3, Zap, Target } from 'lucide-react';

export default function PremiumContentPage() {
  const { hasActiveSubscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const premiumContent = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Premium Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Advanced insights and viral content analysis
          </p>
        </div>

        {/* Premium Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Viral Trends Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track emerging viral patterns across all major platforms in real-time.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Content Performance Metrics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed analytics on view counts, engagement rates, and virality scores.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Audience Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Understand your target audience demographics and behavior patterns.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Competitor Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Compare your content performance against top competitors.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              AI-Powered Predictions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Machine learning models predict which content will go viral next.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Content Optimization
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get recommendations to optimize your content for maximum virality.
            </p>
          </div>
        </div>

        {/* Sample Analytics Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Viral Growth Analytics
          </h2>
          <div className="h-64 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Interactive charts and graphs would appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <LockedContent isLocked={!hasActiveSubscription} requiredPlan="pro">
      {premiumContent}
    </LockedContent>
  );
}