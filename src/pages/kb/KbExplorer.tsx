import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FolderPlus, FilePlus, Edit, Trash, Lock, Menu, X, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { kbApi } from '../../api/kbApi';
import type { KbFolderDetailDto } from '../../api/kbApi';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import KbFolderTree from '../../components/kb/KbFolderTree';
import KbSearchBar from '../../components/kb/KbSearchBar';
import KbArticleRow from '../../components/kb/KbArticleRow';
import { KbExplorerSkeleton } from '../../components/kb/KbSkeletons';
import CreateFolderModal from '../../components/kb/CreateFolderModal';

const KbExplorer: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentLang = i18n.language || 'en';

    // Retrieve active folder from query param ?folder=slug
    const folderSlug = searchParams.get('folder') || '';

    const user = useAuthStore((state) => state.user);
    const { setError: setGlobalError } = useUIStore();
    const hasAdmin = user?.authorities?.includes('kb:admin') ?? false;
    const hasWrite = user?.authorities?.includes('kb:write') ?? false;
    const canWrite = hasWrite || hasAdmin;

    // Sidebar Folder Tree state (Mobile toggle)
    const [mobileTreeOpen, setMobileTreeOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // States for folder data
    const [folderDetail, setFolderDetail] = useState<KbFolderDetailDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Folder modals state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [modalParentId, setModalParentId] = useState<number | undefined>(undefined);

    // Pagination for articles inside folder
    const { page, size, totalPages, setTotalPages, handlePageChange, resetPage } = usePagination(10);

    const fetchFolderDetail = useCallback(async (slugStr: string, currentPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const detail = await kbApi.getFolderBySlug(slugStr, currentPage, size);
            setFolderDetail(detail);
            if (detail.articles) {
                setTotalPages(detail.articles.totalPages || 0);
            }
        } catch (err: any) {
            console.error('Failed to load folder detail', err);
            setError(t('kb.error.load'));
            setFolderDetail(null);
        } finally {
            setLoading(false);
        }
    }, [size, setTotalPages, t]);

    const lastFolderSlugRef = React.useRef(folderSlug);

    // Combined load effect
    useEffect(() => {
        setMobileTreeOpen(false);
        setError(null);
        if (!folderSlug) {
            setFolderDetail(null);
            setLoading(false);
            lastFolderSlugRef.current = '';
        } else {
            const hasFolderChanged = lastFolderSlugRef.current !== folderSlug;
            lastFolderSlugRef.current = folderSlug;

            if (hasFolderChanged && page !== 0) {
                // Changing folder and page is not 0: just reset page.
                // The page state change will trigger this effect again, which will fetch page 0.
                resetPage();
            } else {
                // Either page is already 0, or we are navigating within the same folder (pagination click)
                fetchFolderDetail(folderSlug, page);
            }
        }
    }, [folderSlug, page, fetchFolderDetail, resetPage]);

    const handleNewFolderClick = (parentId?: number) => {
        setModalParentId(parentId);
        setCreateModalOpen(true);
    };

    const handleCreateSuccess = () => {
        setRefreshKey(prev => prev + 1);
        if (folderSlug) {
            fetchFolderDetail(folderSlug, page);
        }
    };

    const handleDeleteFolder = async () => {
        if (!folderDetail || !folderDetail.id) return;
        const confirmDelete = window.confirm(t('kb.delete_folder_confirm'));
        if (!confirmDelete) return;

        try {
            await kbApi.deleteFolder(folderDetail.id);
            setRefreshKey(prev => prev + 1);
            navigate('/kb');
        } catch (err) {
            console.error('Failed to delete folder', err);
            setGlobalError(t('kb.error.delete'));
        }
    };

    const folderName = folderDetail
        ? folderDetail.name?.[currentLang] || folderDetail.name?.['en'] || folderDetail.name?.['uk'] || ''
        : '';

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 mt-16 w-full animate-fade-in relative">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Desktop Folder Tree Sidebar */}
                <aside className="hidden md:block w-64 shrink-0 glass-card p-5 rounded-xl h-fit sticky top-24 max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-nr-border/15">
                        <span className="font-serif font-bold text-lg text-nr-text">{t('kb.title')}</span>
                        {hasAdmin && (
                            <button
                                onClick={() => handleNewFolderClick(undefined)}
                                className="p-1 text-nr-text/60 hover:text-nr-accent rounded transition-colors"
                                title={t('kb.new_folder')}
                            >
                                <FolderPlus size={18} />
                            </button>
                        )}
                    </div>
                    <KbFolderTree activeSlug={folderSlug} key={refreshKey} />
                </aside>

                {/* Mobile folder tree overlay drawer */}
                {mobileTreeOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileTreeOpen(false)} />
                        <div className="relative w-80 max-w-[85vw] bg-nr-bg border-r border-nr-border p-6 flex flex-col gap-4 animate-slide-in-right h-full overflow-y-auto z-10">
                            <div className="flex items-center justify-between pb-3 border-b border-nr-border/15">
                                <span className="font-serif font-bold text-xl text-nr-text">{t('kb.title')}</span>
                                <button onClick={() => setMobileTreeOpen(false)} className="text-nr-text/60 hover:text-nr-text">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1">
                                <KbFolderTree activeSlug={folderSlug} key={refreshKey} />
                            </div>
                            {hasAdmin && (
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setMobileTreeOpen(false);
                                        handleNewFolderClick(undefined);
                                    }}
                                    className="w-full justify-center flex items-center gap-2 mt-4"
                                >
                                    <FolderPlus size={16} />
                                    <span>{t('kb.new_folder')}</span>
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    {/* Top Row with Mobile Menu Button and Search */}
                    <div className="flex items-center gap-3 w-full">
                        <button
                            onClick={() => setMobileTreeOpen(true)}
                            className="md:hidden p-3 bg-nr-surface/50 border border-nr-border rounded-xl text-nr-text/75 hover:text-nr-text hover:bg-nr-surface transition-colors"
                            aria-label={t('kb.folder.toggle_tree')}
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex-1">
                            <KbSearchBar />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <KbExplorerSkeleton />
                    ) : folderSlug && folderDetail ? (
                        /* Specific Selected Folder Detail View */
                        <div className="flex flex-col gap-6 animate-fade-in">
                            {/* Folder Header Banner */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 glass-card rounded-xl border border-nr-border/30">
                                <div className="flex flex-col gap-1 min-w-0">
                                    <h1 className="font-serif text-3xl font-bold text-nr-text flex items-center gap-2.5 truncate">
                                        {folderName}
                                        {folderDetail.restricted && (
                                            <Lock size={18} className="text-amber-500 shrink-0" />
                                        )}
                                    </h1>
                                </div>

                                {/* Folder Management Control Buttons for Admins / Authors */}
                                <div className="flex items-center flex-wrap gap-2.5">
                                    {hasAdmin && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleNewFolderClick(folderDetail.id)}
                                                className="flex items-center gap-1.5 py-2 px-3 text-xs"
                                            >
                                                <FolderPlus size={14} />
                                                <span>{t('kb.new_folder')}</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setEditModalOpen(true)}
                                                className="flex items-center gap-1.5 py-2 px-3 text-xs"
                                            >
                                                <Edit size={14} />
                                                <span>{t('kb.edit_folder')}</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={handleDeleteFolder}
                                                className="flex items-center gap-1.5 py-2 px-3 text-xs text-red-400 hover:text-red-500"
                                            >
                                                <Trash size={14} />
                                                <span>{t('kb.delete_folder')}</span>
                                            </Button>
                                        </>
                                    )}
                                    {canWrite && (
                                        folderDetail.restricted && !hasAdmin ? (
                                            <Button
                                                variant="ghost"
                                                disabled
                                                className="flex items-center gap-1.5 py-2 px-3 text-xs bg-nr-border/20 text-nr-text/30 border border-nr-border/10 cursor-not-allowed hover:bg-nr-border/20 hover:text-nr-text/30"
                                                title={t('kb.folder.restricted')}
                                            >
                                                <FilePlus size={14} className="text-nr-text/20" />
                                                <span>{t('kb.new_article')}</span>
                                            </Button>
                                        ) : (
                                            <Link to={`/kb/article/new/edit?folderId=${folderDetail.id}`}>
                                                <Button className="flex items-center gap-1.5 py-2 px-3 text-xs">
                                                    <FilePlus size={14} />
                                                    <span>{t('kb.new_article')}</span>
                                                </Button>
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Render Articles List */}
                            <div className="flex flex-col gap-4">
                                <div className="glass-card rounded-xl overflow-hidden flex flex-col border border-nr-border/20">
                                    {folderDetail.articles?.content && folderDetail.articles.content.length > 0 ? (
                                        <>
                                            <div className="divide-y divide-nr-border/10">
                                                {folderDetail.articles.content.map((art: any, i: number) => (
                                                    <KbArticleRow key={art.id || i} article={art} />
                                                ))}
                                            </div>
                                            {totalPages > 1 && (
                                                <Pagination
                                                    currentPage={page}
                                                    totalPages={totalPages}
                                                    onPageChange={handlePageChange}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-12 text-center text-nr-text/45 italic text-sm">
                                            {t('kb.folder.empty')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Welcome/Empty search parameters state (No folder selected) */
                        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center select-none pointer-events-none animate-fade-in">
                            <BookOpen size={48} className="text-nr-text/20" />
                            <p className="text-sm text-nr-text/35 max-w-md">
                                {t('kb.welcome_placeholder')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Folder creation modal */}
            <CreateFolderModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
                parentId={modalParentId}
            />

            {/* Folder editing modal */}
            {folderDetail && (
                <CreateFolderModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onSuccess={(updated) => {
                        setFolderDetail((prev) => prev ? { ...prev, name: updated.name, restricted: updated.restricted } : null);
                        handleCreateSuccess();
                    }}
                    folderToEdit={folderDetail}
                />
            )}
        </div>
    );
};

export default KbExplorer;
