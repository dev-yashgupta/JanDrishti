import { AdminDashboardPage } from '@/components/pages/admin/AdminDashboardPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Authority Dashboard' };

export default function Page() {
  return <AdminDashboardPage />;
}
