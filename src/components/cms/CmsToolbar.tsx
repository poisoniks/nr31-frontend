import React from 'react';
import { Save, UploadCloud, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCmsStore } from '../../store/useCmsStore';
import { useUIStore } from '../../store/useUIStore';
import { getErrorMessage } from '../../utils/errorUtils';
import Button from '../ui/Button';

export const CmsToolbar: React.FC<{ slug: string }> = ({ slug }) => {
    const { t } = useTranslation();
    const isEditMode = useCmsStore(state => state.isEditMode);
    const pageVersion = useCmsStore(state => state.pageVersion);
    const isDirty = useCmsStore(state => state.isDirty);
    const isSaving = useCmsStore(state => state.isSaving);
    const saveDraft = useCmsStore(state => state.saveDraft);
    const publishDraft = useCmsStore(state => state.publishDraft);
    const loadDraftPage = useCmsStore(state => state.loadDraftPage);
    const { setError } = useUIStore();

    if (!isEditMode) return null;

    const handleSaveDraft = async () => {
        try {
            await saveDraft(slug);
        } catch (err) {
            setError(getErrorMessage(err, t));
        }
    };

    const handlePublishDraft = async () => {
        if (window.confirm(t('cms.confirm_publish'))) {
            try {
                await publishDraft(slug);
            } catch (err) {
                setError(getErrorMessage(err, t));
            }
        }
    };

    const handleDiscardChanges = async () => {
        if (window.confirm(t('cms.confirm_discard'))) {
            try {
                await loadDraftPage(slug);
            } catch (err) {
                setError(getErrorMessage(err, t));
            }
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 animate-fade-in-up">
            <div className="glass bg-nr-bg/95 border border-nr-border/50 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-4">
                
                <div className="flex flex-col items-start min-w-[80px]">
                    <span className="text-xs font-medium text-nr-text/50 uppercase tracking-wider">
                        {t('cms.version', { version: pageVersion })}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`w-2 h-2 rounded-full ${(isDirty || isSaving) ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse' : 'bg-green-500'}`} />
                        <span className={`text-xs font-bold ${(isDirty || isSaving) ? 'text-amber-500' : 'text-green-500'}`}>
                            {isSaving ? t('cms.saving') : (isDirty ? t('cms.unsaved') : t('cms.saved'))}
                        </span>
                    </div>
                </div>

                <div className="w-px h-8 bg-nr-border/50 mx-2" />

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!isDirty || isSaving}
                        onClick={handleDiscardChanges}
                        className="text-nr-text/60 hover:text-nr-text"
                    >
                        <RotateCcw size={16} className="mr-1.5" />
                        {t('cms.discard')}
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={!isDirty || isSaving}
                        onClick={handleSaveDraft}
                        className="border-nr-border/50"
                    >
                        <Save size={16} className="mr-1.5" />
                        {isSaving ? t('cms.saving') : t('cms.save_draft')}
                    </Button>

                    <Button
                        variant="primary"
                        size="sm"
                        disabled={isSaving}
                        onClick={handlePublishDraft}
                        className="shadow-lg shadow-amber-900/20"
                    >
                        <UploadCloud size={16} className="mr-1.5" />
                        {isSaving ? t('cms.publishing') : t('cms.publish')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
