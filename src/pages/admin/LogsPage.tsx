import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FileText, RefreshCw, Download, ChevronDown, Search, ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/adminApi';
import { useUIStore } from '../../store/useUIStore';

// ─── Constants ────────────────────────────────────────────────────────────────
const CHUNK_SIZE = 500;
/** Estimated height of a single mono log line (px). The virtualizer overrides this per-item once measured. */
const LINE_HEIGHT_EST = 18;
/** How many virtual items from the top trigger an "older" fetch. */
const LOAD_OLDER_THRESHOLD = 40;

// ─── Helpers ────────────────────────────────────────────────────────────────
const extractFileName = (path: string): string => path.split('/').pop() ?? path;

const getLogLevelClass = (line: string): string => {
    if (line.includes(' ERROR ')) return 'text-red-400';
    if (line.includes(' WARN ')) return 'text-amber-400';
    if (line.includes(' DEBUG ')) return 'text-blue-400';
    if (line.includes(' TRACE ')) return 'text-purple-400';
    return 'text-nr-text/80';
};

const highlightLine = (line: string, query: string): React.ReactNode => {
    if (!query.trim()) return line;
    const lowerLine = line.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let matchIndex = lowerLine.indexOf(lowerQuery, lastIndex);
    while (matchIndex !== -1) {
        if (matchIndex > lastIndex) parts.push(line.substring(lastIndex, matchIndex));
        parts.push(
            <span key={matchIndex} className="bg-nr-accent/40 text-nr-text rounded px-0.5">
                {line.substring(matchIndex, matchIndex + query.length)}
            </span>,
        );
        lastIndex = matchIndex + query.length;
        matchIndex = lowerLine.indexOf(lowerQuery, lastIndex);
    }
    if (lastIndex < line.length) parts.push(line.substring(lastIndex));
    return parts.length > 0 ? <>{parts}</> : line;
};

// ─── Component ────────────────────────────────────────────────────────────────
const LogsPage: React.FC = () => {
    const { t } = useTranslation();
    const { setError } = useUIStore();

    // ── State ────────────────────────────────────────────────────────────────
    const [logFiles, setLogFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [logLines, setLogLines] = useState<string[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [hasMoreOlder, setHasMoreOlder] = useState(false);
    const [oldestOffset, setOldestOffset] = useState(0);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedMatches, setHighlightedMatches] = useState<number[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
    const [autoScroll, setAutoScroll] = useState(true);

    // ── Refs ─────────────────────────────────────────────────────────────────
    const scrollRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    /**
     * When we prepend older lines, logLines grows from the front. We need to
     * keep the viewport anchored to the same logical line the user was looking at.
     * We store the count of lines prepended so that useLayoutEffect can call
     * scrollToIndex(prependCount + visibleStart) before the browser paints.
     */
    const prependCountRef = useRef(0);
    const firstVisibleRef = useRef(0);   // virtualizer startIndex before prepend

    /** Whether we should auto-scroll to the last line on the next render. */
    const pendingAutoScrollRef = useRef(false);

    /**
     * Blocks "load older" fetches until the virtualizer confirms the viewport
     * has scrolled away from the top (startIndex > LOAD_OLDER_THRESHOLD).
     * Set to true every time a fresh initial load begins; cleared by the range
     * effect only once the auto-scroll has visibly taken effect.
     */
    const blockOlderFetchRef = useRef(false);

    // ── Virtualizer ───────────────────────────────────────────────────────────
    const virtualizer = useVirtualizer({
        count: logLines.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => LINE_HEIGHT_EST,
        overscan: 20,
    });

    const scrollToBottom = useCallback(() => {
        if (logLines.length === 0) return;
        virtualizer.scrollToIndex(logLines.length - 1, { align: 'end' });
    }, [logLines.length, virtualizer]);

    // ── Scroll-to-index for search navigation ────────────────────────────────
    const scrollToMatch = useCallback((index: number) => {
        if (highlightedMatches.length === 0) return;
        const lineIdx = highlightedMatches[index];
        if (lineIdx !== undefined) {
            virtualizer.scrollToIndex(lineIdx, { align: 'center', behavior: 'smooth' });
        }
    }, [highlightedMatches, virtualizer]);

    // ── Load older when virtualizer reaches the top ───────────────────────────
    const range = virtualizer.range;
    useEffect(() => {
        if (!range) return;

        // While blockOlderFetchRef is true we are waiting for the auto-scroll
        // (triggered in useLayoutEffect below) to move the viewport to the
        // bottom of the initial chunk. Once startIndex rises above the
        // threshold we know the scroll succeeded and we can unblock.
        if (blockOlderFetchRef.current) {
            if (range.startIndex > LOAD_OLDER_THRESHOLD) {
                blockOlderFetchRef.current = false;
            }
            return;
        }

        if (range.startIndex < LOAD_OLDER_THRESHOLD && hasMoreOlder && !isLoadingOlder) {
            firstVisibleRef.current = range.startIndex;
            loadOlderChunk();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [range?.startIndex, hasMoreOlder, isLoadingOlder]);

    // ── Restore scroll position after prepend (before paint) ─────────────────
    useLayoutEffect(() => {
        if (prependCountRef.current > 0) {
            const targetIdx = prependCountRef.current + firstVisibleRef.current;
            virtualizer.scrollToIndex(targetIdx, { align: 'start' });
            prependCountRef.current = 0;
        }
    });

    // ── Auto-scroll to bottom after initial load / refresh ───────────────────
    useLayoutEffect(() => {
        if (pendingAutoScrollRef.current && logLines.length > 0) {
            pendingAutoScrollRef.current = false;
            scrollToBottom();
        }
    });

    // ─── File list ────────────────────────────────────────────────────────────
    const fetchLogFiles = useCallback(async () => {
        try {
            setIsLoadingList(true);
            const response = await adminApi.listLogFiles();
            setLogFiles(response.logFiles);
            if (response.logFiles.length > 0 && !selectedFile) {
                setSelectedFile(response.logFiles[0]);
            }
        } catch (err: unknown) {
            console.error('Failed to fetch log files:', err);
            setError(t('admin.logs.error_list'));
        } finally {
            setIsLoadingList(false);
        }
    }, [selectedFile, setError, t]);

    useEffect(() => {
        fetchLogFiles();
    }, [fetchLogFiles]);

    // ─── Initial load ─────────────────────────────────────────────────────────
    const loadInitialChunk = useCallback(async (fileName: string) => {
        try {
            setIsLoadingInitial(true);
            // Block older-chunk fetches until auto-scroll proves the viewport
            // has reached the bottom of this fresh batch.
            blockOlderFetchRef.current = true;
            const content = await adminApi.getLogFile(fileName, {
                offsetFromEnd: 0,
                limit: CHUNK_SIZE,
            });
            const lines = content ? content.split('\n') : [];
            setLogLines(lines);
            setSearchQuery('');
            setHighlightedMatches([]);
            setCurrentMatchIndex(-1);
            setHasMoreOlder(lines.length >= CHUNK_SIZE);
            setOldestOffset(CHUNK_SIZE);
            // Always scroll to bottom after a fresh load.
            pendingAutoScrollRef.current = true;
        } catch (err: unknown) {
            console.error('Failed to fetch log file:', err);
            setError(t('admin.logs.error_content'));
            setLogLines([]);
            setHasMoreOlder(false);
            blockOlderFetchRef.current = false;
        } finally {
            setIsLoadingInitial(false);
        }
    }, [setError, t]);

    useEffect(() => {
        if (selectedFile) {
            loadInitialChunk(selectedFile);
        }
    }, [selectedFile, loadInitialChunk]);

    // ─── Load older chunk ─────────────────────────────────────────────────────
    const loadOlderChunk = useCallback(async () => {
        if (!selectedFile || isLoadingOlder) return;
        try {
            setIsLoadingOlder(true);
            const content = await adminApi.getLogFile(selectedFile, {
                offsetFromEnd: oldestOffset,
                limit: CHUNK_SIZE,
            });
            const newLines = content ? content.split('\n') : [];
            if (newLines.length === 0) {
                setHasMoreOlder(false);
                return;
            }
            prependCountRef.current = newLines.length;
            setLogLines((prev) => [...newLines, ...prev]);
            setHasMoreOlder(newLines.length >= CHUNK_SIZE);
            setOldestOffset((prev) => prev + CHUNK_SIZE);
        } catch (err: unknown) {
            console.error('Failed to fetch older log chunk:', err);
            setError(t('admin.logs.error_content'));
        } finally {
            setIsLoadingOlder(false);
        }
    }, [selectedFile, isLoadingOlder, oldestOffset, setError, t]);

    // ─── Search ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!searchQuery.trim() || logLines.length === 0) {
            setHighlightedMatches([]);
            setCurrentMatchIndex(-1);
            return;
        }
        const query = searchQuery.toLowerCase();
        const matches: number[] = [];
        logLines.forEach((line, index) => {
            if (line.toLowerCase().includes(query)) matches.push(index);
        });
        setHighlightedMatches(matches);
        setCurrentMatchIndex(matches.length > 0 ? 0 : -1);
    }, [searchQuery, logLines]);

    // Scroll to first match whenever currentMatchIndex changes externally (e.g. search changes)
    useEffect(() => {
        if (currentMatchIndex >= 0) scrollToMatch(currentMatchIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMatchIndex]);

    const goToNextMatch = useCallback(() => {
        if (highlightedMatches.length === 0) return;
        setCurrentMatchIndex((prev) => (prev + 1) % highlightedMatches.length);
    }, [highlightedMatches.length]);

    const goToPreviousMatch = useCallback(() => {
        if (highlightedMatches.length === 0) return;
        setCurrentMatchIndex((prev) => (prev <= 0 ? highlightedMatches.length - 1 : prev - 1));
    }, [highlightedMatches.length]);

    // ─── Download full file ───────────────────────────────────────────────────
    const handleDownload = useCallback(async () => {
        if (!selectedFile) return;
        try {
            setIsDownloading(true);
            const fullContent = await adminApi.downloadLogFile(selectedFile);
            const blob = new Blob([fullContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = extractFileName(selectedFile);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: unknown) {
            console.error('Failed to download log file:', err);
            setError(t('admin.logs.error_download'));
        } finally {
            setIsDownloading(false);
        }
    }, [selectedFile, setError, t]);

    const handleRefresh = useCallback(() => {
        if (selectedFile) loadInitialChunk(selectedFile);
    }, [selectedFile, loadInitialChunk]);

    // ─── Dropdown outside click ───────────────────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ─── Derived ─────────────────────────────────────────────────────────────
    const isLoadingContent = isLoadingInitial;
    const virtualItems = virtualizer.getVirtualItems();
    const totalSize = virtualizer.getTotalSize();

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-serif font-bold text-nr-text flex items-center gap-3">
                    <FileText className="text-nr-accent" size={24} />
                    {t('admin.logs.title')}
                </h1>
                <p className="text-nr-text/60">{t('admin.logs.subtitle')}</p>
            </div>

            <div className="glass rounded-xl border border-nr-border/50 bg-white/5 dark:bg-black/20 backdrop-blur-md shadow-lg overflow-hidden">
                {/* ── Toolbar ────────────────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-3 p-3 border-b border-nr-border/30 bg-black/10">

                    {/* File selector */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            id="log-file-selector"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            disabled={isLoadingList}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-black/20 border border-nr-border/30 text-nr-text hover:bg-black/30 transition-colors min-w-[200px] justify-between cursor-pointer disabled:cursor-not-allowed"
                        >
                            <span className="truncate">
                                {isLoadingList
                                    ? t('admin.logs.loading_files')
                                    : selectedFile
                                        ? extractFileName(selectedFile)
                                        : t('admin.logs.no_files')}
                            </span>
                            <ChevronDown
                                size={14}
                                className={`flex-shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {isDropdownOpen && logFiles.length > 0 && (
                            <div className="absolute top-full left-0 mt-1 w-full min-w-[280px] max-h-60 overflow-y-auto rounded-lg border border-nr-border/50 bg-nr-bg/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-xl z-50">
                                {logFiles.map((file) => (
                                    <button
                                        key={file}
                                        onClick={() => { setSelectedFile(file); setIsDropdownOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors truncate cursor-pointer ${file === selectedFile
                                                ? 'bg-nr-accent/15 text-nr-accent'
                                                : 'text-nr-text/80 hover:bg-black/10 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        {extractFileName(file)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-[200px] max-w-md">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-nr-text/40" />
                            <input
                                id="log-search-input"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (e.shiftKey) goToPreviousMatch();
                                        else goToNextMatch();
                                    }
                                }}
                                placeholder={t('admin.logs.search_placeholder')}
                                className="w-full pl-8 pr-3 py-2 rounded-lg text-sm bg-black/20 border border-nr-border/30 text-nr-text placeholder:text-nr-text/30 focus:outline-none focus:border-nr-accent/50 transition-colors"
                            />
                        </div>
                        {highlightedMatches.length > 0 && (
                            <span className="text-xs text-nr-text/50 whitespace-nowrap">
                                {currentMatchIndex + 1}/{highlightedMatches.length}
                            </span>
                        )}
                        <button
                            onClick={goToPreviousMatch}
                            disabled={highlightedMatches.length === 0}
                            className="p-1.5 rounded text-nr-text/50 hover:text-nr-text hover:bg-black/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title={t('admin.logs.previous_match')}
                        >
                            <ArrowUp size={14} />
                        </button>
                        <button
                            onClick={goToNextMatch}
                            disabled={highlightedMatches.length === 0}
                            className="p-1.5 rounded text-nr-text/50 hover:text-nr-text hover:bg-black/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title={t('admin.logs.next_match')}
                        >
                            <ArrowDown size={14} />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 ml-auto">
                        <button
                            id="log-auto-scroll-toggle"
                            onClick={() => setAutoScroll((v) => !v)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${autoScroll
                                    ? 'bg-nr-accent/15 text-nr-accent border border-nr-accent/25'
                                    : 'bg-black/20 border border-nr-border/30 text-nr-text/60 hover:text-nr-text hover:bg-black/30'
                                }`}
                        >
                            <ArrowDown size={12} />
                            {t('admin.logs.auto_scroll')}
                        </button>

                        <button
                            id="log-refresh-button"
                            onClick={handleRefresh}
                            disabled={!selectedFile || isLoadingContent}
                            className="p-2 rounded-lg text-nr-text/60 hover:text-nr-text hover:bg-black/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title={t('admin.logs.refresh')}
                        >
                            <RefreshCw size={16} className={isLoadingContent ? 'animate-spin' : ''} />
                        </button>

                        <button
                            id="log-download-button"
                            onClick={handleDownload}
                            disabled={!selectedFile || isDownloading}
                            className="p-2 rounded-lg text-nr-text/60 hover:text-nr-text hover:bg-black/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title={t('admin.logs.download')}
                        >
                            {isDownloading
                                ? <Loader2 size={16} className="animate-spin" />
                                : <Download size={16} />}
                        </button>
                    </div>
                </div>

                {/* ── Log viewer ─────────────────────────────────────────── */}
                <div className="relative">
                    {/* Initial-load overlay */}
                    {isLoadingContent && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                            <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-nr-bg/90 border border-nr-border/50 shadow-lg">
                                <RefreshCw size={16} className="animate-spin text-nr-accent" />
                                <span className="text-sm text-nr-text/80">{t('admin.logs.loading_content')}</span>
                            </div>
                        </div>
                    )}

                    {!selectedFile && !isLoadingList ? (
                        <div className="flex flex-col items-center justify-center py-20 text-nr-text/40 gap-3">
                            <FileText size={40} className="opacity-40" />
                            <p className="text-sm font-medium">{t('admin.logs.no_files')}</p>
                        </div>
                    ) : (
                        /* ── Scroll container (virtualizer root) ─────────── */
                        <div
                            ref={scrollRef}
                            className="overflow-auto h-[600px] bg-neutral-950/80"
                            style={{ contain: 'strict' }}
                        >
                            {/* Header rows: pinned inside the scroll container so they
                                scroll away but are still part of the scrollable area */}
                            {isLoadingOlder && (
                                <div className="flex items-center justify-center gap-2 py-2 text-xs text-nr-text/50 sticky top-0 z-10 bg-neutral-950/90 backdrop-blur-sm">
                                    <Loader2 size={12} className="animate-spin text-nr-accent" />
                                    {t('admin.logs.loading_older')}
                                </div>
                            )}

                            {!hasMoreOlder && logLines.length > 0 && !isLoadingInitial && (
                                <div className="flex items-center justify-center gap-2 py-1.5 text-xs text-nr-text/30 border-b border-white/5">
                                    {t('admin.logs.beginning_of_file')}
                                </div>
                            )}

                            {/* Virtual canvas: fixed height = total virtual size */}
                            <div
                                className="relative w-full font-mono text-xs leading-relaxed"
                                style={{ height: totalSize }}
                            >
                                {virtualItems.map((item) => {
                                    const line = logLines[item.index];
                                    const isMatchLine = highlightedMatches.includes(item.index);
                                    const isCurrentMatch = highlightedMatches[currentMatchIndex] === item.index;
                                    const levelClass = getLogLevelClass(line);

                                    return (
                                        <div
                                            key={item.key}
                                            data-index={item.index}
                                            ref={virtualizer.measureElement}
                                            className={`log-line absolute top-0 left-0 w-full flex hover:bg-white/5 transition-colors duration-75 ${isCurrentMatch
                                                    ? 'bg-nr-accent/20 border-l-2 border-nr-accent'
                                                    : isMatchLine
                                                        ? 'bg-nr-accent/10'
                                                        : ''
                                                }`}
                                            style={{ transform: `translateY(${item.start}px)` }}
                                        >
                                            {/* Line number gutter */}
                                            <span className="select-none text-nr-text/20 text-right pr-3 pl-3 py-px min-w-[3.5rem] border-r border-white/5 flex-shrink-0">
                                                {item.index + 1}
                                            </span>
                                            {/* Line content */}
                                            <span className={`pl-3 pr-4 py-px whitespace-pre ${levelClass}`}>
                                                {searchQuery.trim()
                                                    ? highlightLine(line, searchQuery)
                                                    : line || '\u00A0'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Status bar ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-3 py-1.5 border-t border-nr-border/30 bg-black/10 text-xs text-nr-text/40">
                    <span>
                        {logLines.length > 0 ? t('admin.logs.line_count', { count: logLines.length }) : ''}
                        {hasMoreOlder && logLines.length > 0 ? ` ${t('admin.logs.more_above')}` : ''}
                    </span>
                    <span>{selectedFile ? extractFileName(selectedFile) : ''}</span>
                </div>
            </div>
        </div>
    );
};

export default LogsPage;
