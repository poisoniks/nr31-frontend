import React from 'react';

export const KbExplorerSkeleton: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 w-full animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
                {/* Sidebar Folder Tree Skeleton */}
                <div className="w-full md:w-64 shrink-0 glass-card p-4 rounded-xl flex flex-col gap-3">
                    <div className="h-6 w-32 bg-nr-border/20 rounded-md animate-pulse"></div>
                    <div className="h-px bg-nr-border/10"></div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-8 bg-nr-border/10 rounded-md animate-pulse"
                            style={{ width: `${Math.max(60, 100 - i * 10)}%` }}
                        ></div>
                    ))}
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Search Bar Skeleton */}
                    <div className="h-12 w-full glass rounded-xl animate-pulse bg-nr-border/10"></div>

                    {/* Folder Grid Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-28 glass-card p-4 rounded-xl flex flex-col gap-3 animate-pulse">
                                <div className="h-6 w-8 bg-nr-border/20 rounded-full"></div>
                                <div className="h-5 w-2/3 bg-nr-border/20 rounded-md"></div>
                            </div>
                        ))}
                    </div>

                    {/* Articles List Table Skeleton */}
                    <div className="glass-card rounded-xl overflow-hidden flex flex-col mt-4">
                        <div className="p-4 border-b border-nr-border/20 bg-nr-bg/30 h-12 flex items-center justify-between">
                            <div className="h-5 w-32 bg-nr-border/20 rounded-md animate-pulse"></div>
                            <div className="h-5 w-24 bg-nr-border/20 rounded-md animate-pulse"></div>
                        </div>
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
