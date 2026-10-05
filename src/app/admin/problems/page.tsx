import { AdminProblemsPage } from '@/components/pages/admin/AdminProblemsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Problems' };

export default function Page() {
  return <AdminProblemsPage />;
}
