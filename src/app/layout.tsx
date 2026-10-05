import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

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
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
