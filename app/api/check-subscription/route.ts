import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get ALL subscriptions for this user
    const { data: subscriptions, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id);

    // Also try without any filters
    const { data: allUserSubs, error: allError } = await supabase
      .from('user_subscriptions')
      .select('*');

    return NextResponse.json({
      user_id: user.id,
      user_email: user.email,
      subscriptions: subscriptions,
      subscription_error: error,
      all_subscriptions_count: allUserSubs?.length || 0,
      all_error: allError,
      has_active: subscriptions?.some(s => ['active', 'trialing'].includes(s.status)),
    });
  } catch (error: any) {
    console.error('Check subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check subscription' },
      { status: 500 }
    );
  }
}