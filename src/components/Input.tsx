import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helpText?: string;
}

export default function Input({
    label,
    error,
    helpText,
    className = '',
    id,
    ...props
}: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-[13px] font-medium text-text-secondary uppercase tracking-wider"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
          h-12 px-4 rounded-xl border transition-all duration-200
          text-text-primary placeholder:text-text-muted
          ${error
                        ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                        : 'border-border focus:border-blue-primary focus:ring-2 focus:ring-blue-primary/20 focus:bg-[#F8FAFF]'
                    }
          outline-none
          ${className}
        `}
                {...props}
            />
            {error && (
                <span className="text-[12px] text-error font-medium">{error}</span>
            )}
            {helpText && !error && (
                <span className="text-[12px] text-text-muted">{helpText}</span>
            )}
        </div>
    );
}
