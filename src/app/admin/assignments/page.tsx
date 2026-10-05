import { AdminAssignmentsPage } from '@/components/pages/admin/AdminAssignmentsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Assignments' };

export default function Page() {
  return <AdminAssignmentsPage />;
}
