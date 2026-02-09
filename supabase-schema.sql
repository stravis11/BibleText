-- BibleText Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor → New Query)

-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT,
  carrier TEXT,
  delivery_method TEXT NOT NULL DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms')),
  language TEXT NOT NULL DEFAULT 'en',
  version TEXT NOT NULL DEFAULT 'KJV',
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
  delivery_method TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(is_active, is_verified);
CREATE INDEX IF NOT EXISTS idx_subscribers_frequency ON subscribers(frequency);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_subscriber ON delivery_logs(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_created ON delivery_logs(created_at);
