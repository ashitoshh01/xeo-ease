import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, FileText, Share2, Printer, ArrowLeft } from 'lucide-react';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import PageLoader from '@/components/PageLoader';
import { getJobById, getQueuePosition } from '@/lib/services';
import { formatCurrency, getOrdinal } from '@/lib/utils';
import type { Job } from '@/types';

const AVG_JOB_TIME_MINUTES = 4;

export default function Confirmation() {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');

    const [job, setJob] = useState<Job | null>(null);
    const [queuePos, setQueuePos] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!jobId) return;

        const fetchData = async () => {
            try {
                const [jobData, position] = await Promise.all([
                    getJobById(jobId),
                    getQueuePosition(jobId),
                ]);
                setJob(jobData);
                setQueuePos(position);
            } catch (err) {
                console.error('Error fetching job:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [jobId]);

    if (loading) return <PageLoader />;

    if (!job) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                    <FileText size={28} className="text-error" />
                </div>
                <p className="text-lg font-semibold text-text-primary">Job not found</p>
                <Link to="/">
                    <Button variant="secondary" icon={<ArrowLeft size={16} />}>
                        Back to Upload
                    </Button>
                </Link>
            </div>
        );
    }

    const waitTime = queuePos * AVG_JOB_TIME_MINUTES;
    const tokenStr = String(job.tokenNumber).padStart(3, '0');
    const whatsappText = encodeURIComponent(
        `🖨️ PrintLoo — Token #${tokenStr}\nPosition: ${getOrdinal(queuePos)} in queue\nEstimated wait: ~${waitTime} min`
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-white border-b border-border">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-primary flex items-center justify-center">
                        <Printer size={20} className="text-white" />
                    </div>
                    <h1 className="text-[17px] font-semibold text-text-primary">PrintLoo</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* Success Banner */}
                <div className="text-center mb-8 animate-slide-up">
                    <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={40} className="text-success" />
                    </div>
                    <h2 className="text-[22px] font-semibold text-text-primary">You're in the queue!</h2>
                    <p className="text-text-secondary mt-1">Payment received. Your print job has been queued.</p>
                </div>

                {/* Token Card */}
                <Card className="text-center mb-6 animate-scale-in">
                    <p className="text-[13px] font-medium text-text-secondary uppercase tracking-wider mb-2">
                        Your Token Number
                    </p>
                    <p className="token-number">#{tokenStr}</p>

                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="text-center">
                            <p className="text-[13px] text-text-muted uppercase tracking-wider mb-1">Position</p>
                            <p className="text-xl font-bold text-text-primary">{getOrdinal(queuePos)}</p>
                            <p className="text-[12px] text-text-secondary">in queue</p>
                        </div>
                        <div className="w-px h-12 bg-border" />
                        <div className="text-center">
                            <p className="text-[13px] text-text-muted uppercase tracking-wider mb-1">Est. Wait</p>
                            <div className="flex items-center justify-center gap-1.5">
                                <Clock size={16} className="text-warning" />
                                <p className="text-xl font-bold text-text-primary">~{waitTime}</p>
                            </div>
                            <p className="text-[12px] text-text-secondary">minutes</p>
                        </div>
                    </div>
                </Card>

                {/* Print Specs Summary */}
                <Card className="mb-6 animate-fade-in stagger-2">
                    <h3 className="text-[15px] font-semibold text-text-primary mb-3">Print Specifications</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex justify-between">
                            <span className="text-[13px] text-text-secondary">Document</span>
                            <span className="text-[13px] font-medium text-text-primary truncate ml-2 max-w-[140px]">
                                {job.fileName}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[13px] text-text-secondary">Pages</span>
                            <span className="text-[13px] font-medium text-text-primary">{job.pageCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[13px] text-text-secondary">Colour</span>
                            <Badge variant={job.config.colorMode === 'color' ? 'color' : 'bw'}>
                                {job.config.colorMode === 'color' ? 'Colour' : 'B&W'}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[13px] text-text-secondary">Sides</span>
                            <span className="text-[13px] font-medium text-text-primary">
                                {job.config.sides === 'single' ? 'Single' : 'Double'}-sided
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[13px] text-text-secondary">Size</span>
                            <span className="text-[13px] font-medium text-text-primary">{job.config.pageSize}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[13px] text-text-secondary">Copies</span>
                            <span className="text-[13px] font-medium text-text-primary">{job.config.copies}</span>
                        </div>
                    </div>
                    {job.config.specialInstructions && (
                        <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-[12px] text-text-muted uppercase tracking-wider mb-1">
                                Special Instructions
                            </p>
                            <p className="text-[13px] text-text-primary">{job.config.specialInstructions}</p>
                        </div>
                    )}
                    <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                        <span className="text-[14px] font-semibold text-text-primary">Total Paid</span>
                        <span className="text-lg font-bold text-blue-primary">{formatCurrency(job.amountPaid)}</span>
                    </div>
                </Card>

                {/* Actions */}
                <div className="flex flex-col gap-3 animate-fade-in stagger-3">
                    <a
                        href={`https://wa.me/?text=${whatsappText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                    >
                        <Button variant="secondary" className="w-full" icon={<Share2 size={16} />}>
                            Share via WhatsApp
                        </Button>
                    </a>
                    <Link to="/">
                        <Button variant="ghost" className="w-full" icon={<ArrowLeft size={16} />}>
                            Submit Another Job
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
