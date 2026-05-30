import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X, Loader2, FileText, ChevronRight } from 'lucide-react';
import { kbApi } from '../../api/kbApi';
import type { KbSearchResultDto } from '../../api/kbApi';

const HeaderSearchBar: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<KbSearchResultDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const currentLang = i18n.language || 'en';

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            navigate(`/kb?search=${encodeURIComponent(query.trim())}`);
            setQuery('');
            setIsOpen(false);
            setIsFocused(false);
        }
    };

    const handleSelectResult = (slug: string) => {
        setIsOpen(false);
        setQuery('');
        navigate(`/kb/article/${slug}`);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative flex items-center">
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    setIsFocused(true);
                    if (query.trim().length >= 2) {
                        setIsOpen(true);
                    }
                }}
                onBlur={() => {
                    setTimeout(() => setIsFocused(false), 200);
                }}
                placeholder={t('kb.search_placeholder')}
                className={`
                    h-9 pl-9 pr-8 rounded-lg bg-nr-surface/40 border border-nr-border text-xs text-nr-text placeholder-nr-text/30 focus:outline-none focus:ring-1 focus:ring-nr-accent/40 focus:border-nr-accent transition-all duration-300 glass
                    ${isFocused || query ? 'w-56 bg-nr-surface/60' : 'w-32'}
                `}
            />
            <div className="absolute left-3 text-nr-text/30 pointer-events-none">
                {loading ? (
                    <Loader2 size={14} className="animate-spin text-nr-accent" />
                ) : (
                    <Search size={14} />
                )}
            </div>
            {query && (
                <button
                    onClick={handleClear}
                    className="absolute right-2 text-nr-text/30 hover:text-nr-text transition-colors p-1 cursor-pointer"
                    type="button"
                >
                    <X size={12} />
                </button>
            )}

            {/* Dropdown Suggestions */}
            {isOpen && query.trim().length >= 2 && (
                <div className="absolute top-full right-0 w-80 mt-2 glass-card rounded-xl border border-nr-border shadow-lg max-h-[300px] overflow-y-auto animate-fade-in divide-y divide-nr-border/10 z-50">
                    {results.length > 0 ? (
                        results.map((result, index) => {
                            const article = result.article;
                            if (!article) return null;
                            const title = article.title?.[currentLang] || article.title?.['en'] || article.title?.['uk'] || '';

                            return (
                                <button
                                    key={article.id || index}
                                    onClick={() => handleSelectResult(article.slug || '')}
                                    className="w-full text-left p-3 hover:bg-nr-accent/5 transition-colors flex items-start gap-2.5 cursor-pointer"
                                >
                                    <div className="p-1 bg-nr-border/15 text-nr-text/50 rounded shrink-0">
                                        <FileText size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                        <div className="font-medium text-xs text-nr-text hover:text-nr-accent transition-colors truncate">
                                            {title}
                                        </div>

                                        {/* Breadcrumbs trail in result */}
                                        {result.breadcrumbs && result.breadcrumbs.length > 0 && (
                                            <div className="flex items-center flex-wrap gap-0.5 text-[9px] text-nr-text/40 uppercase tracking-wider font-semibold">
                                                {result.breadcrumbs.map((folder, idx) => {
                                                    const fName = folder.name?.[currentLang] || folder.name?.['en'] || folder.name?.['uk'] || '';
                                                    return (
                                                        <React.Fragment key={folder.id || idx}>
                                                            <span>{fName}</span>
                                                            {idx < (result.breadcrumbs?.length || 0) - 1 && (
                                                                <ChevronRight size={8} className="text-nr-text/20" />
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
                        <div className="p-4 text-center text-xs text-nr-text/40">
                            {t('kb.search_no_results')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HeaderSearchBar;
