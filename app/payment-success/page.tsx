'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (sessionId) {
        try {
          const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
          if (response.ok) {
            setVerified(true);
          }
        } catch (error) {
          console.error('Payment verification error:', error);
        }
      }
      
      setLoading(false);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 5000);
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {loading ? (
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
        ) : (
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
        )}
        
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          {loading ? 'Setting Up Your Trial...' : 'Trial Started Successfully!'}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {loading 
            ? 'Please wait while we set up your free trial.'
            : 'Your 7-day free trial has begun! You will be redirected to your dashboard shortly.'}
        </p>
        
        {!loading && (
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}