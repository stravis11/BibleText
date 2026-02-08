import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bible Verse - Daily Scripture Delivered',
  description: 'Receive inspiring Bible verses in your inbox. Choose your language, version, and frequency.',
  keywords: ['Bible', 'Scripture', 'Daily Verse', 'Christian', 'Faith', 'ESV', 'NIV'],
  openGraph: {
    title: 'Bible Verse - Daily Scripture Delivered',
    description: 'Receive inspiring Bible verses in your inbox.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
