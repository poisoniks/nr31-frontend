import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, Edit, Trash, ChevronLeft, Calendar, User, EyeOff, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { kbApi } from '../../api/kbApi';
import type { KbArticleDetailDto } from '../../api/kbApi';
import { KbArticleSkeleton } from '../../components/kb/KbSkeletons';
import KbBreadcrumbs from '../../components/kb/KbBreadcrumbs';
import KbTableOfContents from '../../components/kb/KbTableOfContents';
import KbFolderTree from '../../components/kb/KbFolderTree';
import { TipTapRenderer } from '../../components/cms/richtext/TipTapRenderer';
import Button from '../../components/ui/Button';

const hasHeadings = (content: any): boolean => {
    if (!content || !content.content || !Array.isArray(content.content)) return false;
    
    const getTextFromNode = (n: any): string => {
        if (!n) return '';
        if (n.type === 'text') return n.text || '';
        return n.content?.map(getTextFromNode).join('') || '';
    };

    return content.content.some((node: any) => {
        if (node.type === 'heading') {
            return !!getTextFromNode(node).trim();
        }
        return false;
    });
};

const KbArticle: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const currentLang = i18n.language || 'en';

    const user = useAuthStore((state) => state.user);
    const hasWrite = user?.authorities?.includes('kb:write') ?? false;
    const hasAdmin = user?.authorities?.includes('kb:admin') ?? false;

    const [article, setArticle] = useState<KbArticleDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Sidebar tree toggle (Hidden/collapsed by default)
    const [treeOpen, setTreeOpen] = useState(false);
    
    // TOC toggle (Expanded by default)
    const [tocExpanded, setTocExpanded] = useState(true);

    useEffect(() => {
        if (!slug) return;
        
        const fetchArticle = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await kbApi.getArticleBySlug(slug);
                setArticle(data);
            } catch (err) {
                console.error('Failed to load article detail:', err);
                setError(t('kb.article.not_found'));
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [slug, t]);

    const handleDelete = async () => {
        if (!article || !article.id) return;
        const confirmDelete = window.confirm(t('kb.delete_article_confirm'));
        if (!confirmDelete) return;

        try {
            await kbApi.deleteArticle(article.id);
            navigate('/kb');
        } catch (err) {
            console.error('Failed to delete article:', err);
            setError(t('kb.error.delete'));
        }
    };

    if (loading) {
        return <KbArticleSkeleton />;
    }

    if (error || !article) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 mt-16 text-center">
                <div className="p-8 glass-card rounded-xl border border-red-500/20 bg-red-500/10 flex flex-col items-center gap-4">
                    <EyeOff size={48} className="text-red-500/80 animate-pulse" />
                    <h2 className="font-serif font-bold text-2xl text-red-500">{error || t('kb.article.not_found')}</h2>
                    <Link to="/kb">
                        <Button variant="primary" className="flex items-center gap-2">
                            <ChevronLeft size={16} />
                            <span>{t('kb.breadcrumb_home')}</span>
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const title = article.title?.[currentLang] || article.title?.['en'] || article.title?.['uk'] || '';
    const contentMap = article.content as Record<string, any> | undefined;
    const localizedContent = contentMap?.[currentLang] || contentMap?.['en'] || contentMap?.['uk'] || null;
    const dateToFormat = article.updatedAt || article.createdAt || '';
    const hasToc = hasHeadings(localizedContent);

    const isAuthor = !!(
        user &&
        article &&
        (
            (user.id && user.id === article.authorId) ||
            (user.userId && user.userId === article.authorId) ||
            (user.sub && user.sub === article.authorName)
        )
    );
    const canEdit = (hasWrite || hasAdmin) && (isAuthor || hasAdmin);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 mt-16 w-full animate-fade-in relative">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Collapsible Left Folder Tree Sidebar (Hidden by default) */}
                <aside 
                    className={`
                        shrink-0 w-64 glass-card p-5 rounded-xl transition-all duration-300 overflow-y-auto max-h-[80vh] sticky top-24 z-20
                        ${treeOpen ? 'block animate-fade-in' : 'hidden'}
                    `}
                >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-nr-border/15">
                        <span className="font-serif font-bold text-lg text-nr-text">{t('kb.title')}</span>
                        <button
                            onClick={() => setTreeOpen(false)}
                            className="p-1 rounded text-nr-text/40 hover:text-nr-text transition-colors"
                        >
                            <EyeOff size={16} />
                        </button>
                    </div>
                    <KbFolderTree activeSlug={article.breadcrumbs && article.breadcrumbs.length > 0 ? article.breadcrumbs[article.breadcrumbs.length - 1].slug : undefined} />
                </aside>

                {/* Main Article Content Panel */}
                <article className="flex-1 min-w-0 flex flex-col gap-6">
                    {/* Floating trigger/action bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-nr-border/10">
                        {/* Folder tree toggle tab */}
                        <button
                            onClick={() => setTreeOpen(!treeOpen)}
                            className={`
                                p-3 bg-nr-surface/50 border border-nr-border rounded-xl text-nr-text/75 hover:text-nr-text hover:bg-nr-surface transition-all cursor-pointer
                                ${treeOpen
                                    ? 'bg-nr-accent/15 border-nr-accent/50 text-nr-accent'
                                    : ''
                                }
                            `}
                            title={t('kb.title')}
                            aria-label={t('kb.title')}
                        >
                            <BookOpen size={20} />
                        </button>

                        {/* Breadcrumbs path */}
                        <div className="flex-1 min-w-0">
                            <KbBreadcrumbs breadcrumbs={article.breadcrumbs} />
                        </div>

                        {/* Actions wrapper */}
                        <div className="flex items-center gap-2">
                            {/* TOC toggle */}
                            {hasToc && (
                                <button
                                    onClick={() => setTocExpanded(!tocExpanded)}
                                    className={`
                                        p-2 bg-nr-surface/50 border border-nr-border rounded-xl text-nr-text/75 hover:text-nr-text hover:bg-nr-surface transition-all cursor-pointer
                                        ${!tocExpanded
                                            ? 'bg-nr-accent/15 border-nr-accent/50 text-nr-accent'
                                            : ''
                                        }
                                    `}
                                    title={t('kb.article.toc')}
                                    aria-label={t('kb.article.toc')}
                                >
                                    {tocExpanded ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
                                </button>
                            )}

                            {/* Writer/Admin controls */}
                            {(canEdit || hasAdmin) && (
                                <div className="flex items-center gap-2">
                                    {canEdit && (
                                        <Link to={`/kb/article/${slug}/edit`}>
                                            <Button variant="ghost" className="flex items-center gap-1 py-1.5 px-3 text-xs">
                                                <Edit size={14} />
                                                <span>{t('kb.edit_article')}</span>
                                            </Button>
                                        </Link>
                                    )}
                                    {hasAdmin && (
                                        <Button
                                            variant="ghost"
                                            onClick={handleDelete}
                                            className="flex items-center gap-1 py-1.5 px-3 text-xs text-red-400 hover:text-red-500"
                                        >
                                            <Trash size={14} />
                                            <span>{t('kb.delete_article')}</span>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Article Content Wrapper Card */}
                    <div className="glass-card p-6 sm:p-8 rounded-xl flex flex-col gap-6">
                        {/* Article Header Details */}
                        <div className="flex flex-col gap-4">
                            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-nr-text leading-tight mt-2">
                                {title}
                            </h1>

                            <div className="flex items-center flex-wrap gap-4 py-2.5 border-y border-nr-border/10 text-xs text-nr-text/60">
                                {article.authorName && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1 bg-nr-border/10 rounded-full">
                                            <User size={12} />
                                        </div>
                                        <span>{t('kb.article.by_author', { author: article.authorName })}</span>
                                    </div>
                                )}
                                {dateToFormat && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} className="text-nr-text/40" />
                                        <span>{new Date(dateToFormat).toLocaleDateString(currentLang, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Rendered TipTap Body */}
                        <div className="prose prose-amber max-w-none dark:prose-invert">
                            <TipTapRenderer content={localizedContent} />
                        </div>
                    </div>
                </article>

                {/* Right Outline Sidebar (Table of Contents) */}
                {hasToc && tocExpanded && (
                    <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 max-h-[80vh] overflow-y-auto animate-fade-in">
                        <KbTableOfContents content={localizedContent} />
                    </aside>
                )}
            </div>
        </div>
    );
};

export default KbArticle;
