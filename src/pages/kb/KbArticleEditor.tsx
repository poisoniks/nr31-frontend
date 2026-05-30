import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Folder, Loader2, Code } from 'lucide-react';
import { kbApi } from '../../api/kbApi';
import type { KbFolderDto } from '../../api/kbApi';
import { TipTapEditor } from '../../components/cms/richtext/TipTapEditor';
import { JsonSidePanel } from '../../components/cms/richtext/JsonSidePanel';
import { CopyDefinitionsButton } from '../../components/cms/richtext/CopyDefinitionsButton';
import LocaleTabBar from '../../components/ui/LocaleTabBar';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';

interface FlatFolderOption {
    id: number;
    nameStr: string;
}

const KbArticleEditor: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentLang = i18n.language || 'en';
    const user = useAuthStore(state => state.user);
    const hasAdmin = user?.authorities?.includes('kb:admin') ?? false;

    const isEditMode = slug !== 'new';

    // Form states
    const [activeLocale, setActiveLocale] = useState('en');
    const [title, setTitle] = useState<Record<string, string>>({});
    const [content, setContent] = useState<Record<string, any>>({});
    const [folderId, setFolderId] = useState<number | ''>('');

    // JSON Editor states
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    // Metadata states
    const [folders, setFolders] = useState<FlatFolderOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ folderId?: string; title?: string }>({});
    const [articleId, setArticleId] = useState<number | null>(null);

    // Recursively build a flat list of folders with depth markers
    const buildFoldersList = async () => {
        try {
            const rootDirs = await kbApi.getRootFolders();
            const flatList: FlatFolderOption[] = [];

            const traverse = async (folder: KbFolderDto, depth: number) => {
                if (folder.restricted && !hasAdmin) {
                    return;
                }
                const prefix = '— '.repeat(depth);
                const nameText = folder.name?.[currentLang] || folder.name?.['en'] || folder.name?.['uk'] || '';
                if (folder.id) {
                    flatList.push({
                        id: folder.id,
                        nameStr: `${prefix}${nameText}`
                    });
                    if (folder.slug) {
                        const detail = await kbApi.getFolderBySlug(folder.slug);
                        if (detail.subFolders) {
                            for (const sub of detail.subFolders) {
                                await traverse(sub, depth + 1);
                            }
                        }
                    }
                }
            };

            for (const root of rootDirs) {
                await traverse(root, 0);
            }
            setFolders(flatList);
        } catch (err) {
            console.error('Failed to load folders for selection:', err);
        }
    };

    // Load initial article data or folder query param
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await buildFoldersList();

            if (isEditMode && slug) {
                try {
                    const data = await kbApi.getArticleBySlug(slug);
                    setArticleId(data.id || null);
                    setTitle(data.title || {});
                    setContent((data.content as any) || {});
                    setFolderId(data.folderId || '');
                } catch (err) {
                    console.error('Failed to load article:', err);
                    setError(t('kb.article.not_found'));
                }
            } else {
                // New article mode: read folderId from query parameters
                const qFolderId = searchParams.get('folderId');
                if (qFolderId) {
                    setFolderId(Number(qFolderId));
                }
            }
            setLoading(false);
        };

        init();
    }, [slug, isEditMode, searchParams]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setErrors({});

        const newErrors: { folderId?: string; title?: string } = {};

        if (!folderId) {
            newErrors.folderId = t('kb.article.select_folder');
        }

        const hasTitle = Object.values(title).some((tStr) => tStr.trim() !== '');
        if (!hasTitle) {
            newErrors.title = t('cms_validation.field.required');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSaving(true);
        try {
            if (isEditMode && articleId) {
                const updated = await kbApi.updateArticle(articleId, {
                    title,
                    content,
                    folderId: Number(folderId)
                });
                navigate(`/kb/article/${updated.slug}`);
            } else {
                const created = await kbApi.createArticle({
                    title,
                    content,
                    folderId: Number(folderId)
                });
                navigate(`/kb/article/${created.slug}`);
            }
        } catch (err: any) {
            console.error('Failed to save article:', err);
            setError(err.response?.data?.message || t('kb.error.save'));
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (val: string) => {
        setTitle((prev) => ({
            ...prev,
            [activeLocale]: val
        }));
        if (errors.title) {
            setErrors((prev) => ({ ...prev, title: undefined }));
        }
    };

    const handleContentChange = (newVal: any) => {
        setContent((prev) => ({
            ...prev,
            [activeLocale]: newVal
        }));
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 mt-16 text-center flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="animate-spin text-nr-accent" size={32} />
            </div>
        );
    }

    const currentTitle = title[activeLocale] || '';
    const currentContent = content[activeLocale] || null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 mt-16 w-full animate-fade-in relative">
            <form onSubmit={handleSave} className="flex flex-col gap-6">

                {/* Editor Action Header */}
                <div className="flex items-center justify-between pb-3 border-b border-nr-border/15">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-xs text-nr-text/60 hover:text-nr-text transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span>{t('admin.access.modal.cancel')}</span>
                    </button>

                    <h1 className="font-serif text-2xl font-bold text-nr-text">
                        {isEditMode ? t('kb.edit_article') : t('kb.new_article')}
                    </h1>

                    <Button type="submit" disabled={saving} className="flex items-center gap-2">
                        {saving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        <span>{saving ? t('kb.saving') : t('kb.save')}</span>
                    </Button>
                </div>

                {error && (
                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Folder Select Dropdown */}
                <div className="flex flex-col gap-2 p-5 glass-card rounded-xl border border-nr-border/30">
                    <label className="text-sm font-bold text-nr-text/80 flex items-center gap-2">
                        <Folder size={16} className="text-nr-accent" />
                        <span>{t('kb.article.folder_label')}</span>
                    </label>
                    <select
                        value={folderId}
                        onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : '';
                            setFolderId(val);
                            if (val && errors.folderId) {
                                setErrors((prev) => ({ ...prev, folderId: undefined }));
                            }
                        }}
                        className={`w-full h-11 px-4 rounded-lg bg-nr-surface/60 border text-nr-text focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                            errors.folderId
                                ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500'
                                : 'border-nr-border focus:ring-nr-accent/40 focus:border-nr-accent'
                        }`}
                        disabled={saving}
                    >
                        <option value="">{t('kb.article.select_folder')}</option>
                        {folders.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.nameStr}
                            </option>
                        ))}
                    </select>
                    {errors.folderId && (
                        <p className="text-red-500 text-[10px] mt-1 font-medium">
                            {errors.folderId}
                        </p>
                    )}
                </div>

                {/* Localized Content Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-nr-border/15 pb-1">
                        <span className="text-xs font-semibold text-nr-text/50 uppercase tracking-wider">
                            {t('admin.news.editor.description')}
                        </span>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <CopyDefinitionsButton />
                                <button
                                     type="button"
                                     onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                                     className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
                                         isSidePanelOpen
                                             ? 'text-nr-accent bg-nr-accent/15 hover:bg-nr-accent/25'
                                             : 'text-nr-text/50 hover:text-nr-accent hover:bg-nr-accent/10'
                                     }`}
                                     title={t('kb.open_json_editor', { defaultValue: 'Open JSON Editor' })}
                                 >
                                     <Code size={16} />
                                 </button>
                            </div>
                            <LocaleTabBar activeLocale={activeLocale} onLocaleChange={setActiveLocale} />
                        </div>
                    </div>

                    {/* Article Title Input */}
                    <input
                        type="text"
                        value={currentTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder={`${t('kb.article.title_placeholder')} (${activeLocale.toUpperCase()})...`}
                        className={`w-full h-12 px-4 rounded-lg bg-nr-surface/40 border text-nr-text placeholder-nr-text/30 font-serif text-xl focus:outline-none focus:ring-2 transition-all ${
                            errors.title
                                ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500'
                                : 'border-nr-border focus:ring-nr-accent/40 focus:border-nr-accent'
                        }`}
                        disabled={saving}
                    />
                    {errors.title && (
                        <p className="text-red-500 text-[10px] mt-1 font-medium">
                            {errors.title}
                        </p>
                    )}

                    {/* TipTap Rich Text Editor block */}
                    <div className="border border-nr-border/30 rounded-xl bg-nr-surface/50 dark:bg-white/5 backdrop-blur-sm relative z-0 shadow-sm mt-2">
                        <TipTapEditor
                            key={activeLocale}
                            content={currentContent}
                            onChange={handleContentChange}
                            stickyOffset="top-16"
                        />
                    </div>
                </div>
            </form>
            <JsonSidePanel
                isOpen={isSidePanelOpen}
                onClose={() => setIsSidePanelOpen(false)}
                content={currentContent}
                onChange={handleContentChange}
            />
        </div>
    );
};

export default KbArticleEditor;
