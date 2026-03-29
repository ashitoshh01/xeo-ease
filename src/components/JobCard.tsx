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
            ? 'job-card-pending'
            : job.status === 'inprogress'
                ? 'job-card-inprogress'
                : 'job-card-printed';

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
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-blue-primary">#{String(job.tokenNumber).padStart(3, '0')}</span>
                    <span className="text-[15px] font-medium text-text-primary">{job.customerName}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={job.status as 'pending' | 'inprogress' | 'printed'}>
                        {job.status === 'pending' ? 'Pending' : job.status === 'inprogress' ? 'In Progress' : 'Printed'}
                    </Badge>
                </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {/* Phone */}
                <a
                    href={`tel:${job.phone}`}
                    className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-blue-primary transition-colors"
                >
                    <Phone size={13} />
                    <span>{job.phone}</span>
                </a>

                {/* File */}
                <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                    {getFileIcon(getFileExtension(job.fileName))}
                    <span className="truncate">{job.fileName}</span>
                </div>

                {/* Amount */}
                <div className="text-[13px] font-semibold text-text-primary">
                    {formatCurrency(job.amountPaid)}
                </div>

                {/* Time */}
                <div className="flex items-center gap-1.5 text-[13px] text-text-muted">
                    <Clock size={13} />
                    <span>{timeAgo(createdDate)}</span>
                </div>
            </div>

            {/* Specs */}
            <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={job.config.colorMode === 'color' ? 'color' : 'bw'}>
                    {job.config.colorMode === 'color' ? 'Colour' : 'B&W'}
                </Badge>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium bg-background text-text-secondary">
                    {job.config.sides === 'single' ? 'Single-sided' : 'Double-sided'}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium bg-background text-text-secondary">
                    {job.config.pageSize}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium bg-background text-text-secondary">
                    {job.config.copies} {job.config.copies === 1 ? 'copy' : 'copies'}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium bg-background text-text-secondary">
                    {job.pageCount} {job.pageCount === 1 ? 'page' : 'pages'}
                </span>
            </div>

            {/* Special instructions */}
            {job.config.specialInstructions && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-3">
                    <p className="text-[12px] font-medium text-amber-800">
                        📝 {job.config.specialInstructions}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
                {job.fileUrl && (
                    <a
                        href={job.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-medium
                       text-blue-primary bg-blue-light hover:bg-blue-200/50 transition-colors"
                    >
                        <ExternalLink size={14} />
                        Open Document
                    </a>
                )}
                {job.fileUrl && (
                    <a
                        href={job.fileUrl}
                        download={job.fileName}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-medium
                       text-text-secondary bg-background hover:bg-border/50 transition-colors"
                    >
                        <Download size={14} />
                        Download
                    </a>
                )}
                <div className="flex-1" />
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
