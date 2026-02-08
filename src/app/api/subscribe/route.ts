import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendVerificationEmail } from '@/lib/email';
import { BIBLE_VERSIONS, LANGUAGES, FREQUENCIES } from '@/lib/bible';

function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, language, version, frequency, delivery_time, delivery_day, timezone } = body;

    // Validate required fields
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Validate language
    const validLanguage = LANGUAGES.find(l => l.code === language);
    if (!validLanguage) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }

    // Validate version for the language
    if (!validLanguage.versions.includes(version)) {
      return NextResponse.json({ error: 'Invalid version for selected language' }, { status: 400 });
    }

    // Validate frequency
    const validFrequency = FREQUENCIES.find(f => f.value === frequency);
    if (!validFrequency) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, is_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.is_verified) {
        return NextResponse.json({ 
          error: 'This email is already subscribed. Use the manage link in your emails to update preferences.' 
        }, { status: 409 });
      } else {
        // Resend verification for unverified subscriber
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({
            language,
            version,
            frequency,
            delivery_time: delivery_time || '08:00',
            delivery_day: frequency === 'weekly' ? (delivery_day ?? 0) : null,
            timezone: timezone || 'America/New_York',
            verification_code: verificationCode,
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Update error:', updateError);
          return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
        }

        // Send new verification email
        await sendVerificationEmail(email, verificationCode);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Please check your email to verify your subscription.' 
        });
      }
    }

    // Create new subscriber
    const { error: insertError } = await supabase
      .from('subscribers')
      .insert({
        email: email.toLowerCase(),
        language,
        version,
        frequency,
        delivery_time: delivery_time || '08:00',
        delivery_day: frequency === 'weekly' ? (delivery_day ?? 0) : null,
        timezone: timezone || 'America/New_York',
        verification_code: verificationCode,
        is_active: true,
        is_verified: false,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (!emailSent) {
      return NextResponse.json({ 
        error: 'Subscription created but verification email failed. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Please check your email to verify your subscription.' 
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
