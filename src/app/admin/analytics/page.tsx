import { AdminAnalyticsPage } from '@/components/pages/admin/AdminAnalyticsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Analytics' };

export default function Page() {
  return <AdminAnalyticsPage />;
}
