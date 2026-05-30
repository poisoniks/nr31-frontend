import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { kbApi } from '../../api/kbApi';
import type { KbFolderDto } from '../../api/kbApi';

interface KbFolderTreeProps {
    activeSlug?: string;
}

interface TreeNodeProps {
    folder: KbFolderDto;
    activeSlug?: string;
    level: number;
    hasAdmin: boolean;
}

const KbTreeNode: React.FC<TreeNodeProps> = ({
    folder,
    activeSlug,
    level,
    hasAdmin
}) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language || 'en';
    const [isExpanded, setIsExpanded] = useState(false);
    const [subFolders, setSubFolders] = useState<KbFolderDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const folderName = folder.name?.[currentLang] || folder.name?.['en'] || folder.name?.['uk'] || '';
    const isActive = activeSlug === folder.slug;

    const handleExpandToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const nextState = !isExpanded;
        setIsExpanded(nextState);

        if (nextState && !loaded && folder.slug) {
            setLoading(true);
            try {
                const detail = await kbApi.getFolderBySlug(folder.slug);
                if (detail.subFolders) {
                    setSubFolders(detail.subFolders);
                }
                setLoaded(true);
            } catch (err) {
                console.error('Failed to load subfolders:', err);
                setIsExpanded(false);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col">
            {/* Folder Row */}
            <div
                className={`
                    group flex items-center justify-between py-1.5 px-2 rounded-lg transition-all duration-150 relative
                    ${isActive
                        ? 'bg-nr-accent/10 text-nr-accent border-l-2 border-nr-accent'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-nr-text/80'
                    }
                `}
                style={{ paddingLeft: `${Math.max(8, level * 16)}px` }}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Expand/Collapse Chevron */}
                    <button
                        onClick={handleExpandToggle}
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-nr-text/40 hover:text-nr-text/75 transition-colors shrink-0 cursor-pointer"
                    >
                        {loading ? (
                            <div className="w-3.5 h-3.5 border-2 border-nr-accent/35 border-t-nr-accent rounded-full animate-spin"></div>
                        ) : isExpanded ? (
                            <ChevronDown size={14} />
                        ) : (
                            <ChevronRight size={14} />
                        )}
                    </button>

                    {/* Clickable Folder Icon and Name wrapper */}
                    <Link
                        to={`/kb?folder=${folder.slug}`}
                        className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer hover:text-nr-accent transition-colors group/link"
                    >
                        {/* Folder Icon */}
                        <span className={isActive ? 'text-nr-accent' : 'text-nr-text/50 group-hover/link:text-nr-accent transition-colors shrink-0'}>
                            {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
                        </span>

                        {/* Folder Name */}
                        <span className="text-sm font-medium truncate py-0.5">
                            {folderName}
                        </span>
                    </Link>

                    {/* Restricted icon */}
                    {folder.restricted && (
                        <Lock size={12} className="text-amber-500/80 shrink-0 ml-1" />
                    )}
                </div>
            </div>

            {/* Render children recursively */}
            {isExpanded && subFolders.length > 0 && (
                <div className="flex flex-col mt-0.5">
                    {subFolders.map((subFolder) => (
                        <KbTreeNode
                            key={subFolder.id}
                            folder={subFolder}
                            activeSlug={activeSlug}
                            level={level + 1}
                            hasAdmin={hasAdmin}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const KbFolderTree: React.FC<KbFolderTreeProps> = ({ activeSlug }) => {
    const { t } = useTranslation();
    const user = useAuthStore(state => state.user);
    const hasAdmin = user?.authorities?.includes('kb:admin') ?? false;

    const [rootFolders, setRootFolders] = useState<KbFolderDto[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRootFolders = async () => {
        try {
            const data = await kbApi.getRootFolders();
            setRootFolders(data);
        } catch (err) {
            console.error('Failed to load root folders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRootFolders();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-7 w-full bg-nr-border/10 rounded animate-pulse"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 w-full">
            {rootFolders.length > 0 ? (
                rootFolders.map((folder) => (
                    <KbTreeNode
                        key={folder.id}
                        folder={folder}
                        activeSlug={activeSlug}
                        level={0}
                        hasAdmin={hasAdmin}
                    />
                ))
            ) : (
                <div className="text-xs text-nr-text/45 p-2 italic text-center">
                    {t('kb.search_no_results')}
                </div>
            )}
        </div>
    );
};

export default KbFolderTree;
