import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (resendInstance) return resendInstance;
  
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  
  resendInstance = new Resend(apiKey);
  return resendInstance;
}

const getFromEmail = () => process.env.FROM_EMAIL || 'Bible Verse <noreply@bibletext.app>';

export interface VerseEmail {
  to: string;
  reference: string;
  text: string;
  version: string;
}

export async function sendVerseEmail({ to, reference, text, version }: VerseEmail): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({
      from: getFromEmail(),
      to,
      subject: `📖 Your Daily Bible Verse - ${reference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f7f4;">
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 48px;">📖</span>
            </div>
            
            <div style="font-size: 20px; line-height: 1.8; color: #2c2c2c; margin-bottom: 24px;">
              "${text}"
            </div>
            
            <div style="text-align: right; color: #666; font-style: italic; margin-bottom: 32px;">
              — ${reference} (${version})
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>You're receiving this because you subscribed to Bible Verse daily emails.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/manage?email=${encodeURIComponent(to)}" style="color: #666;">Manage preferences</a> | <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(to)}" style="color: #666;">Unsubscribe</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `${text}\n\n— ${reference} (${version})\n\nManage preferences: ${process.env.NEXT_PUBLIC_APP_URL}/manage?email=${encodeURIComponent(to)}`,
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

/**
 * Send a verse via SMS gateway (short format for text messages)
 */
export async function sendVerseSms({ to, reference, text, version }: VerseEmail): Promise<boolean> {
  try {
    // SMS messages should be short - truncate if needed
    const maxLength = 160;
    let messageText = `"${text}" - ${reference} (${version})`;
    
    if (messageText.length > maxLength) {
      const truncatedText = text.substring(0, maxLength - reference.length - version.length - 15) + '...';
      messageText = `"${truncatedText}" - ${reference} (${version})`;
    }

    const { error } = await getResend().emails.send({
      from: getFromEmail(),
      to,
      subject: '', // SMS gateways ignore subject
      text: messageText, // Plain text only for SMS
    });

    if (error) {
      console.error('SMS send error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('SMS error:', error);
    return false;
  }
}

export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  try {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?email=${encodeURIComponent(to)}&code=${code}`;
    
    const { error } = await getResend().emails.send({
      from: getFromEmail(),
      to,
      subject: '📖 Verify your Bible Verse subscription',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f7f4;">
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 48px;">📖</span>
              <h1 style="color: #2c2c2c; margin: 16px 0 8px;">Verify Your Email</h1>
              <p style="color: #666;">Click the button below to start receiving Bible verses.</p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Verify Email Address
              </a>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 14px;">
              <p>Or copy this link: ${verifyUrl}</p>
              <p style="margin-top: 24px;">If you didn't sign up for this, you can ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Verify your Bible Verse subscription by clicking this link: ${verifyUrl}`,
    });

    if (error) {
      console.error('Verification email error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}
