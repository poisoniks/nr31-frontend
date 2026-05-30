import React from 'react';

export const KbExplorerSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col gap-6 animate-fade-in w-full">
            {/* Folder Header Banner Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 glass-card rounded-xl border border-nr-border/30 bg-nr-bg/30 animate-pulse">
                <div className="h-8 w-48 bg-nr-border/20 rounded-md"></div>
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-24 bg-nr-border/10 rounded-md"></div>
                    <div className="h-8 w-24 bg-nr-border/10 rounded-md"></div>
                </div>
            </div>

            {/* Articles List Table Skeleton */}
            <div className="glass-card rounded-xl overflow-hidden flex flex-col border border-nr-border/20">
                <div className="divide-y divide-nr-border/10">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                            <div className="flex flex-col gap-2 w-1/2">
                                <div className="h-5 bg-nr-border/20 rounded-md w-full"></div>
                                <div className="h-4 bg-nr-border/10 rounded-md w-1/3"></div>
                            </div>
                            <div className="h-4 bg-nr-border/20 rounded-md w-24"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const KbArticleSkeleton: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 w-full animate-fade-in">
            <div className="flex flex-col gap-6">
                {/* Breadcrumbs Skeleton */}
                <div className="h-5 w-64 bg-nr-border/15 rounded-md animate-pulse"></div>

                {/* Title Skeleton */}
                <div className="h-12 w-3/4 bg-nr-border/20 rounded-lg animate-pulse mt-2"></div>

                {/* Metadata Row Skeleton */}
                <div className="flex items-center gap-4 py-2 border-y border-nr-border/10">
                    <div className="h-8 w-8 bg-nr-border/20 rounded-full animate-pulse"></div>
                    <div className="h-5 w-32 bg-nr-border/15 rounded-md animate-pulse"></div>
                    <div className="h-5 w-24 bg-nr-border/10 rounded-md animate-pulse ml-auto"></div>
                </div>

                {/* Content Block Skeletons */}
                <div className="flex flex-col gap-4 mt-4">
                    <div className="h-5 bg-nr-border/15 rounded-md w-full animate-pulse"></div>
                    <div className="h-5 bg-nr-border/15 rounded-md w-11/12 animate-pulse"></div>
                    <div className="h-5 bg-nr-border/15 rounded-md w-4/5 animate-pulse"></div>
                    <div className="h-5 bg-nr-border/15 rounded-md w-full animate-pulse mt-2"></div>
                    <div className="h-5 bg-nr-border/15 rounded-md w-5/6 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};
