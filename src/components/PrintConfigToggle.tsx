import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

interface PrintConfigToggleProps {
    options: { value: string; label: string; icon?: ReactNode }[];
    selected: string;
    onChange: (value: string) => void;
    label?: string;
}

export default function PrintConfigToggle({
    options,
    selected,
    onChange,
    label,
}: PrintConfigToggleProps) {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">
                    {label}
                </span>
            )}
            <div className="grid grid-cols-2 gap-3">
                {options.map((option) => {
                    const isSelected = selected === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`config-toggle ${isSelected ? 'selected' : ''}`}
                        >
                            {option.icon && (
                                <span className={isSelected ? 'text-blue-primary' : 'text-text-muted'}>
                                    {option.icon}
                                </span>
                            )}
                            <span
                                className={`flex-1 text-left text-[14px] font-medium ${isSelected ? 'text-blue-primary' : 'text-text-primary'
                                    }`}
                            >
                                {option.label}
                            </span>
                            {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-blue-primary flex items-center justify-center">
                                    <Check size={12} className="text-white" strokeWidth={3} />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
