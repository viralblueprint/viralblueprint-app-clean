import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription from database
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Resume the subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: false,
      }
    );

    // Update database
    await supabase
      .from('user_subscriptions')
      .update({
        status: updatedSubscription.status,
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return NextResponse.json({ 
      success: true,
      status: updatedSubscription.status 
    });
  } catch (error: any) {
    console.error('Resume subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resume subscription' },
      { status: 500 }
    );
  }
}