import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: ReactNode;
    children: ReactNode;
}

const variantClasses: Record<string, string> = {
    primary:
        'bg-blue-primary text-white hover:bg-blue-hover active:scale-[0.98] disabled:bg-text-muted disabled:cursor-not-allowed',
    secondary:
        'bg-white text-text-primary border border-border hover:bg-background active:scale-[0.98] disabled:opacity-50',
    danger:
        'bg-error text-white hover:bg-red-700 active:scale-[0.98] disabled:opacity-50',
    ghost:
        'bg-transparent text-text-secondary hover:bg-background hover:text-text-primary',
};

const sizeClasses: Record<string, string> = {
    sm: 'h-9 px-4 text-[13px]',
    md: 'h-12 px-6 text-[15px]',
    lg: 'h-14 px-8 text-base',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`
        inline-flex items-center justify-center gap-2 font-semibold
        rounded-xl transition-all duration-200 cursor-pointer
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Loader2 size={18} className="animate-spin-slow" />
            ) : icon ? (
                icon
            ) : null}
            {!loading && children}
            {loading && <span>Processing...</span>}
        </button>
    );
}
