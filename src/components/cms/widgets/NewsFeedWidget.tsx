import React from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper } from 'lucide-react';


export const NewsFeedWidget: React.FC<{ widget: any; isEditMode: boolean }> = ({ widget }) => {
    const { i18n } = useTranslation();
    const lang = i18n.language.split('-')[0];
    const data = widget as any;

    const sectionTitle = data.sectionTitle?.[lang] || data.sectionTitle?.['en'] || 'Latest News';

    return (
        <div className="glass-card border border-nr-border/50 rounded-xl p-6 pointer-events-auto">
            <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-3 text-nr-text">
                <Newspaper className="text-nr-accent" />
                {sectionTitle}
            </h2>
            
            <div className="space-y-4">
                {/* Skeleton placeholders for news items */}
                {Array.from({ length: data.itemCount || 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-nr-border/30 animate-pulse">
                        <div className="w-24 h-24 rounded-lg bg-nr-text/10 shrink-0" />
                        <div className="flex-1 space-y-3">
                            <div className="h-5 bg-nr-text/10 rounded w-3/4" />
                            <div className="h-4 bg-nr-text/10 rounded w-full" />
                            <div className="h-4 bg-nr-text/10 rounded w-5/6" />
                        </div>
                    </div>
                ))}
            </div>
            
            <p className="text-center text-nr-text/50 text-sm mt-6">
                News API integration pending
            </p>
        </div>
    );
};
