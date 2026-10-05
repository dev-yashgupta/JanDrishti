import { AdminSettingsPage } from '@/components/pages/admin/AdminSettingsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Settings' };

export default function Page() {
  return <AdminSettingsPage />;
}
