import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import Modal from '../ui/Modal';
import LocaleTabBar from '../ui/LocaleTabBar';
import Button from '../ui/Button';
import type { EventType, UnitType } from '../../types/calendar';
import { calendarApi } from '../../api/calendarApi';

interface EventCreateModalProps {
    isOpen: boolean;
    initialDate: Date | null;
    onClose: () => void;
    onCreated: () => void;
    onError: (message: string) => void;
}

const localized = (map: Record<string, string> | undefined, lang: string): string => {
    if (!map) return '';
    return map[lang] || map['en'] || Object.values(map)[0] || '';
};

const toLocalDatetime = (d: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EventCreateModal: React.FC<EventCreateModalProps> = ({ isOpen, initialDate, onClose, onCreated, onError }) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language?.startsWith('uk') ? 'uk' : 'en';

    // Form fields
    const [title, setTitle] = useState<Record<string, string>>({});
    const [description, setDescription] = useState<Record<string, string>>({});
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [serverName, setServerName] = useState('');
    const [typeId, setTypeId] = useState<number>(0);
    const [unitIds, setUnitIds] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Locale editing
    const [titleLocale, setTitleLocale] = useState(lang);
    const [descLocale, setDescLocale] = useState(lang);

    // Reference data
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);

    // Load reference data on open
    useEffect(() => {
        if (isOpen) {
            calendarApi.getEventTypes().then((types) => {
                setEventTypes(types);
                if (types.length > 0 && typeId === 0) {
                    setTypeId(types[0].id);
                }
            }).catch(console.error);
            calendarApi.getUnitTypes().then(setUnitTypes).catch(console.error);
        }
    }, [isOpen]);

    // Reset form when opening with a new date
    useEffect(() => {
        if (isOpen && initialDate) {
            const d = new Date(initialDate);
            d.setHours(20, 0, 0, 0);
            const endDate = new Date(d);
            endDate.setHours(21, 0, 0, 0);
            setStart(toLocalDatetime(d));
            setEnd(toLocalDatetime(endDate));
            setTitle({});
            setDescription({});
            setServerName('');
            setUnitIds([]);
            setTitleLocale(lang);
            setDescLocale(lang);
            setIsSaving(false);
        }
    }, [isOpen, initialDate, lang]);

    const toggleUnit = (id: number) => {
        setUnitIds((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (!start || typeId === 0) return;
        setIsSaving(true);
        try {
            const startISO = new Date(start).toISOString();
            const endISO = end ? new Date(end).toISOString() : undefined;

            // Filter out empty-string values from localized maps
            const cleanTitle: Record<string, string> = {};
            Object.entries(title).forEach(([k, v]) => { if (v.trim()) cleanTitle[k] = v; });

            const cleanDesc: Record<string, string> = {};
            Object.entries(description).forEach(([k, v]) => { if (v.trim()) cleanDesc[k] = v; });

            await calendarApi.createEvent({
                title: Object.keys(cleanTitle).length > 0 ? cleanTitle : undefined,
                description: Object.keys(cleanDesc).length > 0 ? cleanDesc : undefined,
                start: startISO,
                end: endISO,
                type: typeId,
                serverName: serverName.trim() || undefined,
                participatingUnits: unitIds.length > 0 ? unitIds : undefined,
            });

            onCreated();
            onClose();
        } catch (err) {
            console.error('Failed to create event', err);
            onError(t('events.create.error'));
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = 'w-full bg-nr-bg border border-nr-border rounded-lg px-3 py-2 text-sm text-nr-text focus:outline-none focus:border-nr-accent/60 transition-colors';

    const modalTitle = (
        <span>{t('events.create.title')}</span>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} contentClassName="overflow-visible">
            <div className="space-y-4">
                {/* Title */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-nr-text/50 uppercase">
                            {t('events.edit.title_placeholder')}
                        </label>
                        <LocaleTabBar activeLocale={titleLocale} onLocaleChange={setTitleLocale} />
                    </div>
                    <input
                        type="text"
                        className={inputClass}
                        value={title[titleLocale] || ''}
                        onChange={(e) => setTitle({ ...title, [titleLocale]: e.target.value })}
                        placeholder={t('events.edit.title_placeholder')}
                    />
                </div>

                {/* Time */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-nr-text/50 uppercase mb-1 block">
                            {t('events.details.time')} (start) *
                        </label>
                        <input
                            type="datetime-local"
                            className={inputClass}
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-nr-text/50 uppercase mb-1 block">
                            {t('events.details.time')} (end)
                        </label>
                        <input
                            type="datetime-local"
                            className={inputClass}
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                        />
                    </div>
                </div>

                {/* Event Type */}
                <div>
                    <label className="text-xs font-bold text-nr-text/50 uppercase mb-1 block">
                        {t('events.edit.type')} *
                    </label>
                    <div className="relative">
                        <select
                            className={`${inputClass} appearance-none pr-8 cursor-pointer`}
                            value={typeId}
                            onChange={(e) => setTypeId(Number(e.target.value))}
                        >
                            {eventTypes.map((et) => (
                                <option key={et.id} value={et.id}>
                                    {localized(et.name, lang)}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-nr-text/40 pointer-events-none" />
                    </div>
                </div>

                {/* Server Name (optional) */}
                <div>
                    <label className="text-xs font-bold text-nr-text/50 uppercase mb-1 block">
                        {t('events.details.server')}
                    </label>
                    <input
                        type="text"
                        className={inputClass}
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                        placeholder={t('events.edit.server_placeholder')}
                    />
                </div>

                {/* Participating Units (optional) */}
                {unitTypes.length > 0 && (
                    <div>
                        <label className="text-xs font-bold text-nr-text/50 uppercase mb-1.5 block">
                            {t('events.edit.units')}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {unitTypes.map((ut) => {
                                const isSelected = unitIds.includes(ut.id);
                                const name = localized(ut.name, lang);
                                return (
                                    <button
                                        key={ut.id}
                                        onClick={() => toggleUnit(ut.id)}
                                        className={`
                                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                                            border transition-all cursor-pointer
                                            ${isSelected
                                                ? 'bg-nr-accent/20 text-nr-accent border-nr-accent/40'
                                                : 'bg-nr-bg text-nr-text/50 border-nr-border hover:text-nr-text/70 hover:border-nr-text/30'
                                            }
                                        `}
                                    >
                                        {ut.customIcon && (
                                            <img src={ut.customIcon} alt="" className="w-3.5 h-3.5 object-contain" />
                                        )}
                                        {name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Description (optional) */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-nr-text/50 uppercase">
                            {t('events.details.description')}
                        </label>
                        <LocaleTabBar activeLocale={descLocale} onLocaleChange={setDescLocale} />
                    </div>
                    <textarea
                        className={`${inputClass} min-h-[80px] resize-y`}
                        value={description[descLocale] || ''}
                        onChange={(e) => setDescription({ ...description, [descLocale]: e.target.value })}
                        placeholder={t('events.edit.description_placeholder')}
                        rows={3}
                    />
                </div>

                {/* Create / Cancel */}
                <div className="flex gap-2 pt-2">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleCreate}
                        disabled={isSaving || !start || typeId === 0}
                        className="flex-1"
                    >
                        {isSaving ? t('events.create.creating') : t('events.create.submit')}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={isSaving}
                        className="flex-1"
                    >
                        {t('events.edit.cancel')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default EventCreateModal;
