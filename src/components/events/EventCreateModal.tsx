import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Repeat } from 'lucide-react';
import Modal from '../ui/Modal';
import LocaleTabBar from '../ui/LocaleTabBar';
import Button from '../ui/Button';
import type { components } from '../../api/types';

type EventType = components['schemas']['EventTypeDTO'];
type UnitType = components['schemas']['UnitTypeDTO'];
type Recurrence = components['schemas']['Recurrence'];
import { calendarApi } from '../../api/calendarApi';
import { localeApi } from '../../api/localeApi';
import { rosterApi } from '../../api/rosterApi';

interface EventCreateModalProps {
    isOpen: boolean;
    initialDate: Date | null;
    onClose: () => void;
    onCreated: () => void;
    onError: (message: string) => void;
}

const localized = (map: Record<string, string> | undefined, lang: string): string => {
    if (!map) return '';
    return map[lang] || Object.values(map)[0] || '';
};

const toLocalDatetime = (d: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toLocalDate = (d: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
type EndMode = 'count' | 'date' | 'none';

const ALL_DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const;

const EventCreateModal: React.FC<EventCreateModalProps> = ({ isOpen, initialDate, onClose, onCreated, onError }) => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || '').split('-')[0] || 'en';

    // Form fields
    const [title, setTitle] = useState<Record<string, string>>({});
    const [description, setDescription] = useState<Record<string, string>>({});
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [serverName, setServerName] = useState('');
    const [typeId, setTypeId] = useState<number>(0);
    const [unitIds, setUnitIds] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [titleError, setTitleError] = useState(false);

    // Locale editing
    const [titleLocale, setTitleLocale] = useState(lang);
    const [descLocale, setDescLocale] = useState(lang);

    // Reference data
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);

    // Recurrence
    const [isRecurring, setIsRecurring] = useState(false);
    const [recFrequency, setRecFrequency] = useState<RecurrenceFrequency>('WEEKLY');
    const [recInterval, setRecInterval] = useState(1);
    const [recByDay, setRecByDay] = useState<string[]>([]);
    const [recEndMode, setRecEndMode] = useState<EndMode>('count');
    const [recCount, setRecCount] = useState(10);
    const [recUntil, setRecUntil] = useState('');

    // Load reference data on open
    useEffect(() => {
        if (isOpen) {
            rosterApi.getEventTypes({ page: 0, size: 200 }).then((response) => {
                setEventTypes(response.content);
                if (response.content.length > 0 && typeId === 0) {
                    setTypeId(response.content[0].id);
                }
            }).catch(console.error);
            rosterApi.getUnitTypes({ page: 0, size: 200 }).then((response) => {
                setUnitTypes(response.content);
            }).catch(console.error);
        }
    }, [isOpen]);

    // Reset form when opening with a new date
    useEffect(() => {
        if (isOpen && initialDate) {
            const d = new Date(initialDate);
            d.setHours(20, 0, 0, 0);
            const endDate = new Date(d);
            endDate.setHours(21, 0, 0, 0);
            const untilDefault = new Date(d);
            untilDefault.setMonth(untilDefault.getMonth() + 3);

            setStart(toLocalDatetime(d));
            setEnd(toLocalDatetime(endDate));
            setTitle({});
            setDescription({});
            setServerName('');
            setUnitIds([]);
            setTitleLocale(lang);
            setDescLocale(lang);
            setIsSaving(false);
            setTitleError(false);

            // Reset recurrence
            setIsRecurring(false);
            setRecFrequency('WEEKLY');
            setRecInterval(1);
            setRecByDay([]);
            setRecEndMode('count');
            setRecCount(10);
            setRecUntil(toLocalDate(untilDefault));
        }
    }, [isOpen, initialDate, lang]);

    const toggleUnit = (id: number) => {
        setUnitIds((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        );
    };

    const toggleDay = (day: string) => {
        setRecByDay((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const buildRecurrence = (): Recurrence | undefined => {
        if (!isRecurring) return undefined;
        const rec: Recurrence = {
            frequency: recFrequency,
            interval: recInterval > 1 ? recInterval : undefined,
        };
        if (recFrequency === 'WEEKLY' && recByDay.length > 0) {
            rec.byDay = recByDay;
        }
        if (recEndMode === 'count' && recCount > 0) {
            rec.count = recCount;
        } else if (recEndMode === 'date' && recUntil) {
            rec.until = new Date(recUntil + 'T23:59:59').toISOString();
        }
        return rec;
    };

    const handleCreate = async () => {
        if (!start || typeId === 0) return;

        const filledTitleEntries = Object.entries(title).filter(([_, v]) => v.trim());
        if (filledTitleEntries.length === 0) {
            setTitleError(true);
            return;
        }
        setTitleError(false);
        setIsSaving(true);
        try {
            const startISO = new Date(start).toISOString();
            const endISO = end ? new Date(end).toISOString() : undefined;

            const firstTitle = filledTitleEntries[0][1];
            const cleanTitle: Record<string, string> = { ...title };
            const availableLocales = await localeApi.getAvailableLocaleCodes();
            availableLocales.forEach(l => {
                if (!cleanTitle[l]?.trim()) cleanTitle[l] = firstTitle;
            });

            const filledDescEntries = Object.entries(description).filter(([_, v]) => v.trim());
            const cleanDesc: Record<string, string> = {};
            if (filledDescEntries.length > 0) {
                const firstDesc = filledDescEntries[0][1];
                availableLocales.forEach(l => {
                    cleanDesc[l] = description[l]?.trim() || firstDesc;
                });
            }

            await calendarApi.createEvent({
                title: cleanTitle,
                description: Object.keys(cleanDesc).length > 0 ? cleanDesc : undefined,
                start: startISO,
                end: endISO,
                type: typeId,
                serverName: serverName.trim() || undefined,
                participatingUnits: unitIds.length > 0 ? unitIds : undefined,
                recurrence: buildRecurrence(),
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

    const intervalSuffix = t(`events.create.recurrence.interval_suffix_${recFrequency.toLowerCase()}`);

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
                        className={`${inputClass} ${titleError ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={title[titleLocale] || ''}
                        onChange={(e) => {
                            setTitle({ ...title, [titleLocale]: e.target.value });
                            if (e.target.value.trim()) setTitleError(false);
                        }}
                        placeholder={t('events.edit.title_placeholder')}
                    />
                    {titleError && (
                        <p className="text-red-500 text-[10px] mt-1 font-medium">
                            {t('events.edit.title_required')}
                        </p>
                    )}
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

                {/* ── Recurrence ── */}
                <div className="border border-nr-border rounded-lg overflow-hidden">
                    {/* Toggle */}
                    <button
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer
                            ${isRecurring
                                ? 'bg-blue-500/15 text-blue-400'
                                : 'bg-nr-bg/50 text-nr-text/60 hover:text-nr-text/80'
                            }`}
                    >
                        <Repeat size={15} className={isRecurring ? 'text-blue-400' : 'text-nr-text/40'} />
                        {t('events.create.recurring')}
                        <div className={`ml-auto w-8 h-4.5 rounded-full transition-colors relative ${isRecurring ? 'bg-blue-500' : 'bg-nr-border'}`}>
                            <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${isRecurring ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                    </button>

                    {/* Recurrence Config */}
                    {isRecurring && (
                        <div className="p-3 space-y-3 border-t border-nr-border bg-nr-bg/30">
                            {/* Frequency + Interval */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-nr-text/40 uppercase mb-1 block">
                                        {t('events.create.recurrence.frequency')}
                                    </label>
                                    <div className="relative">
                                        <select
                                            className={`${inputClass} appearance-none pr-8 cursor-pointer text-xs`}
                                            value={recFrequency}
                                            onChange={(e) => setRecFrequency(e.target.value as RecurrenceFrequency)}
                                        >
                                            <option value="DAILY">{t('events.create.recurrence.daily')}</option>
                                            <option value="WEEKLY">{t('events.create.recurrence.weekly')}</option>
                                            <option value="MONTHLY">{t('events.create.recurrence.monthly')}</option>
                                        </select>
                                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-nr-text/40 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-nr-text/40 uppercase mb-1 block">
                                        {t('events.create.recurrence.interval')}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min={1}
                                            max={99}
                                            className={`${inputClass} text-xs w-16 text-center`}
                                            value={recInterval}
                                            onChange={(e) => setRecInterval(Math.max(1, parseInt(e.target.value) || 1))}
                                        />
                                        <span className="text-xs text-nr-text/50">{intervalSuffix}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Day picker (weekly only) */}
                            {recFrequency === 'WEEKLY' && (
                                <div>
                                    <label className="text-[10px] font-bold text-nr-text/40 uppercase mb-1.5 block">
                                        {t('events.create.recurrence.on_days')}
                                    </label>
                                    <div className="flex gap-1">
                                        {ALL_DAYS.map((day) => {
                                            const isActive = recByDay.includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => toggleDay(day)}
                                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer border
                                                        ${isActive
                                                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                                            : 'bg-nr-bg text-nr-text/40 border-nr-border hover:text-nr-text/60 hover:border-nr-text/30'
                                                        }`}
                                                >
                                                    {t(`days.${day}`)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* End condition */}
                            <div>
                                <label className="text-[10px] font-bold text-nr-text/40 uppercase mb-1.5 block">
                                    {t('events.create.recurrence.ends')}
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setRecEndMode('none')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer
                                            ${recEndMode === 'none'
                                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                                : 'bg-nr-bg text-nr-text/50 border-nr-border hover:border-nr-text/30'
                                            }`}
                                    >
                                        {t('events.create.recurrence.ends_none')}
                                    </button>
                                    <button
                                        onClick={() => setRecEndMode('count')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer
                                            ${recEndMode === 'count'
                                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                                : 'bg-nr-bg text-nr-text/50 border-nr-border hover:border-nr-text/30'
                                            }`}
                                    >
                                        {t('events.create.recurrence.ends_count')}
                                    </button>
                                    <button
                                        onClick={() => setRecEndMode('date')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer
                                            ${recEndMode === 'date'
                                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                                : 'bg-nr-bg text-nr-text/50 border-nr-border hover:border-nr-text/30'
                                            }`}
                                    >
                                        {t('events.create.recurrence.ends_date')}
                                    </button>
                                </div>
                                {recEndMode !== 'none' && (
                                    <div className="mt-2">
                                        {recEndMode === 'count' ? (
                                            <input
                                                type="number"
                                                min={1}
                                                max={365}
                                                className={`${inputClass} text-xs w-24`}
                                                value={recCount}
                                                onChange={(e) => setRecCount(Math.max(1, parseInt(e.target.value) || 1))}
                                            />
                                        ) : (
                                            <input
                                                type="date"
                                                className={`${inputClass} text-xs`}
                                                value={recUntil}
                                                onChange={(e) => setRecUntil(e.target.value)}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

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
