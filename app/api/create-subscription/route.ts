import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      console.error('Stripe is not configured. Please check your environment variables.');
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

    const { paymentMethodId, planId, email, name } = await request.json();
    const plan = PLANS[planId as keyof typeof PLANS];
    
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create or get Stripe customer
    let customerId: string;
    
    // Check if user already has a Stripe customer ID
    const { data: existingCustomer } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      customerId = existingCustomer.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: email || user.email,
        name: name,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // First, create or get the product
    let productId: string;
    
    // Search for active products with matching name
    const existingProducts = await stripe.products.search({
      query: `name:"${plan.name}" AND active:"true"`,
      limit: 1,
    });

    if (existingProducts.data.length > 0) {
      productId = existingProducts.data[0].id;
    } else {
      // Check if there's an inactive product and update it, or create new
      const inactiveProducts = await stripe.products.search({
        query: `name:"${plan.name}"`,
        limit: 1,
      });

      if (inactiveProducts.data.length > 0 && !inactiveProducts.data[0].active) {
        // Update the inactive product to make it active
        const updatedProduct = await stripe.products.update(
          inactiveProducts.data[0].id,
          {
            active: true,
            description: plan.features.slice(0, 3).join(', '),
          }
        );
        productId = updatedProduct.id;
      } else {
        // Create a new product with unique name (add timestamp to ensure uniqueness)
        const uniqueName = `${plan.name}_${Date.now()}`;
        const product = await stripe.products.create({
          name: uniqueName,
          description: plan.features.slice(0, 3).join(', '),
          active: true,
          metadata: {
            plan_id: plan.id,
            display_name: plan.name, // Store the display name in metadata
          },
        });
        productId = product.id;
      }
    }

    // Check for existing price or create a new one
    let priceId: string;
    
    try {
      // Search for existing prices for this product
      const existingPrices = await stripe.prices.list({
        product: productId,
        active: true,
        type: 'recurring',
        limit: 1,
      });

      if (existingPrices.data.length > 0 && 
          existingPrices.data[0].unit_amount === Math.round(plan.price * 100) &&
          existingPrices.data[0].currency === 'usd' &&
          existingPrices.data[0].recurring?.interval === 'month') {
        // Use existing price if it matches our requirements
        priceId = existingPrices.data[0].id;
      } else {
        // Create a new price
        const price = await stripe.prices.create({
          product: productId,
          unit_amount: Math.round(plan.price * 100), // Convert to cents
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
          metadata: {
            plan_id: plan.id,
          },
        });
        priceId = price.id;
      }
    } catch (priceError) {
      // If price creation fails, create a new price with unique lookup key
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(plan.price * 100),
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        lookup_key: `${plan.id}_${Date.now()}`,
        metadata: {
          plan_id: plan.id,
        },
      });
      priceId = price.id;
    }

    // Create subscription with trial using the price ID
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      trial_period_days: 7,
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card'],
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
      },
    });

    // Log subscription status for debugging
    console.log('Subscription created with status:', subscription.status);
    console.log('Trial end:', subscription.trial_end);
    
    // Save subscription to database - only include columns that exist
    const subscriptionData = {
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status === 'trialing' ? 'trialing' : subscription.status,
      plan_id: plan.id,
      updated_at: new Date().toISOString(),
    };
    
    console.log('Saving subscription data:', subscriptionData);
    
    const { data: savedSub, error: dbError } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway - subscription was created in Stripe
    } else {
      console.log('Subscription saved to database:', savedSub);
    }

    // Check if payment intent needs confirmation (3D Secure)
    const invoice = subscription.latest_invoice as any;
    if (invoice?.payment_intent?.status === 'requires_action') {
      return NextResponse.json({
        requiresAction: true,
        clientSecret: invoice.payment_intent.client_secret,
        subscriptionId: subscription.id,
      });
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      trialEnd: subscription.trial_end,
    });
  } catch (error: any) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}