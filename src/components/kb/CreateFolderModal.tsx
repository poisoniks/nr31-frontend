import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import LocaleTabBar from '../ui/LocaleTabBar';
import Button from '../ui/Button';
import { kbApi } from '../../api/kbApi';
import type { KbFolderDto } from '../../api/kbApi';

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (folder: KbFolderDto) => void;
    parentId?: number;
    folderToEdit?: KbFolderDto | null;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    parentId,
    folderToEdit
}) => {
    const { t } = useTranslation();
    const [activeLocale, setActiveLocale] = useState('en');
    const [name, setName] = useState<Record<string, string>>({});
    const [restricted, setRestricted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (folderToEdit) {
                setName(folderToEdit.name || {});
                setRestricted(!!folderToEdit.restricted);
            } else {
                setName({});
                setRestricted(false);
            }
        }
    }, [isOpen, folderToEdit]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Ensure at least one locale name is filled
        const hasName = Object.values(name).some((val) => val.trim() !== '');
        if (!hasName) {
            setError(t('cms_validation.field.required'));
            setLoading(false);
            return;
        }

        try {
            if (folderToEdit && folderToEdit.id) {
                const updated = await kbApi.updateFolder(folderToEdit.id, {
                    name,
                    restricted
                });
                onSuccess(updated);
            } else {
                const created = await kbApi.createFolder({
                    name,
                    parentId,
                    restricted
                });
                onSuccess(created);
            }
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || t('common.error.unexpected'));
        } finally {
            setLoading(false);
        }
    };

    const activeName = name[activeLocale] || '';

    const handleNameChange = (val: string) => {
        setName((prev) => ({
            ...prev,
            [activeLocale]: val
        }));
    };

    const modalTitle = folderToEdit ? t('kb.edit_folder') : t('kb.new_folder');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            <form onSubmit={handleSave} className="flex flex-col gap-5">
                {/* Locale tabs row */}
                <div className="flex justify-between items-center border-b border-nr-border/15 pb-1">
                    <span className="text-xs font-semibold text-nr-text/50 uppercase tracking-wider">
                        {t('kb.folder.name_placeholder')}
                    </span>
                    <LocaleTabBar activeLocale={activeLocale} onLocaleChange={setActiveLocale} />
                </div>

                {/* Name Input */}
                <div className="flex flex-col gap-2">
                    <input
                        type="text"
                        value={activeName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder={`${t('kb.folder.name_placeholder')} (${activeLocale.toUpperCase()})...`}
                        className="w-full h-11 px-4 rounded-lg bg-nr-surface/40 border border-nr-border text-nr-text placeholder-nr-text/30 focus:outline-none focus:ring-2 focus:ring-nr-accent/40 focus:border-nr-accent transition-all"
                        disabled={loading}
                    />
                </div>

                {/* Restricted Access Checkbox */}
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-nr-bg/30 border border-nr-border/10">
                    <input
                        type="checkbox"
                        id="restricted-checkbox"
                        checked={restricted}
                        onChange={(e) => setRestricted(e.target.checked)}
                        className="w-4 h-4 rounded border-nr-border text-nr-accent focus:ring-nr-accent/40 cursor-pointer accent-nr-accent"
                        disabled={loading}
                    />
                    <label
                        htmlFor="restricted-checkbox"
                        className="text-sm font-medium text-nr-text/80 cursor-pointer select-none"
                    >
                        {t('kb.folder.restricted')}
                    </label>
                </div>

                {error && (
                    <div className="text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {t('admin.access.modal.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? t('kb.saving') : t('kb.save')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateFolderModal;
