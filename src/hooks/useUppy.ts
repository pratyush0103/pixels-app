'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Uppy from '@uppy/core';
import ThumbnailGenerator from '@uppy/thumbnail-generator';
// @ts-ignore - Importing locally defined plugin or util
import CloudinaryUploader from '../utils/CloudinaryUploader';
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_CONFIG } from '@/utils/cloudinary';
import {
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE,
    MAX_CONCURRENT_UPLOADS,
    THUMBNAIL_WIDTH,
    THUMBNAIL_HEIGHT,
} from '@/utils/constants';
import type { UppyFileWithMeta, OverallProgress, FileStatus } from '@/types';

/**
 * Custom hook that wraps Uppy in headless mode.
 * 
 * This hook:
 * - Creates and manages a single Uppy instance
 * - Configures XHRUpload for Cloudinary
 * - Generates thumbnails for image previews
 * - Tracks per-file and overall progress
 * - Exposes actions: upload, cancel, retry, remove, clear
 */
export function useUppy() {
    const uppyRef = useRef<Uppy | null>(null);
    const [files, setFiles] = useState<UppyFileWithMeta[]>([]);
    const [overallProgress, setOverallProgress] = useState<OverallProgress>({
        totalFiles: 0,
        completedFiles: 0,
        totalBytes: 0,
        uploadedBytes: 0,
        percentage: 0,
    });
    const [isUploading, setIsUploading] = useState(false);
    const uploadStartTimeRef = useRef<number | null>(null);

    // Initialize Uppy instance once
    useEffect(() => {
        const uppy = new Uppy({
            restrictions: {
                allowedFileTypes: ALLOWED_FILE_TYPES,
                maxFileSize: MAX_FILE_SIZE,
            },
            autoProceed: false, // Manual upload trigger
        });

        // Configure Custom Cloudinary Uploader
        // @ts-ignore - Plugin type compatibility
        uppy.use(CloudinaryUploader, {
            cloudName: CLOUDINARY_CONFIG.cloudName,
            uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
        });

        // Configure Thumbnail Generator
        uppy.use(ThumbnailGenerator, {
            thumbnailWidth: THUMBNAIL_WIDTH,
            thumbnailHeight: THUMBNAIL_HEIGHT,
            thumbnailType: 'image/jpeg',
            waitForThumbnailsBeforeUpload: false,
        });

        // ---- Event Listeners ----

        // File added
        uppy.on('file-added', (file) => {
            // Remove 'type' and 'name' from meta to prevent XHRUpload from sending them as form fields
            // Cloudinary rejects 'type' field
            uppy.setFileMeta(file.id, {
                type: undefined,
                name: undefined,
            });
            syncFiles(uppy);
        });

        // File removed
        uppy.on('file-removed', () => {
            syncFiles(uppy);
        });

        // Thumbnail generated
        uppy.on('thumbnail:generated', (file, preview) => {
            // Uppy stores this on the file object; we just need to re-sync
            syncFiles(uppy);
        });

        // Upload progress (per file)
        uppy.on('upload-progress', (file, progress) => {
            syncFiles(uppy);
            updateOverallProgress(uppy);
        });

        // Upload success (per file)
        uppy.on('upload-success', (file, response) => {
            syncFiles(uppy);
            updateOverallProgress(uppy);
        });

        // Upload error (per file)
        uppy.on('upload-error', (file, error) => {
            syncFiles(uppy);
            updateOverallProgress(uppy);
        });

        // All uploads complete
        uppy.on('complete', () => {
            setIsUploading(false);
            uploadStartTimeRef.current = null;
            syncFiles(uppy);
            updateOverallProgress(uppy);
        });

        // Overall progress
        uppy.on('progress', (progress: number) => {
            setOverallProgress((prev) => ({
                ...prev,
                percentage: progress,
            }));
        });

        // Restriction failed (validation error)
        uppy.on('restriction-failed', (file, error) => {
            console.warn('Restriction failed:', file?.name, error.message);
        });

        uppyRef.current = uppy;
        return () => {
            uppy.cancelAll();
            // uppy.close() is not available on the type, and cleanup is handled by GC for the instance usually
        };
    }, []);

    // Sync Uppy internal state → our React state
    const syncFiles = useCallback((uppy: Uppy) => {
        const uppyFiles = uppy.getFiles();
        const mapped: UppyFileWithMeta[] = uppyFiles.map((f) => {
            let status: FileStatus = 'pending';
            if (f.progress?.uploadComplete) {
                status = 'complete';
            } else if (f.error) {
                status = 'error';
            } else if (f.progress?.uploadStarted) {
                status = 'uploading';
            }

            return {
                id: f.id,
                name: f.name || 'Unknown',
                size: f.size || 0,
                type: f.type || '',
                status,
                progress: f.progress?.percentage || 0,
                preview: f.preview as string | undefined,
                uploadURL: f.response?.uploadURL || (f.response?.body as Record<string, string>)?.url,
                error: f.error || undefined,
            };
        });
        setFiles(mapped);
    }, []);

    // Update overall progress
    const updateOverallProgress = useCallback((uppy: Uppy) => {
        const uppyFiles = uppy.getFiles();
        let totalBytes = 0;
        let uploadedBytes = 0;
        let completedFiles = 0;

        uppyFiles.forEach((f) => {
            totalBytes += f.size || 0;
            if (f.progress?.uploadComplete) {
                completedFiles++;
                uploadedBytes += f.size || 0;
            } else if (f.progress?.bytesUploaded) {
                uploadedBytes += f.progress.bytesUploaded;
            }
        });

        const percentage = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;

        // Estimate time remaining
        let estimatedTimeRemaining: number | undefined;
        if (uploadStartTimeRef.current && uploadedBytes > 0 && percentage < 100) {
            const elapsed = (Date.now() - uploadStartTimeRef.current) / 1000; // seconds
            const rate = uploadedBytes / elapsed; // bytes per second
            const remaining = totalBytes - uploadedBytes;
            estimatedTimeRemaining = Math.round(remaining / rate);
        }

        setOverallProgress({
            totalFiles: uppyFiles.length,
            completedFiles,
            totalBytes,
            uploadedBytes,
            percentage,
            startTime: uploadStartTimeRef.current || undefined,
            estimatedTimeRemaining,
        });
    }, []);

    // ---- Actions ----

    const addFiles = useCallback((fileList: FileList | File[]) => {
        const uppy = uppyRef.current;
        if (!uppy) return;

        console.log('UseUppy: Adding files with config:', CLOUDINARY_CONFIG);

        const filesArray = Array.from(fileList);
        filesArray.forEach((file) => {
            try {
                uppy.addFile({
                    name: file.name,
                    type: file.type,
                    data: file,
                    source: 'local',
                    meta: {
                        upload_preset: CLOUDINARY_CONFIG.uploadPreset,
                    },
                });
            } catch (err) {
                // Uppy throws on restriction failures — we handle via the event
                console.warn('Could not add file:', err);
            }
        });
    }, []);

    const uploadAll = useCallback(() => {
        const uppy = uppyRef.current;
        if (!uppy) return;

        // Add Cloudinary upload_preset to each file's metadata
        const uppyFiles = uppy.getFiles();
        uppyFiles.forEach((f) => {
            uppy.setFileMeta(f.id, {
                upload_preset: CLOUDINARY_CONFIG.uploadPreset,
            });
        });

        setIsUploading(true);
        uploadStartTimeRef.current = Date.now();
        uppy.upload();
    }, []);

    const cancelAll = useCallback(() => {
        const uppy = uppyRef.current;
        if (!uppy) return;
        uppy.cancelAll();
        setIsUploading(false);
        uploadStartTimeRef.current = null;
        syncFiles(uppy);
        updateOverallProgress(uppy);
    }, [syncFiles, updateOverallProgress]);

    const retryAll = useCallback(() => {
        const uppy = uppyRef.current;
        if (!uppy) return;
        setIsUploading(true);
        uploadStartTimeRef.current = Date.now();
        uppy.retryAll();
    }, []);

    const retryFile = useCallback((fileId: string) => {
        const uppy = uppyRef.current;
        if (!uppy) return;
        uppy.retryUpload(fileId);
    }, []);

    const removeFile = useCallback((fileId: string) => {
        const uppy = uppyRef.current;
        if (!uppy) return;
        uppy.removeFile(fileId);
        updateOverallProgress(uppy);
    }, [updateOverallProgress]);

    const clearCompleted = useCallback(() => {
        const uppy = uppyRef.current;
        if (!uppy) return;
        const uppyFiles = uppy.getFiles();
        uppyFiles.forEach((f) => {
            if (f.progress?.uploadComplete) {
                uppy.removeFile(f.id);
            }
        });
        updateOverallProgress(uppy);
    }, [updateOverallProgress]);

    const clearAll = useCallback(() => {
        const uppy = uppyRef.current;
        if (!uppy) return;
        uppy.clear();
        setFiles([]);
        setOverallProgress({
            totalFiles: 0,
            completedFiles: 0,
            totalBytes: 0,
            uploadedBytes: 0,
            percentage: 0,
        });
        setIsUploading(false);
        uploadStartTimeRef.current = null;
    }, []);

    return {
        files,
        overallProgress,
        isUploading,
        addFiles,
        uploadAll,
        cancelAll,
        retryAll,
        retryFile,
        removeFile,
        clearCompleted,
        clearAll,
    };
}
