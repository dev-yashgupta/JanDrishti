import { cn } from '@/lib/utils';

export function DemoLabel({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200',
        className
      )}
    >
      ⚡ Demo Data
    </span>
  );
}
