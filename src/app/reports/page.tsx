import { ReportsListPage } from '@/components/pages/ReportsListPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Reports' };

export default function Page() {
  return <ReportsListPage />;
}
