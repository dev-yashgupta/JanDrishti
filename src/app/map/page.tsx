import { CommunityMapPage } from '@/components/pages/CommunityMapPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Map | JanDrishti AI',
  description: 'Real-time geospatial OpenStreetMap with device GPS pinpointing and priority heatmaps.',
};

export default function Page() {
  return <CommunityMapPage />;
}
