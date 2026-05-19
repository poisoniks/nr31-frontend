import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, User, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { KbArticleSummaryDto } from '../../api/kbApi';
import { DateFormatter } from '../../utils/dateFormatter';

interface KbArticleRowProps {
    article: KbArticleSummaryDto;
}

const KbArticleRow: React.FC<KbArticleRowProps> = ({ article }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language || 'en';
    const articleTitle = article.title?.[currentLang] || article.title?.['en'] || article.title?.['uk'] || '';
    const dateToFormat = article.updatedAt || article.createdAt || '';

    return (
        <Link
            to={`/kb/article/${article.slug}`}
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-nr-accent/5 transition-colors border-b border-nr-border/10 last:border-0"
        >
            <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 bg-nr-border/10 text-nr-text/60 rounded group-hover:bg-nr-accent/10 group-hover:text-nr-accent transition-colors shrink-0 mt-0.5 sm:mt-0">
                    <FileText size={18} className="stroke-[1.5]" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <h4 className="font-medium text-nr-text group-hover:text-nr-accent transition-colors truncate">
                        {articleTitle}
                    </h4>
                    {article.authorName && (
                        <div className="flex items-center gap-1 text-xs text-nr-text/50">
                            <User size={12} />
                            <span>{article.authorName}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {dateToFormat && (
                <div className="flex items-center gap-1.5 text-xs text-nr-text/45 mt-2 sm:mt-0 shrink-0 self-end sm:self-center">
                    <Calendar size={12} />
                    <span>{DateFormatter.formatDate(dateToFormat, currentLang)}</span>
                </div>
            )}
        </Link>
    );
};

export default KbArticleRow;
