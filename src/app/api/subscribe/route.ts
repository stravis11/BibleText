import { NextResponse } from 'next/server';
import { supabase, SMS_GATEWAYS, getSmsGatewayEmail } from '@/lib/supabase';
import { sendVerificationEmail } from '@/lib/email';
import { LANGUAGES, FREQUENCIES } from '@/lib/bible';

function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, 
      phone, 
      carrier, 
      delivery_method = 'email',
      language, 
      version, 
      frequency, 
      delivery_time, 
      delivery_day, 
      timezone 
    } = body;

    // Validate delivery method
    if (!['email', 'sms'].includes(delivery_method)) {
      return NextResponse.json({ error: 'Invalid delivery method' }, { status: 400 });
    }

    // Validate based on delivery method
    if (delivery_method === 'email') {
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
      }
    } else if (delivery_method === 'sms') {
      if (!phone) {
        return NextResponse.json({ error: 'Phone number is required for SMS delivery' }, { status: 400 });
      }
      if (!carrier || !SMS_GATEWAYS[carrier]) {
        return NextResponse.json({ error: 'Valid carrier is required for SMS delivery' }, { status: 400 });
      }
      // Validate phone format
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return NextResponse.json({ error: 'Please enter a valid 10-digit US phone number' }, { status: 400 });
      }
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

    // Determine the verification email destination
    let verificationDestination: string;
    if (delivery_method === 'email') {
      verificationDestination = email.toLowerCase();
    } else {
      // For SMS, we still need an email for verification
      // We'll use the SMS gateway email but also require a backup email
      if (!email || !email.includes('@')) {
        return NextResponse.json({ 
          error: 'Email is required for verification, even with SMS delivery' 
        }, { status: 400 });
      }
      verificationDestination = email.toLowerCase();
    }

    // Check if already exists
    let existing = null;
    if (delivery_method === 'email') {
      const result = await supabase
        .from('subscribers')
        .select('id, is_verified')
        .eq('email', email.toLowerCase())
        .eq('delivery_method', 'email')
        .single();
      existing = result.data;
    } else {
      const cleanPhone = phone.replace(/\D/g, '');
      const result = await supabase
        .from('subscribers')
        .select('id, is_verified')
        .eq('phone', cleanPhone)
        .eq('carrier', carrier)
        .single();
      existing = result.data;
    }

    const subscriberData = {
      email: email?.toLowerCase() || null,
      phone: delivery_method === 'sms' ? phone.replace(/\D/g, '') : null,
      carrier: delivery_method === 'sms' ? carrier : null,
      delivery_method,
      language,
      version,
      frequency,
      delivery_time: delivery_time || '08:00',
      delivery_day: frequency === 'weekly' ? (delivery_day ?? 0) : null,
      timezone: timezone || 'America/New_York',
      verification_code: verificationCode,
    };

    if (existing) {
      if (existing.is_verified) {
        return NextResponse.json({ 
          error: 'Already subscribed. Use the manage link in your messages to update preferences.' 
        }, { status: 409 });
      } else {
        // Update unverified subscriber
        const { error: updateError } = await supabase
          .from('subscribers')
          .update(subscriberData)
          .eq('id', existing.id);

        if (updateError) {
          console.error('Update error:', updateError);
          return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
        }
      }
    } else {
      // Create new subscriber
      const { error: insertError } = await supabase
        .from('subscribers')
        .insert({
          ...subscriberData,
          is_active: true,
          is_verified: false,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
      }
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(verificationDestination, verificationCode);
    
    if (!emailSent) {
      return NextResponse.json({ 
        error: 'Subscription created but verification email failed. Please try again.' 
      }, { status: 500 });
    }

    const deliveryNote = delivery_method === 'sms' 
      ? 'After verification, you will receive Bible verses via text message.'
      : '';

    return NextResponse.json({ 
      success: true, 
      message: `Please check your email (${verificationDestination}) to verify your subscription. ${deliveryNote}`.trim()
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
