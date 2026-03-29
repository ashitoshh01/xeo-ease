import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hover?: boolean;
}

export default function Card({ children, hover = true, className = '', ...props }: CardProps) {
    return (
        <div
            className={`
        bg-white border border-border rounded-2xl p-5 md:p-6
        shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]
        ${hover ? 'transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}
