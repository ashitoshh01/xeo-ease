import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import JobCard from '@/components/JobCard';
import EmptyQueue from '@/components/EmptyQueue';
import Badge from '@/components/Badge';
import { subscribeToJobs, markJobAsPrinted, reopenJob } from '@/lib/services';
import type { Job } from '@/types';

export default function AdminQueue() {
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeToJobs((jobs) => {
            setAllJobs(jobs);
            setLoading(false);
        });
        return unsub;
    }, []);

    // Filter today's jobs
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayJobs = allJobs.filter((j) => {
        const created = j.createdAt?.toDate ? j.createdAt.toDate() : new Date();
        return created >= startOfDay;
    });

    const pendingJobs = todayJobs.filter((j) => j.status === 'pending' || j.status === 'inprogress');
    const completedJobs = todayJobs.filter((j) => j.status === 'printed');

    const handleMarkPrinted = async (jobId: string) => {
        await markJobAsPrinted(jobId);
    };

    const handleReopen = async (jobId: string) => {
        await reopenJob(jobId);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="skeleton h-8 w-48" />
                    <div className="skeleton h-8 w-20" />
                </div>
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-44 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 animate-fade-in">
                <div>
                    <h1 className="text-[22px] font-semibold text-text-primary">Print Queue</h1>
                    <p className="text-[14px] text-text-secondary mt-0.5">
                        {todayJobs.length} jobs today
                    </p>
                </div>
                <Badge variant="pending">
                    {pendingJobs.length} pending
                </Badge>
            </div>

            {/* Active Queue */}
            {pendingJobs.length === 0 ? (
                <EmptyQueue />
            ) : (
                <div className="flex flex-col gap-4">
                    {pendingJobs.map((job, i) => (
                        <div key={job.jobId} className={`stagger-${Math.min(i + 1, 6)}`} style={{ opacity: 0, animation: `fadeIn 0.4s ease-out ${i * 0.05}s forwards` }}>
                            <JobCard
                                job={job}
                                onMarkPrinted={handleMarkPrinted}
                                onReopen={handleReopen}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Completed Section */}
            {completedJobs.length > 0 && (
                <div className="mt-8">
                    <button
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="flex items-center gap-2 w-full py-3 text-left cursor-pointer group"
                    >
                        <span className="text-[15px] font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                            Completed Today
                        </span>
                        <Badge variant="printed">{completedJobs.length}</Badge>
                        <div className="flex-1 h-px bg-border mx-3" />
                        {showCompleted ? (
                            <ChevronUp size={18} className="text-text-muted" />
                        ) : (
                            <ChevronDown size={18} className="text-text-muted" />
                        )}
                    </button>

                    {showCompleted && (
                        <div className="flex flex-col gap-4 mt-2 animate-slide-up">
                            {completedJobs.map((job) => (
                                <div key={job.jobId} className="opacity-75">
                                    <JobCard
                                        job={job}
                                        onMarkPrinted={handleMarkPrinted}
                                        onReopen={handleReopen}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
