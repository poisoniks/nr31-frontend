import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
    currentPage: number; // 0-indexed
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const { t } = useTranslation();

    if (totalPages <= 0) return null;

    const generatePages = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            const leftOffset = Math.max(0, Math.min(currentPage - 2, totalPages - maxPagesToShow));
            const rightOffset = Math.min(totalPages - 1, leftOffset + maxPagesToShow - 1);

            if (leftOffset > 0) {
                pages.push(0);
                if (leftOffset > 1) {
                    pages.push('...');
                }
            }

            for (let i = leftOffset; i <= rightOffset; i++) {
                pages.push(i);
            }

            if (rightOffset < totalPages - 1) {
                if (rightOffset < totalPages - 2) {
                    pages.push('...');
                }
                pages.push(totalPages - 1);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-nr-bg/30 border-t border-nr-border/30 rounded-b-lg">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-nr-text/60">
                        {t('common.pagination.showing_page', { current: currentPage + 1, total: totalPages })}
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-nr-text/60 ring-1 ring-inset ring-nr-border/50 hover:bg-nr-border/20 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <span className="sr-only">{t('common.pagination.prev')}</span>
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </button>

                        {generatePages().map((page, index) => {
                            if (page === '...') {
                                return (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-nr-text/70 ring-1 ring-inset ring-nr-border/50 focus:outline-offset-0"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </span>
                                );
                            }
                            
                            const pageNumber = page as number;
                            const isCurrent = pageNumber === currentPage;

                            return (
                                <button
                                    key={`page-${pageNumber}`}
                                    onClick={() => onPageChange(pageNumber)}
                                    aria-current={isCurrent ? 'page' : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors focus:z-20 focus:outline-offset-0 ${
                                        isCurrent
                                            ? 'z-10 bg-nr-accent text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nr-accent'
                                            : 'text-nr-text/80 ring-1 ring-inset ring-nr-border/50 hover:bg-nr-border/20'
                                    }`}
                                >
                                    {pageNumber + 1}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages - 1}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-nr-text/60 ring-1 ring-inset ring-nr-border/50 hover:bg-nr-border/20 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <span className="sr-only">{t('common.pagination.next')}</span>
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
            
            {/* Mobile simplified view */}
            <div className="flex flex-1 justify-between sm:hidden items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                >
                    {t('common.pagination.prev')}
                </Button>
                <div className="flex items-center text-sm text-nr-text/60">
                    {currentPage + 1} / {totalPages}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                >
                    {t('common.pagination.next')}
                </Button>
            </div>
        </div>
    );
};

export default Pagination;
