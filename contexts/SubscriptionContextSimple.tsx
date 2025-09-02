'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { User } from '@supabase/supabase-js';

interface SubscriptionContextType {
  user: User | null;
  subscription: any | null;
  isLoading: boolean;
  hasActiveSubscription: boolean;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  user: null,
  subscription: null,
  isLoading: true,
  hasActiveSubscription: false,
  checkSubscription: async () => {},
});

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const checkSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        // For now, if user is logged in, consider them as having an active subscription
        // This is temporary for testing
        console.log('User is logged in, granting access for testing');
        setSubscription({
          user_id: currentUser.id,
          status: 'trialing',
          plan_id: 'pro',
        });
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        checkSubscription();
      }
    });

    return () => {
      authSub.unsubscribe();
    };
  }, []);

  // For testing: if user is logged in, they have active subscription
  const hasActiveSubscription = !!user;

  return (
    <SubscriptionContext.Provider 
      value={{ 
        user, 
        subscription, 
        isLoading, 
        hasActiveSubscription,
        checkSubscription 
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}