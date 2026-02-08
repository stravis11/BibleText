import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Deactivate subscriber
    const { error: updateError, data } = await supabase
      .from('subscribers')
      .update({ is_active: false })
      .eq('email', email.toLowerCase())
      .select('id')
      .single();

    if (updateError || !data) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'You have been unsubscribed from Bible Verse emails.' 
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Also handle POST for form submissions
  return GET(request);
}
