import { NotificationsPage } from '@/components/pages/NotificationsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Notifications' };

export default function Page() {
  return <NotificationsPage />;
}
