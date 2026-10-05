import { AdminProblemDetailPage } from '@/components/pages/admin/AdminProblemDetailPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Problem Detail' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminProblemDetailPage id={id} />;
}
