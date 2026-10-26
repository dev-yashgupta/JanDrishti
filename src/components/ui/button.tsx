import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155EEF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#155EEF] text-white hover:bg-blue-600 shadow-sm shadow-blue-500/25 hover:shadow-md',
        destructive: 'bg-[#D92D20] text-white hover:bg-red-700 shadow-sm shadow-red-500/25',
        outline: 'border border-[#E4E7EC] bg-white text-slate-700 hover:bg-slate-50 hover:text-[#071A2F]',
        secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-[#071A2F]',
        link: 'text-[#155EEF] underline-offset-4 hover:underline p-0 h-auto',
        saffron: 'bg-[#F79009] text-white hover:bg-amber-500 shadow-sm shadow-amber-500/25',
        success: 'bg-[#12B76A] text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/25',
        navy: 'bg-[#071A2F] text-white hover:bg-slate-900 shadow-sm',
        teal: 'bg-[#0E9384] text-white hover:bg-teal-700 shadow-sm',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xs: 'h-7 rounded-lg px-2.5 text-xs',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
