import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Layers, CalendarDays } from 'lucide-react';
import { rosterApi } from '../../api/rosterApi';
import { localeApi } from '../../api/localeApi';
import { useUIStore } from '../../store/useUIStore';
import type { components } from '../../api/types';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import LocaleTabBar from '../../components/ui/LocaleTabBar';
import Pagination from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';

type UnitTypeDTO = components['schemas']['UnitTypeDTO'];
type EventTypeDTO = components['schemas']['EventTypeDTO'];

const localized = (map: Record<string, string> | undefined, lang: string): string => {
    if (!map) return '';
    return map[lang] || Object.values(map)[0] || '';
};

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
    <tr className="border-b border-nr-border/30">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div className="h-4 bg-nr-text/10 rounded animate-pulse w-3/4" />
            </td>
        ))}
    </tr>
);

/* ════════════════════════════════════════════════════════════
   UNIT TYPES SECTION
   ════════════════════════════════════════════════════════════ */
const UnitTypesSection: React.FC<{ lang: string }> = ({ lang }) => {
    const { t } = useTranslation();
    const { setError } = useUIStore();

    const [isExpanded, setIsExpanded] = useState(false);
    const [entities, setEntities] = useState<UnitTypeDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    const { page, size, totalPages, setTotalPages, handlePageChange } = usePagination(10);

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEntity, setEditingEntity] = useState<UnitTypeDTO | null>(null);
    const [name, setName] = useState<Record<string, string>>({});
    const [description, setDescription] = useState<Record<string, string>>({});
    const [nameLocale, setNameLocale] = useState(lang);
    const [descLocale, setDescLocale] = useState(lang);
    const [saving, setSaving] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await rosterApi.getUnitTypes({ page, size });
            setEntities(res.content);
            setTotalPages(res.page?.totalPages || 1);
            setFetched(true);
        } catch (e) {
            setError(t('admin.entities.error_load'));
        } finally {
            setLoading(false);
        }
    }, [page, size, setError, t, setTotalPages]);


    useEffect(() => {
        if (isExpanded) {
            loadData();
        }
    }, [isExpanded, loadData]);

    const openCreateModal = () => {
        setEditingEntity(null);
        setName({});
        setDescription({});
        setNameLocale(lang);
        setDescLocale(lang);
        setModalOpen(true);
    };

    const openEditModal = (entity: UnitTypeDTO) => {
        setEditingEntity(entity);
        setName({ ...entity.name });
        setDescription(entity.description ? { ...entity.description } : {});
        setNameLocale(lang);
        setDescLocale(lang);
        setModalOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Fill empty locales with the first available value
            const firstAvailableName = Object.values(name).find((v) => v.trim()) || '';
            const firstAvailableDesc = Object.values(description).find((v) => v.trim()) || '';

            const finalName: Record<string, string> = { ...name };
            const finalDesc: Record<string, string> = { ...description };

            const availableLocales = await localeApi.getAvailableLocaleCodes();
            availableLocales.forEach((l) => {
                if (!finalName[l]?.trim()) finalName[l] = firstAvailableName;
                if (!finalDesc[l]?.trim()) finalDesc[l] = firstAvailableDesc;
            });

            if (editingEntity) {
                await rosterApi.updateUnitType(editingEntity.id, {
                    name: finalName,
                    description: Object.keys(finalDesc).length > 0 ? finalDesc : undefined,
                });
            } else {
                await rosterApi.createUnitType({
                    name: finalName,
                    description: Object.keys(finalDesc).length > 0 ? finalDesc : undefined,
                });
            }
            setModalOpen(false);
            loadData();
        } catch (e) {
            setError(editingEntity ? t('admin.entities.error_update') : t('admin.entities.error_create'));
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (deletingId === null) return;
        setSaving(true);
        try {
            await rosterApi.deleteUnitType(deletingId);
            setDeleteModalOpen(false);
            loadData();
        } catch (e) {
            setError(t('admin.entities.error_delete'));
        } finally {
            setSaving(false);
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-nr-bg border border-nr-border rounded-lg overflow-hidden shadow-sm">
            <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-nr-border/20 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-nr-accent/20 flex items-center justify-center text-nr-accent">
                        <Layers size={18} />
                    </div>
                    <h2 className="text-lg font-bold font-serif text-nr-text">{t('admin.entities.unit_types')}</h2>
                </div>
                {isExpanded ? <ChevronDown size={20} className="text-nr-text/50" /> : <ChevronRight size={20} className="text-nr-text/50" />}
            </button>

            {isExpanded && (
                <div className="px-5 pb-5 border-t border-nr-border">
                    <div className="flex justify-end pt-4 pb-2">
                        <Button variant="primary" size="sm" onClick={openCreateModal} className="flex items-center gap-2">
                            <Plus size={14} />
                            {t('admin.entities.unit_types.create')}
                        </Button>
                    </div>

                    <div className="flex flex-col min-h-[600px] justify-between rounded-lg border border-nr-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-nr-text">
                                <thead className="bg-nr-border/30 text-xs uppercase font-bold text-nr-text/70 border-b border-nr-border">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">{t('admin.entities.name')}</th>
                                        <th className="px-4 py-3">{t('admin.entities.description')}</th>
                                        <th className="px-4 py-3 text-right">{t('admin.entities.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        Array.from({ length: size }).map((_, i) => (
                                            <SkeletonRow key={i} cols={4} />
                                        ))
                                    ) : entities.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-nr-text/50">
                                                {t('admin.entities.empty')}
                                            </td>
                                        </tr>
                                    ) : (
                                        entities.map((ent) => (
                                            <tr key={ent.id} className="border-b border-nr-border/30 hover:bg-nr-border/10 transition-colors">
                                                <td className="px-4 py-3 font-mono text-nr-text/70">{ent.id}</td>
                                                <td className="px-4 py-3 font-bold">{localized(ent.name, lang)}</td>
                                                <td className="px-4 py-3 text-nr-text/70 max-w-xs truncate">
                                                    {localized(ent.description, lang) || '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(ent)}
                                                            className="p-1.5 text-nr-text/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setDeletingId(ent.id); setDeleteModalOpen(true); }}
                                                            className="p-1.5 text-nr-text/60 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => !saving && setModalOpen(false)}
                title={editingEntity ? t('admin.entities.unit_types.edit') : t('admin.entities.unit_types.create')}
            >
                <div className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-nr-text/50 uppercase">
                                {t('admin.entities.name')}
                            </label>
                            <LocaleTabBar activeLocale={nameLocale} onLocaleChange={setNameLocale} />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-nr-bg border border-nr-border rounded-lg px-3 py-2 text-sm text-nr-text focus:outline-none focus:border-nr-accent/60 transition-colors"
                            value={name[nameLocale] || ''}
                            onChange={(e) => setName({ ...name, [nameLocale]: e.target.value })}
                            placeholder={t('admin.entities.name_placeholder')}
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-nr-text/50 uppercase">
                                {t('admin.entities.description')}
                            </label>
                            <LocaleTabBar activeLocale={descLocale} onLocaleChange={setDescLocale} />
                        </div>
                        <textarea
                            className="w-full bg-nr-bg border border-nr-border rounded-lg px-3 py-2 text-sm text-nr-text focus:outline-none focus:border-nr-accent/60 transition-colors min-h-[80px]"
                            value={description[descLocale] || ''}
                            onChange={(e) => setDescription({ ...description, [descLocale]: e.target.value })}
                            placeholder={t('admin.entities.description_placeholder')}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} className="flex-1">
                            {t('admin.access.modal.save')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)} disabled={saving} className="flex-1">
                            {t('admin.access.modal.cancel')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={deleteModalOpen} onClose={() => !saving && setDeleteModalOpen(false)} title={t('admin.access.modal.delete')}>
                <div className="space-y-4">
                    <p className="text-sm text-nr-text">{t('admin.entities.delete_confirm')}</p>
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={confirmDelete}
                            disabled={saving}
                            className="flex-1 bg-red-500 hover:bg-red-600 border-red-500 text-white"
                        >
                            {t('admin.access.modal.delete')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)} disabled={saving} className="flex-1">
                            {t('admin.access.modal.cancel')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};


/* ════════════════════════════════════════════════════════════
   EVENT TYPES SECTION
   ════════════════════════════════════════════════════════════ */
const EventTypesSection: React.FC<{ lang: string }> = ({ lang }) => {
    const { t } = useTranslation();
    const { setError } = useUIStore();

    const [isExpanded, setIsExpanded] = useState(false);
    const [entities, setEntities] = useState<EventTypeDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    const { page, size, totalPages, setTotalPages, handlePageChange } = usePagination(10);

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEntity, setEditingEntity] = useState<EventTypeDTO | null>(null);
    const [name, setName] = useState<Record<string, string>>({});
    const [nameLocale, setNameLocale] = useState(lang);
    const [saving, setSaving] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await rosterApi.getEventTypes({ page, size });
            setEntities(res.content);
            setTotalPages(res.page?.totalPages || 1);
            setFetched(true);
        } catch (e) {
            setError(t('admin.entities.error_load'));
        } finally {
            setLoading(false);
        }
    }, [page, size, setError, t, setTotalPages]);
    useEffect(() => {
        if (isExpanded) {
            loadData();
        }
    }, [isExpanded, loadData]);

    const openCreateModal = () => {
        setEditingEntity(null);
        setName({});
        setNameLocale(lang);
        setModalOpen(true);
    };

    const openEditModal = (entity: EventTypeDTO) => {
        setEditingEntity(entity);
        setName({ ...entity.name });
        setNameLocale(lang);
        setModalOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const firstAvailableName = Object.values(name).find((v) => v.trim()) || '';
            const finalName: Record<string, string> = { ...name };

            const availableLocales = await localeApi.getAvailableLocaleCodes();
            availableLocales.forEach((l) => {
                if (!finalName[l]?.trim()) finalName[l] = firstAvailableName;
            });

            if (editingEntity) {
                await rosterApi.updateEventType(editingEntity.id, {
                    name: finalName,
                });
            } else {
                await rosterApi.createEventType({
                    name: finalName,
                });
            }
            setModalOpen(false);
            loadData();
        } catch (e) {
            setError(editingEntity ? t('admin.entities.error_update') : t('admin.entities.error_create'));
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (deletingId === null) return;
        setSaving(true);
        try {
            await rosterApi.deleteEventType(deletingId);
            setDeleteModalOpen(false);
            loadData();
        } catch (e) {
            setError(t('admin.entities.error_delete'));
        } finally {
            setSaving(false);
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-nr-bg border border-nr-border rounded-lg overflow-hidden shadow-sm">
            <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-nr-border/20 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <CalendarDays size={18} />
                    </div>
                    <h2 className="text-lg font-bold font-serif text-nr-text">{t('admin.entities.event_types')}</h2>
                </div>
                {isExpanded ? <ChevronDown size={20} className="text-nr-text/50" /> : <ChevronRight size={20} className="text-nr-text/50" />}
            </button>

            {isExpanded && (
                <div className="px-5 pb-5 border-t border-nr-border">
                    <div className="flex justify-end pt-4 pb-2">
                        <Button variant="primary" size="sm" onClick={openCreateModal} className="flex items-center gap-2">
                            <Plus size={14} />
                            {t('admin.entities.event_types.create')}
                        </Button>
                    </div>

                    <div className="flex flex-col min-h-[600px] justify-between rounded-lg border border-nr-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-nr-text">
                                <thead className="bg-nr-border/30 text-xs uppercase font-bold text-nr-text/70 border-b border-nr-border">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3 w-full">{t('admin.entities.name')}</th>
                                        <th className="px-4 py-3 text-right">{t('admin.entities.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        Array.from({ length: size }).map((_, i) => (
                                            <SkeletonRow key={i} cols={3} />
                                        ))
                                    ) : entities.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-nr-text/50">
                                                {t('admin.entities.empty')}
                                            </td>
                                        </tr>
                                    ) : (
                                        entities.map((ent) => (
                                            <tr key={ent.id} className="border-b border-nr-border/30 hover:bg-nr-border/10 transition-colors">
                                                <td className="px-4 py-3 font-mono text-nr-text/70">{ent.id}</td>
                                                <td className="px-4 py-3 font-bold">{localized(ent.name, lang)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(ent)}
                                                            className="p-1.5 text-nr-text/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setDeletingId(ent.id); setDeleteModalOpen(true); }}
                                                            className="p-1.5 text-nr-text/60 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => !saving && setModalOpen(false)}
                title={editingEntity ? t('admin.entities.event_types.edit') : t('admin.entities.event_types.create')}
            >
                <div className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-nr-text/50 uppercase">
                                {t('admin.entities.name')}
                            </label>
                            <LocaleTabBar activeLocale={nameLocale} onLocaleChange={setNameLocale} />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-nr-bg border border-nr-border rounded-lg px-3 py-2 text-sm text-nr-text focus:outline-none focus:border-nr-accent/60 transition-colors"
                            value={name[nameLocale] || ''}
                            onChange={(e) => setName({ ...name, [nameLocale]: e.target.value })}
                            placeholder={t('admin.entities.name_placeholder')}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} className="flex-1">
                            {t('admin.access.modal.save')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)} disabled={saving} className="flex-1">
                            {t('admin.access.modal.cancel')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={deleteModalOpen} onClose={() => !saving && setDeleteModalOpen(false)} title={t('admin.access.modal.delete')}>
                <div className="space-y-4">
                    <p className="text-sm text-nr-text">{t('admin.entities.delete_confirm')}</p>
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={confirmDelete}
                            disabled={saving}
                            className="flex-1 bg-red-500 hover:bg-red-600 border-red-500 text-white"
                        >
                            {t('admin.access.modal.delete')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)} disabled={saving} className="flex-1">
                            {t('admin.access.modal.cancel')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};


/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */
const EntityManagementPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || '').split('-')[0] || 'en';

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-nr-border/50 shrink-0">
                <h1 className="text-3xl font-bold font-serif text-nr-accent tracking-wide uppercase">
                    {t('admin.entities.title')}
                </h1>
                <p className="text-sm text-nr-text/60 mt-1">
                    {t('admin.entities.subtitle')}
                </p>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 bg-nr-bg/30">
                <div className="max-w-4xl mx-auto space-y-6">
                    <UnitTypesSection lang={lang} />
                    <EventTypesSection lang={lang} />
                </div>
            </div>
        </div>
    );
};

export default EntityManagementPage;
