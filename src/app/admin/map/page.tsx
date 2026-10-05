import { AdminMapPage } from '@/components/pages/admin/AdminMapPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Map View' };

export default function Page() {
  return <AdminMapPage />;
}
