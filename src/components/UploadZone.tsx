import { useCallback, useRef, useState } from 'react';
import { Upload, FileText, Image, File, X } from 'lucide-react';
import { formatFileSize, isValidFileType, isValidFileSize, getFileExtension } from '@/lib/utils';

interface UploadZoneProps {
    onFile: (file: File) => void;
    onRemove: () => void;
    file: File | null;
    pageCount: number;
    uploadProgress: number;
    accept?: string;
}

function getFileIcon(fileName: string) {
    const ext = getFileExtension(fileName);
    if (ext === 'pdf') return <FileText size={28} className="text-blue-primary" />;
    if (['jpg', 'jpeg', 'png'].includes(ext)) return <Image size={28} className="text-blue-primary" />;
    return <File size={28} className="text-blue-primary" />;
}

export default function UploadZone({
    onFile,
    onRemove,
    file,
    pageCount,
    uploadProgress,
}: UploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState('');

    const handleFile = useCallback(
        (f: File) => {
            setError('');
            if (!isValidFileType(f.name)) {
                setError('Please upload a PDF, DOCX, JPG, or PNG file.');
                return;
            }
            if (!isValidFileSize(f.size)) {
                setError('File size must be under 20 MB.');
                return;
            }
            onFile(f);
        },
        [onFile]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
        },
        [handleFile]
    );

    if (file) {
        return (
            <div className="animate-scale-in">
                <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider block mb-2">
                    Document
                </span>
                <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-light flex items-center justify-center flex-shrink-0">
                        {getFileIcon(file.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-text-primary truncate">{file.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[12px] text-text-secondary">{formatFileSize(file.size)}</span>
                            {pageCount > 0 && (
                                <span className="text-[12px] text-blue-primary font-medium">
                                    {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                                </span>
                            )}
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="mt-2 w-full bg-blue-light rounded-full h-1.5">
                                <div
                                    className="bg-blue-primary h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-background transition-colors cursor-pointer"
                    >
                        <X size={16} className="text-text-muted" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider block mb-2">
                Document
            </span>
            <div
                className={`upload-zone ${dragging ? 'dragging' : ''} p-8 flex flex-col items-center justify-center gap-3`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <div className="w-14 h-14 rounded-2xl bg-blue-light flex items-center justify-center">
                    <Upload size={24} className="text-blue-primary" />
                </div>
                <div className="text-center">
                    <p className="text-[15px] font-medium text-text-primary">
                        Tap to upload or drag here
                    </p>
                    <p className="text-[13px] text-text-muted mt-1">
                        PDF, DOCX, JPG, PNG — Max 20 MB
                    </p>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                    }}
                />
            </div>
            {error && (
                <p className="text-[12px] text-error font-medium mt-2">{error}</p>
            )}
        </div>
    );
}
