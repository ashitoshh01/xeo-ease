import type { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    accent?: boolean;
}

export default function StatCard({ title, value, subtitle, icon, accent = false }: StatCardProps) {
    return (
        <div
            className={`
        bg-white border border-border rounded-2xl p-5 md:p-6
        shadow-[0_1px_3px_rgba(0,0,0,0.06)]
        ${accent ? 'border-l-4 border-l-blue-primary' : ''}
        animate-count-up
      `}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">
                        {title}
                    </p>
                    <p className="text-[28px] font-bold text-text-primary mt-1 leading-tight">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-[13px] text-text-muted mt-1">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div className="w-10 h-10 rounded-xl bg-blue-light flex items-center justify-center flex-shrink-0">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
