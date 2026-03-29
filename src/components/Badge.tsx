import type { ReactNode } from 'react';

type BadgeVariant = 'pending' | 'inprogress' | 'printed' | 'bw' | 'color';

interface BadgeProps {
    variant: BadgeVariant;
    children: ReactNode;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    pending: 'bg-blue-light text-blue-primary',
    inprogress: 'bg-amber-50 text-amber-800',
    printed: 'bg-green-50 text-green-800',
    bw: 'bg-background text-gray-700',
    color: 'bg-orange-50 text-orange-700',
};

export default function Badge({ variant, children, className = '' }: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-semibold
        ${variantClasses[variant]}
        ${className}
      `}
        >
            {children}
        </span>
    );
}
