import { UppyFileWithMeta } from '@/types';
import { X, RefreshCw, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface ImageCardProps {
    file: UppyFileWithMeta;
    onRetry: (id: string) => void;
    onRemove: (id: string) => void;
}

export function ImageCard({ file, onRetry, onRemove }: ImageCardProps) {
    const isUploading = file.status === 'uploading';
    const isError = file.status === 'error';
    const isComplete = file.status === 'complete';

    return (
        <div className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            {/* Image Preview */}
            <div className="relative aspect-auto w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {file.preview ? (
                    <img
                        src={file.preview}
                        alt={file.name}
                        className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-48 w-full items-center justify-center text-zinc-400">
                        <span className="text-sm">No Preview</span>
                    </div>
                )}

                {/* Overlay Actions (Hover) */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    {isError ? (
                        <button
                            onClick={() => onRetry(file.id)}
                            className="rounded-full bg-white p-2 text-zinc-900 hover:bg-zinc-100"
                            title="Retry"
                        >
                            <RefreshCw className="h-5 w-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => onRemove(file.id)}
                            className="rounded-full bg-white/90 p-2 text-red-500 hover:bg-white"
                            title="Remove"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Info & Progress */}
            <div className="p-3">
                <div className="mb-2 flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-200" title={file.name}>
                        {file.name}
                    </p>
                    <span className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>

                {/* Status Bar */}
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                        className={`absolute left-0 top-0 h-full transition-all duration-300 ${isError
                                ? 'bg-red-500'
                                : isComplete
                                    ? 'bg-green-500'
                                    : 'bg-blue-500'
                            }`}
                        style={{ width: `${file.progress}%` }}
                    />
                </div>

                {/* Status Text */}
                <div className="mt-2 flex items-center justify-between text-xs">
                    {isError ? (
                        <span className="flex items-center text-red-500">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Failed
                        </span>
                    ) : isComplete ? (
                        <span className="flex items-center text-green-500">
                            <Check className="mr-1 h-3 w-3" />
                            Done
                        </span>
                    ) : (
                        <span className="text-zinc-500">{Math.round(file.progress)}%</span>
                    )}
                </div>
            </div>
        </div>
    );
}
