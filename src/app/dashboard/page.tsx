import { CitizenDashboard } from '@/components/pages/CitizenDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Dashboard' };

export default function Page() {
  return <CitizenDashboard />;
}
