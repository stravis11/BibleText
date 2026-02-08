import { NextResponse } from 'next/server';
import { supabase, getSmsGatewayEmail } from '@/lib/supabase';
import { getRandomVerse } from '@/lib/bible';
import { sendVerseEmail, sendVerseSms } from '@/lib/email';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) return true; // Allow if no secret configured (dev mode)
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  // Check authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentDay = now.getUTCDay(); // 0 = Sunday

    // Get the frequency to process based on the endpoint called
    const { searchParams } = new URL(request.url);
    const frequency = searchParams.get('frequency') || 'all';

    let query = supabase
      .from('subscribers')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true);

    // Filter by frequency if specified
    if (frequency !== 'all') {
      query = query.eq('frequency', frequency);
    }

    const { data: subscribers, error: fetchError } = await query;

    if (fetchError) {
      console.error('Fetch subscribers error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: 'No subscribers to process' });
    }

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      try {
        // Check if it's time to send based on subscriber's preferences
        const shouldSend = checkSendTime(subscriber, now, currentHour, currentDay);
        
        if (!shouldSend) continue;

        // Get a random verse in the subscriber's preferred version
        const verse = await getRandomVerse(subscriber.version);
        
        if (!verse) {
          console.error(`Failed to get verse for ${subscriber.email}`);
          failed++;
          continue;
        }

        // Determine delivery destination and method
        let success = false;
        let deliveryMethod = subscriber.delivery_method || 'email';
        let destination = subscriber.email;

        if (deliveryMethod === 'sms' && subscriber.phone && subscriber.carrier) {
          // Use SMS gateway
          const smsEmail = getSmsGatewayEmail(subscriber.phone, subscriber.carrier);
          if (smsEmail) {
            destination = smsEmail;
            success = await sendVerseSms({
              to: smsEmail,
              reference: verse.reference,
              text: verse.text,
              version: verse.version,
            });
          } else {
            console.error(`Invalid SMS gateway for ${subscriber.email}`);
            failed++;
            continue;
          }
        } else {
          // Standard email delivery
          deliveryMethod = 'email';
          success = await sendVerseEmail({
            to: subscriber.email,
            reference: verse.reference,
            text: verse.text,
            version: verse.version,
          });
        }

        if (success) {
          sent++;
          
          // Log the delivery
          await supabase.from('delivery_logs').insert({
            subscriber_id: subscriber.id,
            verse_reference: verse.reference,
            verse_text: verse.text,
            delivery_method: deliveryMethod,
            status: 'sent',
          });
        } else {
          failed++;
          
          await supabase.from('delivery_logs').insert({
            subscriber_id: subscriber.id,
            verse_reference: verse.reference,
            verse_text: verse.text,
            delivery_method: deliveryMethod,
            status: 'failed',
            error_message: `${deliveryMethod} send failed`,
          });
        }
      } catch (error) {
        console.error(`Error processing ${subscriber.email}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: subscribers.length,
      sent,
      failed,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Check if it's time to send a verse to this subscriber
 */
function checkSendTime(
  subscriber: {
    frequency: string;
    delivery_time: string;
    delivery_day?: number;
    timezone: string;
  },
  now: Date,
  currentHourUTC: number,
  currentDayUTC: number
): boolean {
  // Parse delivery time
  const [deliveryHour] = subscriber.delivery_time.split(':').map(Number);
  
  // Simple timezone offset calculation (this is approximate)
  // In production, use a proper timezone library like date-fns-tz
  const tzOffsets: Record<string, number> = {
    'America/New_York': -5,
    'America/Chicago': -6,
    'America/Denver': -7,
    'America/Los_Angeles': -8,
    'Europe/London': 0,
    'Europe/Paris': 1,
    'Europe/Berlin': 1,
    'Asia/Shanghai': 8,
    'Asia/Tokyo': 9,
  };
  
  const offset = tzOffsets[subscriber.timezone] || 0;
  const subscriberHour = (currentHourUTC + offset + 24) % 24;
  
  switch (subscriber.frequency) {
    case 'hourly':
      // Send every hour
      return true;
      
    case 'daily':
      // Send at the specified hour
      return subscriberHour === deliveryHour;
      
    case 'weekly':
      // Send at the specified hour on the specified day
      const subscriberDay = (currentDayUTC + Math.floor((currentHourUTC + offset) / 24) + 7) % 7;
      return subscriberHour === deliveryHour && subscriberDay === (subscriber.delivery_day ?? 0);
      
    default:
      return false;
  }
}

// Also support POST for manual triggers
export async function POST(request: Request) {
  return GET(request);
}
