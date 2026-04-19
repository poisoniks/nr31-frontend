import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
    X,
    FolderOpen,
    Folder,
    ChevronRight,
    Home,
    Plus,
    Upload,
    Trash2,
    Pencil,
    Check,
    Image,
    FileText,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import { libraryApi, type FileMetadataDTO, type MediaFolderDTO } from '../../api/libraryApi';
import { useUIStore } from '../../store/useUIStore';

interface BreadcrumbItem {
    id?: string;
    name: string;
}

interface FileLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (file: FileMetadataDTO) => void;
    selectedFileId?: string;
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const isImage = (contentType: string) => IMAGE_TYPES.includes(contentType);

const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ─── Skeleton loaders ─── */
const FolderSkeleton: React.FC = () => (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg animate-pulse">
        <div className="w-4 h-4 bg-nr-text/10 rounded" />
        <div className="h-3 bg-nr-text/10 rounded w-24" />
    </div>
);

const FileSkeleton: React.FC = () => (
    <div className="rounded-xl border border-nr-border/30 overflow-hidden animate-pulse">
        <div className="h-28 bg-nr-text/10" />
        <div className="p-2 space-y-1">
            <div className="h-3 bg-nr-text/10 rounded w-3/4" />
            <div className="h-2 bg-nr-text/10 rounded w-1/2" />
        </div>
    </div>
);

/* ─── Inline rename input ─── */
interface InlineRenameProps {
    defaultValue: string;
    onCommit: (value: string) => void;
    onCancel: () => void;
}

const InlineRename: React.FC<InlineRenameProps> = ({ defaultValue, onCommit, onCancel }) => {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onCommit(value.trim());
        if (e.key === 'Escape') onCancel();
    };

    return (
        <div className="flex items-center gap-1 min-w-0">
            <input
                ref={inputRef}
                className="flex-1 min-w-0 bg-nr-bg border border-nr-accent/60 rounded px-2 py-0.5 text-xs text-nr-text focus:outline-none"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button onClick={() => onCommit(value.trim())} className="text-green-400 hover:text-green-300 transition-colors cursor-pointer">
                <Check size={14} />
            </button>
            <button onClick={onCancel} className="text-nr-text/40 hover:text-nr-text/70 transition-colors cursor-pointer">
                <X size={14} />
            </button>
        </div>
    );
};

/* ─── Main component ─── */
const FileLibraryModal: React.FC<FileLibraryModalProps> = ({ isOpen, onClose, onSelect, selectedFileId }) => {
    const { t } = useTranslation();
    const { setError } = useUIStore();

    // Navigation
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ name: t('admin.library.root') }]);
    const currentFolderId = breadcrumbs.at(-1)?.id;

    // Folders
    const [folders, setFolders] = useState<MediaFolderDTO[]>([]);
    const [foldersLoading, setFoldersLoading] = useState(false);

    // Files
    const [files, setFiles] = useState<FileMetadataDTO[]>([]);
    const [filesLoading, setFilesLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE_SIZE = 18;

    // Inline states
    const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
    const [creatingFolder, setCreatingFolder] = useState(false);
    const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
    const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
    const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<MediaFolderDTO | null>(null);
    const [confirmDeleteFile, setConfirmDeleteFile] = useState<FileMetadataDTO | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadFolders = useCallback(async () => {
        setFoldersLoading(true);
        try {
            const result = await libraryApi.listFolders(currentFolderId);
            setFolders(result);
        } catch {
            setError(t('admin.library.error_load'));
        } finally {
            setFoldersLoading(false);
        }
    }, [currentFolderId, setError, t]);

    const loadFiles = useCallback(async (p = 0) => {
        setFilesLoading(true);
        try {
            const result = await libraryApi.listFiles({ folderId: currentFolderId, page: p, size: PAGE_SIZE });
            setFiles(result.content);
            setTotalPages(result.page.totalPages || 1);
            setPage(p);
        } catch {
            setError(t('admin.library.error_load'));
        } finally {
            setFilesLoading(false);
        }
    }, [currentFolderId, setError, t]);

    useEffect(() => {
        if (!isOpen) return;
        loadFolders();
        loadFiles(0);
    }, [isOpen, loadFolders, loadFiles]);

    // Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    /* ── Navigation ── */
    const navigateToFolder = (folder: MediaFolderDTO) => {
        setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    };

    const navigateToBreadcrumb = (index: number) => {
        setBreadcrumbs((prev) => prev.slice(0, index + 1));
    };

    /* ── Folder actions ── */
    const handleCreateFolder = async (name: string) => {
        setCreatingFolder(false);
        if (!name) return;
        try {
            const created = await libraryApi.createFolder({ name, parentId: currentFolderId });
            setFolders((prev) => [...prev, created]);
        } catch {
            setError(t('admin.library.error_create_folder'));
        }
    };

    const handleRenameFolder = async (folder: MediaFolderDTO, newName: string) => {
        setRenamingFolderId(null);
        if (!newName || newName === folder.name) return;
        try {
            const updated = await libraryApi.updateFolder(folder.id, { name: newName, parentId: folder.parentId });
            setFolders((prev) => prev.map((f) => (f.id === folder.id ? updated : f)));
        } catch {
            setError(t('admin.library.error_rename'));
        }
    };

    const handleDeleteFolder = async (folder: MediaFolderDTO) => {
        setConfirmDeleteFolder(null);
        setDeletingFolderId(folder.id);
        try {
            await libraryApi.deleteFolder(folder.id);
            setFolders((prev) => prev.filter((f) => f.id !== folder.id));
        } catch {
            setError(t('admin.library.error_delete_folder'));
        } finally {
            setDeletingFolderId(null);
        }
    };

    /* ── File actions ── */
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadFiles([file]);
        e.target.value = '';
    };

    const uploadFiles = async (filesToUpload: File[]) => {
        if (filesToUpload.length === 0) return;
        setUploading(true);
        try {
            for (const file of filesToUpload) {
                await libraryApi.uploadFile(file, currentFolderId);
            }
            await loadFiles(0);
        } catch {
            setError(t('admin.library.error_upload'));
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files).filter(f =>
            IMAGE_TYPES.includes(f.type)
        );

        if (droppedFiles.length > 0) {
            uploadFiles(droppedFiles);
        }
    };

    const handleRenameFile = async (file: FileMetadataDTO, newName: string) => {
        setRenamingFileId(null);
        if (!newName || newName === file.name) return;
        try {
            const updated = await libraryApi.updateFile(file.id, { name: newName });
            setFiles((prev) => prev.map((f) => (f.id === file.id ? updated : f)));
        } catch {
            setError(t('admin.library.error_rename'));
        }
    };

    const handleDeleteFile = async (file: FileMetadataDTO) => {
        setConfirmDeleteFile(null);
        setDeletingFileId(file.id);
        try {
            await libraryApi.deleteFile(file.id);
            setFiles((prev) => prev.filter((f) => f.id !== file.id));
        } catch {
            setError(t('admin.library.error_delete_file'));
        } finally {
            setDeletingFileId(null);
        }
    };

    const handleRefresh = () => {
        loadFolders();
        loadFiles(0);
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal panel */}
            <div
                className="relative z-10 w-full max-w-5xl h-[85vh] flex flex-col glass-card rounded-2xl overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ─── Header ─── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-nr-border/50 shrink-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FolderOpen size={20} className="text-nr-accent shrink-0" />
                        <h2 className="text-lg font-serif font-bold text-nr-text">{t('admin.library.title')}</h2>

                        {/* Breadcrumbs */}
                        <nav className="flex items-center gap-1 ml-3 text-sm min-w-0 overflow-hidden">
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <ChevronRight size={14} className="text-nr-text/30 shrink-0" />}
                                    <button
                                        className={`hover:text-nr-accent transition-colors truncate max-w-[120px] cursor-pointer ${index === breadcrumbs.length - 1
                                                ? 'text-nr-accent font-medium'
                                                : 'text-nr-text/50'
                                            }`}
                                        onClick={() => navigateToBreadcrumb(index)}
                                    >
                                        {index === 0 ? <Home size={14} /> : crumb.name}
                                    </button>
                                </React.Fragment>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleRefresh}
                            className="p-1.5 text-nr-text/50 hover:text-nr-text hover:bg-nr-border/20 rounded-lg transition-colors cursor-pointer"
                            title={t('admin.library.refresh')}
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-nr-text/50 hover:text-nr-text hover:bg-nr-border/20 rounded-lg transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ─── Body: sidebar + content ─── */}
                <div className="flex flex-1 min-h-0">

                    {/* ── Left sidebar: folders ── */}
                    <div className="w-56 shrink-0 border-r border-nr-border/40 flex flex-col bg-black/10">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-nr-border/20">
                            <span className="text-xs font-bold text-nr-text/50 uppercase">{t('admin.library.folders')}</span>
                            <button
                                onClick={() => setCreatingFolder(true)}
                                className="p-1 text-nr-text/40 hover:text-nr-accent hover:bg-nr-accent/10 rounded-md transition-colors cursor-pointer"
                                title={t('admin.library.new_folder')}
                            >
                                <Plus size={13} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-1 px-1.5 space-y-0.5">
                            {/* New folder input */}
                            {creatingFolder && (
                                <div className="px-2 py-1.5">
                                    <InlineRename
                                        defaultValue=""
                                        onCommit={handleCreateFolder}
                                        onCancel={() => setCreatingFolder(false)}
                                    />
                                </div>
                            )}

                            {foldersLoading ? (
                                Array.from({ length: 4 }).map((_, i) => <FolderSkeleton key={i} />)
                            ) : folders.length === 0 && !creatingFolder ? (
                                <p className="text-xs text-nr-text/30 text-center py-4 px-2">{t('admin.library.no_folders')}</p>
                            ) : (
                                folders.map((folder) => (
                                    <div
                                        key={folder.id}
                                        className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-nr-border/20 cursor-pointer transition-colors"
                                    >
                                        {renamingFolderId === folder.id ? (
                                            <InlineRename
                                                defaultValue={folder.name}
                                                onCommit={(name) => handleRenameFolder(folder, name)}
                                                onCancel={() => setRenamingFolderId(null)}
                                            />
                                        ) : (
                                            <>
                                                <button
                                                    className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                                                    onClick={() => navigateToFolder(folder)}
                                                >
                                                    <Folder size={14} className="text-nr-accent/70 shrink-0" />
                                                    <span className="text-sm text-nr-text/80 truncate">{folder.name}</span>
                                                </button>
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    <button
                                                        onClick={() => setRenamingFolderId(folder.id)}
                                                        className="p-0.5 text-nr-text/40 hover:text-blue-400 transition-colors cursor-pointer"
                                                    >
                                                        <Pencil size={11} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteFolder(folder)}
                                                        disabled={deletingFolderId === folder.id}
                                                        className="p-0.5 text-nr-text/40 hover:text-red-400 transition-colors disabled:opacity-30 cursor-pointer"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── Right: files ── */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-nr-border/20 shrink-0">
                            <span className="text-xs text-nr-text/50">
                                {filesLoading ? '…' : `${files.length} ${t('admin.library.files_count')}`}
                            </span>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nr-accent/10 hover:bg-nr-accent/20 text-nr-accent text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <Upload size={13} />
                                {uploading ? t('admin.library.uploading') : t('admin.library.upload')}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={handleUpload}
                            />
                        </div>

                        {/* File grid */}
                        <div
                            className="flex-1 overflow-y-auto p-4 relative"
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {isDragging && (
                                <div className="absolute inset-0 z-50 bg-nr-accent/10 backdrop-blur-[2px] flex items-center justify-center p-8 pointer-events-none">
                                    <div className="w-full h-full border-2 border-dashed border-nr-accent rounded-2xl flex flex-col items-center justify-center gap-4 bg-nr-bg/80 animate-in fade-in zoom-in duration-200">
                                        <div className="w-16 h-16 rounded-full bg-nr-accent/20 flex items-center justify-center text-nr-accent">
                                            <Upload size={32} className="animate-bounce" />
                                        </div>
                                        <p className="text-lg font-serif font-bold text-nr-text">{t('admin.library.drop_hint')}</p>
                                        <p className="text-xs text-nr-text/50 uppercase tracking-widest">{t('admin.library.drop_hint_sub')}</p>
                                    </div>
                                </div>
                            )}

                            {filesLoading ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                    {Array.from({ length: 12 }).map((_, i) => <FileSkeleton key={i} />)}
                                </div>
                            ) : files.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-nr-text/30 gap-3">
                                    <FolderOpen size={40} className="opacity-30" />
                                    <p className="text-sm">{t('admin.library.empty_folder')}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                    {files.map((file) => (
                                        <FileCard
                                            key={file.id}
                                            file={file}
                                            isSelected={file.id === selectedFileId}
                                            isDeleting={deletingFileId === file.id}
                                            isRenaming={renamingFileId === file.id}
                                            onSelect={() => { onSelect(file); onClose(); }}
                                            onRename={(name) => handleRenameFile(file, name)}
                                            onRenameStart={() => setRenamingFileId(file.id)}
                                            onRenameCancel={() => setRenamingFileId(null)}
                                            onDelete={() => setConfirmDeleteFile(file)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 py-3 border-t border-nr-border/20 shrink-0">
                                <button
                                    disabled={page === 0}
                                    onClick={() => loadFiles(page - 1)}
                                    className="px-3 py-1 text-xs rounded-lg bg-nr-border/20 hover:bg-nr-border/40 disabled:opacity-30 transition-colors text-nr-text cursor-pointer"
                                >
                                    {t('common.pagination.prev')}
                                </button>
                                <span className="text-xs text-nr-text/50">
                                    {page + 1} / {totalPages}
                                </span>
                                <button
                                    disabled={page >= totalPages - 1}
                                    onClick={() => loadFiles(page + 1)}
                                    className="px-3 py-1 text-xs rounded-lg bg-nr-border/20 hover:bg-nr-border/40 disabled:opacity-30 transition-colors text-nr-text cursor-pointer"
                                >
                                    {t('common.pagination.next')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Delete folder confirm ─── */}
            {confirmDeleteFolder && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center" onClick={() => setConfirmDeleteFolder(null)}>
                    <div
                        className="relative glass-card rounded-xl p-5 w-full max-w-sm mx-4 animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-nr-text">{t('admin.library.delete_folder_confirm')}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDeleteFolder(confirmDeleteFolder)}
                                className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors cursor-pointer"
                            >
                                {t('admin.library.delete')}
                            </button>
                            <button
                                onClick={() => setConfirmDeleteFolder(null)}
                                className="flex-1 py-2 rounded-lg bg-nr-border/20 hover:bg-nr-border/40 text-nr-text/70 text-sm transition-colors cursor-pointer"
                            >
                                {t('admin.library.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Delete file confirm ─── */}
            {confirmDeleteFile && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center" onClick={() => setConfirmDeleteFile(null)}>
                    <div
                        className="relative glass-card rounded-xl p-5 w-full max-w-sm mx-4 animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-nr-text">{t('admin.library.delete_file_confirm')}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDeleteFile(confirmDeleteFile)}
                                className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors cursor-pointer"
                            >
                                {t('admin.library.delete')}
                            </button>
                            <button
                                onClick={() => setConfirmDeleteFile(null)}
                                className="flex-1 py-2 rounded-lg bg-nr-border/20 hover:bg-nr-border/40 text-nr-text/70 text-sm transition-colors cursor-pointer"
                            >
                                {t('admin.library.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
};

/* ─── File card sub-component ─── */
interface FileCardProps {
    file: FileMetadataDTO;
    isSelected: boolean;
    isDeleting: boolean;
    isRenaming: boolean;
    onSelect: () => void;
    onRename: (name: string) => void;
    onRenameStart: () => void;
    onRenameCancel: () => void;
    onDelete: () => void;
}

const FileCard: React.FC<FileCardProps> = ({
    file, isSelected, isDeleting, isRenaming,
    onSelect, onRename, onRenameStart, onRenameCancel, onDelete,
}) => {
    const { t } = useTranslation();
    const previewUrl = libraryApi.getFileUrl(file.id, 120);

    return (
        <div
            className={`group relative rounded-xl border overflow-hidden transition-all cursor-pointer ${isSelected
                    ? 'border-nr-accent ring-2 ring-nr-accent/30'
                    : 'border-nr-border/30 hover:border-nr-accent/40'
                } ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}
        >
            {/* Thumbnail */}
            <button
                className="w-full block aspect-square bg-nr-bg/60 flex items-center justify-center relative overflow-hidden cursor-pointer"
                onClick={onSelect}
                title={t('admin.library.select')}
            >
                {isImage(file.contentType) ? (
                    <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <FileText size={32} className="text-nr-text/30" />
                )}
                {/* Selected overlay */}
                {isSelected && (
                    <div className="absolute inset-0 bg-nr-accent/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-nr-accent flex items-center justify-center">
                            <Check size={14} className="text-black" />
                        </div>
                    </div>
                )}
                {/* Hover overlay with image icon */}
                {!isSelected && isImage(file.contentType) && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Image size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </button>

            {/* Caption */}
            <div className="px-1.5 py-1 bg-nr-bg/40">
                {isRenaming ? (
                    <InlineRename
                        defaultValue={file.name}
                        onCommit={onRename}
                        onCancel={onRenameCancel}
                    />
                ) : (
                    <p className="text-xs text-nr-text/70 truncate leading-tight">{file.name}</p>
                )}
                <p className="text-[10px] text-nr-text/30 mt-0.5">{formatSize(file.sizeBytes)}</p>
            </div>

            {/* Action buttons (shown on hover) */}
            {!isRenaming && (
                <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onRenameStart(); }}
                        className="p-1 bg-black/60 rounded-md text-white/70 hover:text-white transition-colors cursor-pointer"
                        title={t('admin.library.rename')}
                    >
                        <Pencil size={11} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1 bg-black/60 rounded-md text-white/70 hover:text-red-400 transition-colors cursor-pointer"
                        title={t('admin.library.delete')}
                    >
                        <Trash2 size={11} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileLibraryModal;
