import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      console.error('Stripe is not configured. Please check your environment variables.');
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 500 }
      );
    }
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      return NextResponse.json({ 
        verified: true,
        customerEmail: session.customer_email,
        amount: session.amount_total
      });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}