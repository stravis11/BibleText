import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const code = searchParams.get('code');

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    // Find subscriber with matching email and code
    const { data: subscriber, error: findError } = await supabase
      .from('subscribers')
      .select('id, is_verified')
      .eq('email', email.toLowerCase())
      .eq('verification_code', code.toUpperCase())
      .single();

    if (findError || !subscriber) {
      return NextResponse.json({ error: 'Invalid verification link' }, { status: 400 });
    }

    if (subscriber.is_verified) {
      return NextResponse.json({ success: true, message: 'Email already verified' });
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ 
        is_verified: true,
        verification_code: null 
      })
      .eq('id', subscriber.id);

    if (updateError) {
      console.error('Verification update error:', updateError);
      return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully! You will now receive Bible verses.' 
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
