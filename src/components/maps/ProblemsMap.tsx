'use client';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Leaflet must only run on the client — dynamic import with ssr:false
const ProblemsMapInner = dynamic(() => import('./ProblemsMapInner'), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" label="Loading map…" className="h-[500px]" />,
});

export { ProblemsMapInner as ProblemsMap };
export default ProblemsMapInner;
