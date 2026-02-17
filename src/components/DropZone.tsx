'use client';

import { useState, useCallback, useRef } from 'react';
import { ALLOWED_EXTENSIONS } from '@/utils/constants';

interface DropZoneProps {
    onFilesAdded: (files: File[]) => void;
    className?: string;
    isCompact?: boolean;
}

export function DropZone({ onFilesAdded, className = '', isCompact = false }: DropZoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);

            const droppedFiles = Array.from(e.dataTransfer.files);
            if (droppedFiles.length > 0) {
                onFilesAdded(droppedFiles);
            }
        },
        [onFilesAdded]
    );

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                onFilesAdded(Array.from(e.target.files));
            }
            // Reset input value to allow selecting the same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [onFilesAdded]
    );

    const onButtonClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={onButtonClick}
            className={`
        relative group cursor-pointer transition-all duration-300 ease-out
        border-2 border-dashed rounded-2xl text-center
        ${isDragActive
                    ? 'border-brand-500 bg-brand-500/10 scale-[1.02]'
                    : 'border-white/10 hover:border-brand-500/40 bg-white/[0.02] hover:bg-white/[0.04]'
                }
        ${isCompact ? 'p-6' : 'p-12'}
        ${className}
      `}
        >
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept={ALLOWED_EXTENSIONS.join(',')}
                onChange={handleFileInputChange}
            />

            <div className="flex flex-col items-center justify-center pointer-events-none">
                <div
                    className={`
            rounded-2xl flex items-center justify-center transition-colors duration-300
            ${isDragActive ? 'bg-brand-500 text-white' : 'bg-brand-500/10 text-brand-400 group-hover:bg-brand-500 group-hover:text-white'}
            ${isCompact ? 'w-10 h-10 mb-3' : 'w-16 h-16 mb-4'}
          `}
                >
                    <svg
                        className={`${isCompact ? 'w-5 h-5' : 'w-8 h-8'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                </div>

                {isDragActive ? (
                    <p className="text-brand-400 text-lg font-medium animate-pulse">
                        Drop it like it's hot!
                    </p>
                ) : (
                    <>
                        <p className="text-foreground/80 text-lg font-medium mb-1 group-hover:text-foreground transition-colors">
                            {isCompact ? 'Drop more images' : 'Drop your images here'}
                        </p>
                        <p className="text-foreground/40 text-sm group-hover:text-foreground/60 transition-colors">
                            or click to browse • JPG, PNG, GIF, WebP
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
