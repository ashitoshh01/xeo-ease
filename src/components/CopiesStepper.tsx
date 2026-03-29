import { Minus, Plus } from 'lucide-react';

interface CopiesStepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    label?: string;
}

export default function CopiesStepper({
    value,
    onChange,
    min = 1,
    max = 50,
    label,
}: CopiesStepperProps) {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">
                    {label}
                </span>
            )}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(min, value - 1))}
                    disabled={value <= min}
                    className="w-12 h-12 rounded-xl border border-border flex items-center justify-center
                     hover:bg-background active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                    <Minus size={18} className="text-text-primary" />
                </button>
                <div className="w-16 h-12 rounded-xl border border-border flex items-center justify-center">
                    <span className="text-lg font-semibold text-text-primary">{value}</span>
                </div>
                <button
                    type="button"
                    onClick={() => onChange(Math.min(max, value + 1))}
                    disabled={value >= max}
                    className="w-12 h-12 rounded-xl border border-border flex items-center justify-center
                     hover:bg-background active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                    <Plus size={18} className="text-text-primary" />
                </button>
            </div>
        </div>
    );
}
