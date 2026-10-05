import { ReportProblemPage } from '@/components/pages/ReportProblemPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Report a Problem' };

export default function Page() {
  return <ReportProblemPage />;
}
