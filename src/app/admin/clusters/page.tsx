import { AdminClustersPage } from '@/components/pages/admin/AdminClustersPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Problem Clusters' };

export default function Page() {
  return <AdminClustersPage />;
}
