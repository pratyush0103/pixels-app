'use client';

import { useUppy } from '@/hooks/useUppy';
import { DropZone } from '@/components/DropZone';
import { MasonryGrid } from '@/components/MasonryGrid';

export default function Home() {
  const {
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
  } = useUppy();

  const hasFiles = files.length > 0;
  const hasFailedFiles = files.some((f) => f.status === 'error');
  const hasCompletedFiles = files.some((f) => f.status === 'complete');
  const pendingFiles = files.filter((f) => f.status === 'pending' || f.status === 'uploading');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-white/5 bg-surface-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              Pixels
            </h1>
          </div>
          {hasFiles && (
            <div className="text-sm text-surface-200/60 font-mono">
              {overallProgress.completedFiles}/{overallProgress.totalFiles} uploaded
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Large Drop Zone (when empty) */}
        {!hasFiles && (
          <div className="max-w-2xl mx-auto mt-10">
            <DropZone onFilesAdded={addFiles} />
          </div>
        )}

        {/* Compact Drop Zone (when files exist) */}
        {hasFiles && (
          <div className="mb-8">
            <DropZone onFilesAdded={addFiles} isCompact className="border-white/5 bg-white/[0.01]" />
          </div>
        )}

        {/* Action Buttons (show when files exist) */}
        {hasFiles && (
          <div className="flex flex-wrap gap-3 mb-6">
            {pendingFiles.length > 0 && !isUploading && (
              <button
                onClick={uploadAll}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shadow-lg shadow-brand-500/20"
              >
                Upload All ({pendingFiles.length})
              </button>
            )}
            {isUploading && (
              <button
                onClick={cancelAll}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors border border-red-500/20"
              >
                Cancel
              </button>
            )}
            {hasFailedFiles && !isUploading && (
              <button
                onClick={retryAll}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-medium transition-colors border border-amber-500/20"
              >
                Retry Failed
              </button>
            )}
            {hasCompletedFiles && !isUploading && (
              <button
                onClick={clearCompleted}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground/60 text-sm font-medium transition-colors border border-white/10"
              >
                Clear Completed
              </button>
            )}
            {!isUploading && (
              <button
                onClick={clearAll}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground/40 text-sm font-medium transition-colors"
                title="Clear All Files"
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Overall Progress Bar */}
        {isUploading && (
          <div className="mb-8 p-6 rounded-2xl bg-surface-800/50 border border-white/5 backdrop-blur-sm">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">Uploading {pendingFiles.length} files...</p>
                <p className="text-xs text-foreground/40 mt-1">
                  {(overallProgress.uploadedBytes / 1024 / 1024).toFixed(1)} MB of {(overallProgress.totalBytes / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-brand-400">{overallProgress.percentage}%</span>
                {overallProgress.estimatedTimeRemaining !== undefined && (
                  <p className="text-xs text-foreground/40 mt-1">
                    ~{Math.ceil(overallProgress.estimatedTimeRemaining)}s remaining
                  </p>
                )}
              </div>
            </div>
            <div className="h-2 bg-surface-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${overallProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Masonry Grid Gallery */}
        <MasonryGrid
          files={files}
          onRetry={retryFile}
          onRemove={removeFile}
        />
      </main>
    </div>
  );
}

