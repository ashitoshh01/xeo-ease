import { Printer } from 'lucide-react';

export default function PageLoader() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
            <div className="w-16 h-16 rounded-2xl bg-blue-light flex items-center justify-center animate-pulse-soft">
                <Printer size={28} className="text-blue-primary" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="text-[15px] font-medium text-text-primary">Loading...</p>
                <p className="text-[13px] text-text-muted">Please wait a moment</p>
            </div>
        </div>
    );
}
