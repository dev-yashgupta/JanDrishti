import { ExplorePage } from '@/components/pages/ExplorePage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Explore Issues' };

export default function Page() {
  return <ExplorePage />;
}
