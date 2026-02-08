# 📖 Bible Verse

A web application that delivers random Bible verses to subscribers via email. Users can choose their preferred language, Bible version, and delivery frequency.

## Features

- **Multiple Languages**: English, Spanish, German, French, Dutch, Mandarin
- **Multiple Versions**: ESV, NIV, KJV, NLT, and more
- **Flexible Scheduling**: Hourly, daily, or weekly delivery
- **Custom Timing**: Choose your preferred delivery time and timezone
- **Email Verification**: Secure signup with email confirmation
- **Easy Management**: Unsubscribe or update preferences anytime

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Hosting**: Vercel (free tier)
- **Bible API**: bible-api.com (free, no key required)

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/stravis11/BibleText.git
cd BibleText
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the schema from `src/lib/supabase.ts` (the `SCHEMA_SQL` export)
4. Copy your project URL and anon key from Settings > API

### 3. Set Up Resend

1. Create a free account at [resend.com](https://resend.com) (100 emails/day free)
2. Add and verify your domain (or use their test domain)
3. Create an API key

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Set up Vercel Cron for scheduled delivery:

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron?frequency=hourly",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron?frequency=daily",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron?frequency=weekly", 
      "schedule": "0 * * * *"
    }
  ]
}
```

## API Endpoints

- `POST /api/subscribe` - Create new subscription
- `GET /api/verify` - Verify email address
- `GET /api/unsubscribe` - Unsubscribe from emails
- `GET /api/cron` - Trigger verse delivery (protected)

## Future Enhancements

- [ ] SMS delivery (Twilio integration)
- [ ] WhatsApp delivery
- [ ] Push notifications
- [ ] Favorite verses
- [ ] Reading plans
- [ ] Mobile app

## Credits

Built by Skippy the Magnificent 🍺 & Nagatha

Bible verses from [bible-api.com](https://bible-api.com)
