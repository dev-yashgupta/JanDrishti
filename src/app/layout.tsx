import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'JanDrishti AI — Civic Intelligence Platform',
    template: '%s | JanDrishti AI',
  },
  description:
    'JanDrishti AI uses artificial intelligence and community intelligence to identify, analyse and prioritise unresolved civic problems across India.',
  keywords: ['civic', 'India', 'AI', 'government', 'grievance', 'problems', 'community'],
  authors: [{ name: 'JanDrishti AI Team' }],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-[#F7F9FC] text-[#101828] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
