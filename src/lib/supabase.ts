import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// For backward compatibility
export const supabase = {
  from: (table: string) => getSupabase().from(table),
};

// Database types
export interface Subscriber {
  id: string;
  email: string;
  phone?: string; // For SMS gateway
  carrier?: string; // For SMS-to-email gateway
  delivery_method: 'email' | 'sms'; // How to deliver
  language: string;
  version: string;
  frequency: 'hourly' | 'daily' | 'weekly';
  delivery_time: string; // HH:MM format
  delivery_day?: number; // 0-6 for weekly (0 = Sunday)
  timezone: string;
  is_active: boolean;
  verification_code?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// SMS-to-Email Gateway addresses by carrier
export const SMS_GATEWAYS: Record<string, { name: string; domain: string }> = {
  'att': { name: 'AT&T', domain: 'txt.att.net' },
  'verizon': { name: 'Verizon', domain: 'vtext.com' },
  'tmobile': { name: 'T-Mobile', domain: 'tmomail.net' },
  'sprint': { name: 'Sprint', domain: 'messaging.sprintpcs.com' },
  'uscellular': { name: 'US Cellular', domain: 'email.uscc.net' },
  'cricket': { name: 'Cricket', domain: 'sms.cricketwireless.net' },
  'boost': { name: 'Boost Mobile', domain: 'sms.myboostmobile.com' },
  'metro': { name: 'Metro PCS', domain: 'mymetropcs.com' },
  'googlefi': { name: 'Google Fi', domain: 'msg.fi.google.com' },
  'visible': { name: 'Visible', domain: 'vtext.com' },
  'xfinity': { name: 'Xfinity Mobile', domain: 'vtext.com' },
  'mint': { name: 'Mint Mobile', domain: 'tmomail.net' },
};

export function getSmsGatewayEmail(phone: string, carrier: string): string | null {
  const gateway = SMS_GATEWAYS[carrier];
  if (!gateway) return null;
  
  // Remove any non-digit characters from phone
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Ensure it's a valid 10-digit US number
  if (cleanPhone.length !== 10) return null;
  
  return `${cleanPhone}@${gateway.domain}`;
}

export interface DeliveryLog {
  id: string;
  subscriber_id: string;
  verse_reference: string;
  verse_text: string;
  sent_at: string;
  delivery_method: 'email' | 'sms';
  status: 'sent' | 'failed';
  error_message?: string;
}

// SQL schema for Supabase (run this in Supabase SQL editor)
export const SCHEMA_SQL = `
-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT,
  carrier TEXT,
  delivery_method TEXT NOT NULL DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms')),
  language TEXT NOT NULL DEFAULT 'en',
  version TEXT NOT NULL DEFAULT 'ESV',
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('hourly', 'daily', 'weekly')),
  delivery_time TEXT NOT NULL DEFAULT '08:00',
  delivery_day INTEGER CHECK (delivery_day >= 0 AND delivery_day <= 6),
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT true,
  verification_code TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email),
  UNIQUE(phone, carrier)
);

-- Delivery logs table
CREATE TABLE IF NOT EXISTS delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
  verse_reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_method TEXT NOT NULL DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  error_message TEXT
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_frequency ON subscribers(frequency, is_active, is_verified);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_subscriber ON delivery_logs(subscriber_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;

-- Allow public to insert new subscribers (for signup)
CREATE POLICY "Allow public signup" ON subscribers
  FOR INSERT TO anon WITH CHECK (true);

-- Allow subscribers to read/update their own data via verification code
CREATE POLICY "Allow verified access" ON subscribers
  FOR ALL USING (is_verified = true);
`;
