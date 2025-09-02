'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function DebugSubscriptionPage() {
  const { user, subscription, hasActiveSubscription, checkSubscription } = useSubscription();
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const refreshData = async () => {
    setLoading(true);
    
    // Refresh context
    await checkSubscription();
    
    // Also fetch directly from database
    if (user) {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching subscription:', error);
        setDbData({ error: error.message });
      } else {
        setDbData(data);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Subscription Debug Info</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Context</h2>
          <div className="mb-4">
            <span className="font-medium">Has Active Subscription: </span>
            <span className={hasActiveSubscription ? 'text-green-600' : 'text-red-600'}>
              {hasActiveSubscription ? 'YES' : 'NO'}
            </span>
          </div>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(subscription, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Direct Database Query</h2>
          <button
            onClick={refreshData}
            disabled={loading}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
          {dbData && (
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(dbData, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Status Checks</h2>
          <div className="space-y-2">
            <div>
              ✓ User logged in: {user ? '✅' : '❌'}
            </div>
            <div>
              ✓ Subscription exists: {subscription ? '✅' : '❌'}
            </div>
            <div>
              ✓ Status is active/trialing: {subscription?.status && ['active', 'trialing'].includes(subscription.status) ? '✅' : '❌'}
            </div>
            <div>
              ✓ Has active subscription: {hasActiveSubscription ? '✅' : '❌'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}