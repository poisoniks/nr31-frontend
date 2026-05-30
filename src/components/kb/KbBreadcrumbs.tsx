import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { KbFolderDto } from '../../api/kbApi';

interface KbBreadcrumbsProps {
    breadcrumbs?: KbFolderDto[];
    currentTitle?: string;
}

const KbBreadcrumbs: React.FC<KbBreadcrumbsProps> = ({ breadcrumbs = [], currentTitle }) => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || 'en';

    return (
        <nav className="flex items-center flex-wrap gap-2 text-sm text-nr-text/60" aria-label="Breadcrumb">
            <Link
                to="/kb"
                className="flex items-center gap-1.5 hover:text-nr-accent transition-colors"
            >
                <Home size={14} />
                <span>{t('kb.breadcrumb_home')}</span>
            </Link>

            {breadcrumbs.map((folder, index) => {
                const name = folder.name?.[currentLang] || folder.name?.['en'] || folder.name?.['uk'] || '';
                return (
                    <React.Fragment key={folder.id || index}>
                        <ChevronRight size={14} className="text-nr-text/30 shrink-0" />
                        <Link
                            to={`/kb?folder=${folder.slug}`}
                            className="hover:text-nr-accent transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                        >
                            {name}
                        </Link>
                    </React.Fragment>
                );
            })}

            {currentTitle && (
                <>
                    <ChevronRight size={14} className="text-nr-text/30 shrink-0" />
                    <span className="text-nr-text font-medium truncate max-w-[180px] sm:max-w-[300px]" aria-current="page">
                        {currentTitle}
                    </span>
                </>
            )}
        </nav>
    );
};

export default KbBreadcrumbs;
