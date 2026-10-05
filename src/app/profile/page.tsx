import { ProfilePage } from '@/components/pages/ProfilePage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile' };

export default function Page() {
  return <ProfilePage />;
}
