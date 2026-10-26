import { AnalyticsPage } from '@/components/pages/AnalyticsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Civic Data Analytics | JanDrishti AI',
  description: 'Civic data analytics and trend intelligence platform.',
};

export default function Page() {
  return <AnalyticsPage />;
}
