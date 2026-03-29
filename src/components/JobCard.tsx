import { useState } from 'react';
import { Phone, FileText, Image, File, CheckCircle2, ExternalLink, RotateCcw, Download, Clock } from 'lucide-react';
import type { Job } from '@/types';
import Badge from './Badge';
import Button from './Button';
import { formatCurrency, timeAgo, getFileExtension } from '@/lib/utils';

interface JobCardProps {
    job: Job;
    onMarkPrinted: (jobId: string) => Promise<void>;
    onReopen?: (jobId: string) => Promise<void>;
}

function getFileIcon(fileType: string) {
    const ext = fileType.toLowerCase();
    if (ext === 'pdf') return <FileText size={18} className="text-blue-primary" />;
    if (['jpg', 'jpeg', 'png'].includes(ext)) return <Image size={18} className="text-blue-primary" />;
    return <File size={18} className="text-blue-primary" />;
}

export default function JobCard({ job, onMarkPrinted, onReopen }: JobCardProps) {
    const [loading, setLoading] = useState(false);
    const [reopenLoading, setReopenLoading] = useState(false);

    const statusBorderClass =
        job.status === 'pending'
            ? 'border-l-4 border-l-warning'
            : job.status === 'inprogress'
                ? 'border-l-4 border-l-blue-primary'
                : 'border-l-4 border-l-success';

    const createdDate = job.createdAt?.toDate ? job.createdAt.toDate() : new Date();

    const handleMarkPrinted = async () => {
        setLoading(true);
        try {
            await onMarkPrinted(job.jobId);
        } finally {
            setLoading(false);
        }
    };

    const handleReopen = async () => {
        if (!onReopen) return;
        setReopenLoading(true);
        try {
            await onReopen(job.jobId);
        } finally {
            setReopenLoading(false);
        }
    };

    const totalDocs = job.items?.length || 0;

    return (
        <div
            className={`
        ${statusBorderClass}
        bg-white border border-border rounded-xl p-4 md:px-5
        shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]
        animate-fade-in transition-all duration-200
      `}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-blue-primary">#{String(job.tokenNumber).padStart(3, '0')}</span>
                    <div>
                        <span className="text-[15px] font-medium text-text-primary block">{job.customerName}</span>
                        <a
                            href={`tel:${job.phone}`}
                            className="flex items-center gap-1 text-[12px] text-text-secondary hover:text-blue-primary transition-colors mt-0.5"
                        >
                            <Phone size={12} />
                            <span>{job.phone}</span>
                        </a>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge variant={job.status as 'pending' | 'inprogress' | 'printed'}>
                        {job.status === 'pending' ? 'Pending' : job.status === 'inprogress' ? 'In Progress' : 'Printed'}
                    </Badge>
                    <div className="text-[14px] font-semibold text-text-primary">
                        {formatCurrency(job.amountPaid)}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-1.5 text-[13px] text-text-muted">
                    <Clock size={13} />
                    <span>{timeAgo(createdDate)}</span>
                </div>
                <div className="text-[13px] text-text-muted">
                    {totalDocs} document{totalDocs !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Document Items List */}
            <div className="flex flex-col gap-4 mb-4">
                {job.items?.map((item, idx) => (
                    <div key={idx} className="bg-background rounded-lg p-3 border border-border/50">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                            <div className="flex items-center gap-2 max-w-[70%]">
                                {getFileIcon(getFileExtension(item.fileName))}
                                <span className="text-[13px] font-medium text-text-primary truncate" title={item.fileName}>
                                    {item.fileName}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {item.fileUrl && (
                                    <a
                                        href={item.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-primary hover:text-blue-600 transition-colors p-1"
                                        title="View Document"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Specs */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant={item.config.colorMode === 'color' ? 'color' : 'bw'}>
                                {item.config.colorMode === 'color' ? 'Colour' : 'B&W'}
                            </Badge>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-border text-text-secondary">
                                {item.config.sides === 'single' ? 'Single-sided' : 'Double-sided'}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-border text-text-secondary">
                                {item.config.pageSize}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-border text-text-secondary">
                                {item.config.copies} cop{item.config.copies === 1 ? 'y' : 'ies'}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-border text-text-secondary">
                                {item.pageCount} page{item.pageCount === 1 ? '' : 's'}
                            </span>
                        </div>

                        {/* Special instructions */}
                        {item.config.specialInstructions && (
                            <div className="mt-2 text-[12px] text-amber-700 bg-amber-50/50 p-2 rounded-md border border-amber-100/50">
                                <span className="font-medium">Note:</span> {item.config.specialInstructions}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Actions Bottom */}
            <div className="flex items-center justify-end gap-2 pt-2">
                {job.status === 'printed' && onReopen && (
                    <Button
                        variant="ghost"
                        size="sm"
                        loading={reopenLoading}
                        icon={<RotateCcw size={14} />}
                        onClick={handleReopen}
                    >
                        Reopen
                    </Button>
                )}
                {job.status !== 'printed' && (
                    <Button
                        variant="primary"
                        size="sm"
                        loading={loading}
                        icon={<CheckCircle2 size={14} />}
                        onClick={handleMarkPrinted}
                    >
                        Mark as Printed
                    </Button>
                )}
            </div>
        </div>
    );
}
