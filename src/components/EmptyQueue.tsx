import { CheckCircle2, Printer } from 'lucide-react';

export default function EmptyQueue() {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
            <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center">
                    <Printer size={36} className="text-success" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-md">
                    <CheckCircle2 size={16} className="text-white" />
                </div>
            </div>
            <div className="text-center">
                <p className="text-lg font-semibold text-text-primary">All caught up!</p>
                <p className="text-[14px] text-text-secondary mt-1">No pending jobs in the queue</p>
            </div>
        </div>
    );
}
