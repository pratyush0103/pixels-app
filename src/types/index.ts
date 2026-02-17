// Types for the image uploader application

export type FileStatus = 'pending' | 'uploading' | 'complete' | 'error';

export interface UppyFileWithMeta {
    id: string;
    name: string;
    size: number;
    type: string;
    status: FileStatus;
    progress: number; // 0-100
    preview?: string; // thumbnail data URL
    uploadURL?: string; // Cloudinary URL after upload
    error?: string;
}

export interface OverallProgress {
    totalFiles: number;
    completedFiles: number;
    totalBytes: number;
    uploadedBytes: number;
    percentage: number;
    startTime?: number;
    estimatedTimeRemaining?: number; // in seconds
}
