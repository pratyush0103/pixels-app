import { UppyFileWithMeta } from '@/types';
import { ImageCard } from './ImageCard';

interface MasonryGridProps {
    files: UppyFileWithMeta[];
    onRetry: (id: string) => void;
    onRemove: (id: string) => void;
}

export function MasonryGrid({ files, onRetry, onRemove }: MasonryGridProps) {
    if (files.length === 0) return null;

    return (
        <div className="mt-8 w-full">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Gallery ({files.length})
            </h2>

            {/* 
        Tailwind Columns for Masonry Effect 
        - columns-1 on mobile
        - columns-2 on tablet
        - columns-3 on desktop
        - gap-4 for spacing
      */}
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 space-y-4">
                {files.map((file) => (
                    <ImageCard
                        key={file.id}
                        file={file}
                        onRetry={onRetry}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </div>
    );
}
