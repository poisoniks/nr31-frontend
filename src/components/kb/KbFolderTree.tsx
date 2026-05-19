import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Lock, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { kbApi } from '../../api/kbApi';
import type { KbFolderDto } from '../../api/kbApi';
import CreateFolderModal from './CreateFolderModal';

interface KbFolderTreeProps {
    activeSlug?: string;
    onFolderDeleted?: () => void;
}

interface TreeNodeProps {
    folder: KbFolderDto;
    activeSlug?: string;
    level: number;
    hasAdmin: boolean;
    onEdit: (folder: KbFolderDto) => void;
    onDelete: (folder: KbFolderDto) => void;
}

const KbTreeNode: React.FC<TreeNodeProps> = ({
    folder,
    activeSlug,
    level,
    hasAdmin,
    onEdit,
    onDelete
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
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-nr-text/40 hover:text-nr-text/75 transition-colors shrink-0"
                    >
                        {loading ? (
                            <div className="w-3.5 h-3.5 border-2 border-nr-accent/35 border-t-nr-accent rounded-full animate-spin"></div>
                        ) : isExpanded ? (
                            <ChevronDown size={14} />
                        ) : (
                            <ChevronRight size={14} />
                        )}
                    </button>

                    {/* Folder Icon */}
                    <span className={isActive ? 'text-nr-accent' : 'text-nr-text/50 group-hover:text-nr-text/70'}>
                        {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
                    </span>

                    {/* Folder Name */}
                    <Link
                        to={`/kb?folder=${folder.slug}`}
                        className="text-sm font-medium truncate py-0.5 hover:text-nr-accent transition-colors flex-1"
                    >
                        {folderName}
                    </Link>

                    {/* Restricted icon */}
                    {folder.restricted && (
                        <Lock size={12} className="text-amber-500/80 shrink-0 ml-1" />
                    )}
                </div>

                {/* Admin Actions on Node hover */}
                {hasAdmin && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 ml-1 bg-nr-bg/85 dark:bg-nr-surface/85 backdrop-blur px-1.5 py-0.5 rounded shadow-sm border border-nr-border/10">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEdit(folder);
                            }}
                            className="p-1 text-nr-text/50 hover:text-nr-accent rounded transition-colors"
                            title="Edit"
                        >
                            <Edit2 size={12} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete(folder);
                            }}
                            className="p-1 text-nr-text/50 hover:text-red-500 rounded transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                )}
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
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const KbFolderTree: React.FC<KbFolderTreeProps> = ({ activeSlug, onFolderDeleted }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const { setError: setGlobalError } = useUIStore();
    const hasAdmin = user?.authorities?.includes('kb:admin') ?? false;

    const [rootFolders, setRootFolders] = useState<KbFolderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [folderToEdit, setFolderToEdit] = useState<KbFolderDto | null>(null);

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

    const handleEditClick = (folder: KbFolderDto) => {
        setFolderToEdit(folder);
        setEditModalOpen(true);
    };

    const handleDeleteClick = async (folder: KbFolderDto) => {
        if (!folder.id) return;

        const confirmDelete = window.confirm(t('kb.delete_folder_confirm'));
        if (!confirmDelete) return;

        try {
            await kbApi.deleteFolder(folder.id);
            await fetchRootFolders();
            if (activeSlug === folder.slug) {
                navigate('/kb');
            }
            if (onFolderDeleted) {
                onFolderDeleted();
            }
        } catch (err) {
            console.error('Failed to delete folder:', err);
            setGlobalError(t('kb.error.delete'));
        }
    };

    const handleEditSuccess = () => {
        fetchRootFolders();
    };

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
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                    />
                ))
            ) : (
                <div className="text-xs text-nr-text/45 p-2 italic text-center">
                    {t('kb.search_no_results')}
                </div>
            )}

            {/* CreateFolderModal reused as edit folder modal */}
            {folderToEdit && (
                <CreateFolderModal
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setFolderToEdit(null);
                    }}
                    onSuccess={handleEditSuccess}
                    folderToEdit={folderToEdit}
                />
            )}
        </div>
    );
};

export default KbFolderTree;
