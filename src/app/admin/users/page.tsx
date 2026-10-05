import { AdminUsersPage } from '@/components/pages/admin/AdminUsersPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Users' };

export default function Page() {
  return <AdminUsersPage />;
}
