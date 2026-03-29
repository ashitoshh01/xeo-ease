import { Store, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ShopList() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-16 px-4">
            <div className="w-full max-w-lg animate-fade-in">
                <div className="flex flex-col items-center text-center mb-10">
                    <img src="/favicon.png" alt="PrintLoo" className="h-[48px] w-auto mb-4" />
                    <h1 className="text-2xl font-bold text-text-primary">Available Print Shops</h1>
                    <p className="text-[15px] text-text-secondary mt-2">
                        Select a store near you to skip the printing queue.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <Link
                        to="/jyotienterprise"
                        className="bg-white border border-border hover:border-blue-primary/50 transition-colors rounded-2xl p-5 flex items-center justify-between group shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-primary flex items-center justify-center">
                                <Store size={24} />
                            </div>
                            <div>
                                <h2 className="text-[16px] font-semibold text-text-primary">Jyoti Enterprise</h2>
                                <p className="text-[13px] text-text-secondary mt-0.5">Online • Fast Print Queue</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-text-muted group-hover:text-blue-primary transition-colors" />
                    </Link>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[13px] text-text-muted">More partner stores arriving soon.</p>
                </div>
            </div>
        </div>
    );
}
