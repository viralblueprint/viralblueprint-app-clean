import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe is not configured. Please check your environment variables.');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('No stripe signature found in headers');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, planId } = paymentIntent.metadata;
        
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            stripe_payment_intent_id: paymentIntent.id,
            updated_at: new Date().toISOString(),
          });
        break;
      }
      
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, planId } = session.metadata || {};
        
        if (userId && planId) {
          await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              plan_id: planId,
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date().toISOString(),
            });
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('user_subscriptions')
          .update({ 
            status: subscription.status,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}