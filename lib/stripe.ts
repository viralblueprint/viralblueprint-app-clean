import Stripe from 'stripe';

// Only initialize Stripe on the server side
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null;

export const PLANS = {
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 9.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      'Access to viral video database',
      'Advanced analytics & insights',
      'Unlimited saved videos',
      'Custom albums',
      'AI-powered content recommendations',
      'Export reports',
      'Priority support'
    ]
  }
};