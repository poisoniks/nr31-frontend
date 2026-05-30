import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { kbApi } from '../../api/kbApi';
import type { KbSearchResultDto } from '../../api/kbApi';

const KbSearchBar: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlQuery = searchParams.get('search') || '';
    const currentLang = i18n.language || 'en';
    const [query, setQuery] = useState(urlQuery);
    const [results, setResults] = useState<KbSearchResultDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync query state if URL search query changes (e.g. searching from header when already on the KB explorer)
    useEffect(() => {
        if (urlQuery !== query) {
            setQuery(urlQuery);
            if (urlQuery) {
                setIsOpen(true);
            }
        }
    }, [urlQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const searchResults = await kbApi.searchArticles(query);
                setResults(searchResults);
                setIsOpen(true);
            } catch (error) {
                console.error('KB Search Error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete('search');
            return next;
        }, { replace: true });
    };

    const handleSelectResult = (slug: string) => {
        setIsOpen(false);
        setQuery('');
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete('search');
            return next;
        }, { replace: true });
        navigate(`/kb/article/${slug}`);
    };

    return (
        <div ref={dropdownRef} className="relative w-full max-w-2xl mx-auto z-30">
            {/* Input Wrapper */}
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    placeholder={t('kb.search_placeholder')}
                    className="w-full h-12 pl-12 pr-10 rounded-xl bg-nr-surface/60 border border-nr-border text-nr-text placeholder-nr-text/40 focus:outline-none focus:ring-2 focus:ring-nr-accent/40 focus:border-nr-accent transition-all glass"
                />

                <div className="absolute left-4 text-nr-text/40">
                    {loading ? (
                        <Loader2 size={18} className="animate-spin text-nr-accent" />
                    ) : (
                        <Search size={18} />
                    )}
                </div>

                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-4 text-nr-text/40 hover:text-nr-text transition-colors p-1"
                        type="button"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Dropdown Suggestions */}
            {isOpen && query.trim().length >= 2 && (
                <div className="absolute top-full left-0 w-full mt-2 glass-card rounded-xl border border-nr-border shadow-lg max-h-[360px] overflow-y-auto animate-fade-in divide-y divide-nr-border/10">
                    {results.length > 0 ? (
                        results.map((result, index) => {
                            const article = result.article;
                            if (!article) return null;
                            const title = article.title?.[currentLang] || article.title?.['en'] || article.title?.['uk'] || '';

                            return (
                                <button
                                    key={article.id || index}
                                    onClick={() => handleSelectResult(article.slug || '')}
                                    className="w-full text-left p-4 hover:bg-nr-accent/5 transition-colors flex items-start gap-3 cursor-pointer"
                                >
                                    <div className="p-1.5 bg-nr-border/15 text-nr-text/50 rounded shrink-0">
                                        <FileText size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                        <div className="font-medium text-nr-text group-hover:text-nr-accent transition-colors truncate">
                                            {title}
                                        </div>

                                        {/* Breadcrumbs trail in result */}
                                        {result.breadcrumbs && result.breadcrumbs.length > 0 && (
                                            <div className="flex items-center flex-wrap gap-1 text-[10px] text-nr-text/40 mt-1 uppercase tracking-wider font-semibold">
                                                {result.breadcrumbs.map((folder, idx) => {
                                                    const fName = folder.name?.[currentLang] || folder.name?.['en'] || folder.name?.['uk'] || '';
                                                    return (
                                                        <React.Fragment key={folder.id || idx}>
                                                            <span>{fName}</span>
                                                            {idx < (result.breadcrumbs?.length || 0) - 1 && (
                                                                <ChevronRight size={10} className="text-nr-text/20" />
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-4 text-center text-sm text-nr-text/40 flex items-center justify-center">
                            {t('kb.search_no_results')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default KbSearchBar;
