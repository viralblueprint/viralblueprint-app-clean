'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import CheckoutPopup from './CheckoutPopup';


interface PricingCardProps {
  plan: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };
  isPopular?: boolean;
  currentPlan?: string;
}

export default function PricingCard({ plan, isPopular, currentPlan }: PricingCardProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const isCurrentPlan = currentPlan === plan.id;

  return (
    <div className={`relative rounded-2xl p-8 ${
      isPopular 
        ? 'bg-gradient-to-b from-purple-600 to-purple-700 text-white scale-105 shadow-2xl' 
        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
    }`}>
      {isPopular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
            MOST POPULAR
          </span>
        </div>
      )}
      
      <div className="mb-8">
        <h3 className={`text-2xl font-bold mb-2 ${
          isPopular ? 'text-white' : 'text-gray-900 dark:text-white'
        }`}>
          {plan.name}
        </h3>
        <div className="flex items-baseline">
          <span className={`text-4xl font-bold ${
            isPopular ? 'text-white' : 'text-gray-900 dark:text-white'
          }`}>
            ${plan.price}
          </span>
          <span className={`ml-2 ${
            isPopular ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'
          }`}>
            /month
          </span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
              isPopular ? 'text-purple-200' : 'text-green-500'
            }`} />
            <span className={
              isPopular ? 'text-purple-100' : 'text-gray-600 dark:text-gray-300'
            }>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setShowCheckout(true)}
        disabled={isCurrentPlan}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
          isCurrentPlan
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : isPopular
            ? 'bg-white text-purple-600 hover:bg-purple-50'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : 'Start 7-Day Free Trial'}
      </button>
      
      {!isCurrentPlan && (
        <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
          No payment today • Cancel anytime
        </p>
      )}
      
      {/* Checkout Popup */}
      <CheckoutPopup
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        plan={plan}
      />
    </div>
  );
}