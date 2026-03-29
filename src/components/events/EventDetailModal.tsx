import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Globe, Lock, ChevronDown } from 'lucide-react';
import Modal from '../ui/Modal';
import EditBookmarkButton from '../ui/EditBookmarkButton';
import LocaleTabBar from '../ui/LocaleTabBar';
import SaveModeDropdown from './SaveModeDropdown';
import Button from '../ui/Button';
import type { CalendarEventDTO, EventType, UnitType, UpdateMode } from '../../types/calendar';
import { DateFormatter } from '../../utils/dateFormatter';
import { calendarApi } from '../../api/calendarApi';
import { localeApi } from '../../api/localeApi';
import { useAuthStore } from '../../store/useAuthStore';

interface EventDetailModalProps {
    event: CalendarEventDTO | null;
    onClose: () => void;
    onEventUpdated?: () => void;
}

const localized = (map: Record<string, string> | undefined, lang: string): string => {
    if (!map) return '';
    return map[lang] || Object.values(map)[0] || '';
};

const toLocalDatetime = (iso: string): string => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onEventUpdated }) => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || '').split('-')[0] || 'en';
    const user = useAuthStore((s) => s.user);
    const canEdit = user?.authorities?.includes('event:write') ?? false;

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showModeDropdown, setShowModeDropdown] = useState(false);

    // Editable form fields
    const [editTitle, setEditTitle] = useState<Record<string, string>>({});
    const [editDescription, setEditDescription] = useState<Record<string, string>>({});
    const [editStart, setEditStart] = useState('');
    const [editEnd, setEditEnd] = useState('');
    const [editServerName, setEditServerName] = useState('');
    const [editTypeId, setEditTypeId] = useState<number>(0);
    const [editUnitIds, setEditUnitIds] = useState<number[]>([]);
    const [titleError, setTitleError] = useState(false);

    // Locale editing
    const [titleLocale, setTitleLocale] = useState(lang);
    const [descLocale, setDescLocale] = useState(lang);

    // Reference data
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);

    const isDiscord = event?.source === 'DISCORD';

    // Load reference data on first edit
    useEffect(() => {
        if (isEditing && eventTypes.length === 0) {
            calendarApi.getEventTypes().then(setEventTypes).catch(console.error);
            calendarApi.getUnitTypes().then(setUnitTypes).catch(console.error);
        }
    }, [isEditing, eventTypes.length]);

    // Reset editing when event changes or modal closes
    useEffect(() => {
        setIsEditing(false);
        setShowModeDropdown(false);
    }, [event]);

    const enterEditMode = useCallback(() => {
        if (!event) return;
        setEditTitle({ ...event.title });
        setEditDescription({ ...(event.description || {}) });
        setEditStart(event.start ? toLocalDatetime(event.start) : '');
        setEditEnd(event.end ? toLocalDatetime(event.end) : '');
        setEditServerName(event.serverName || '');
        setEditTypeId(event.type?.id || 0);
        setEditUnitIds(event.participatingUnits?.map((u) => u.id) || []);
        setTitleLocale(lang);
        setDescLocale(lang);
        setTitleError(false);
        setIsEditing(true);
    }, [event, lang]);

    const cancelEdit = () => {
        setIsEditing(false);
        setShowModeDropdown(false);
    };

    const handleSave = async (mode: UpdateMode) => {
        if (!event) return;

        const filledTitleEntries = Object.entries(editTitle).filter(([_, v]) => v.trim());
        if (!isDiscord && filledTitleEntries.length === 0) {
            setTitleError(true);
            return;
        }
        setTitleError(false);

        setIsSaving(true);
        setShowModeDropdown(false);
        try {
            const startISO = new Date(editStart).toISOString();
            const endISO = editEnd ? new Date(editEnd).toISOString() : undefined;

            const firstTitle = filledTitleEntries.length > 0 ? filledTitleEntries[0][1] : '';
            const finalTitle: Record<string, string> = { ...editTitle };
            const availableLocales = await localeApi.getAvailableLocaleCodes();
            if (!isDiscord) {
                availableLocales.forEach(l => {
                    if (!finalTitle[l]?.trim()) finalTitle[l] = firstTitle;
                });
            }

            const filledDescEntries = Object.entries(editDescription).filter(([_, v]) => v.trim());
            const finalDesc: Record<string, string> = { ...editDescription };
            if (!isDiscord && filledDescEntries.length > 0) {
                const firstDesc = filledDescEntries[0][1];
                availableLocales.forEach(l => {
                    if (!finalDesc[l]?.trim()) finalDesc[l] = firstDesc;
                });
            }

            await calendarApi.updateEvent(event.id, {
                mode,
                title: isDiscord ? undefined : finalTitle,
                description: isDiscord ? undefined : (Object.keys(finalDesc).length > 0 ? finalDesc : undefined),
                start: isDiscord ? event.start : startISO,
                end: isDiscord ? event.end : endISO,
                originalStart: event.start,
                type: editTypeId,
                serverName: editServerName,
                participatingUnits: editUnitIds,
            });
            setIsEditing(false);
            onEventUpdated?.();
        } catch (err) {
            console.error('Failed to update event', err);
        } finally {
            setIsSaving(false);
        }
    };

    const onSaveClick = () => {
        if (event?.recurring) {
            setShowModeDropdown(true);
        } else {
            handleSave('SINGLE');
        }
    };

    const toggleUnit = (id: number) => {
        setEditUnitIds((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        );
    };

    if (!event) return null;

    const titleText = localized(event.title, lang);
    const description = localized(event.description, lang);
    const typeName = localized(event.type?.name, lang);

    const modalTitle = (
        <>
            {event.type?.customIcon && (
                <img src={event.type.customIcon} alt="" className="w-6 h-6 object-contain shrink-0" />
            )}
            <span>{titleText}</span>
        </>
    );

    const inputClass = 'w-full bg-nr-bg border border-nr-border rounded-lg px-3 py-2 text-sm text-nr-text focus:outline-none focus:border-nr-accent/60 transition-colors';
    const lockedClass = 'opacity-50 pointer-events-none';

    return (
        <Modal isOpen={!!event} onClose={onClose} title={modalTitle} contentClassName="overflow-visible">
            <div className="relative">
                {/* Edit Bookmark Button */}
                {canEdit && !isEditing && (
                    <EditBookmarkButton isActive={false} onClick={enterEditMode} className="top-[-3.5rem]" />
                )}
                {canEdit && isEditing && (
                    <EditBookmarkButton isActive={true} onClick={cancelEdit} className="top-[-3.5rem]" />
                )}

                {/* Type badge and Units */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${event.source === 'DISCORD'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        : 'bg-nr-accent/20 text-nr-accent border-nr-accent/30'
                        }`}>
                        {typeName}
                    </span>
                    {event.recurring && (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            ↻ {t('events.details.recurring')}
                        </span>
                    )}

                    {event.participatingUnits && event.participatingUnits.length > 0 && !isEditing && (
                        <div className="ml-1 flex items-center -space-x-1">
                            {event.participatingUnits.map((u) => {
                                const unitName = localized(u.name, lang);
                                return (
                                    <div
                                        key={u.id}
                                        className="relative group cursor-help z-10 hover:z-20 transition-transform hover:scale-110"
                                        title={unitName}
                                    >
                                        {u.customIcon ? (
                                            <div className="w-6 h-6 rounded-full bg-black/40 border border-nr-border p-0.5 shadow-sm overflow-hidden flex items-center justify-center">
                                                <img src={u.customIcon} alt={unitName} className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-nr-accent border border-nr-bg flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                                {unitName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ==================== VIEW MODE ==================== */}
                {!isEditing && (
                    <>
                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-3 text-nr-text p-3 bg-nr-bg rounded-lg border border-nr-border">
                                <Clock className="text-nr-accent shrink-0" size={18} />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-nr-text/50 uppercase">{t('events.details.time')}</p>
                                    <p className="font-bold text-sm truncate">{DateFormatter.formatDate(event.start, lang)}</p>
                                    <p className="text-xs text-nr-text/70">
                                        {DateFormatter.formatTime(event.start, lang)}
                                        {event.end && ` – ${DateFormatter.formatTime(event.end, lang)}`}
                                    </p>
                                </div>
                            </div>

                            {event.serverName && (
                                <div className="flex items-center gap-3 text-nr-text p-3 bg-nr-bg rounded-lg border border-nr-border">
                                    <Globe className="text-nr-accent shrink-0" size={18} />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-nr-text/50 uppercase">{t('events.details.server')}</p>
                                        <p className="font-bold text-sm truncate">{event.serverName}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {description && (
                            <div className="mb-2">
                                <h4 className="font-bold text-xs text-nr-text/50 uppercase mb-2">{t('events.details.description')}</h4>
                                <p className="text-nr-text/90 text-sm leading-relaxed p-4 bg-nr-bg rounded-lg border border-nr-border">
                                    {description}
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* ==================== EDIT MODE ==================== */}
                {isEditing && (
                    <div className="space-y-4">
                        {/* Title */}
                        <div className={isDiscord ? lockedClass : ''}>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-nr-text/50 uppercase flex items-center gap-1.5">
                                    {isDiscord && <Lock size={10} />}
                                    {t('events.edit.title_placeholder')}
                                </label>
                                {!isDiscord && <LocaleTabBar activeLocale={titleLocale} onLocaleChange={setTitleLocale} />}
                            </div>
                            <input
                                type="text"
                                className={`${inputClass} ${titleError ? 'border-red-500 focus:border-red-500' : ''}`}
                                value={editTitle[titleLocale] || ''}
                                onChange={(e) => {
                                    setEditTitle({ ...editTitle, [titleLocale]: e.target.value });
                                    if (e.target.value.trim()) setTitleError(false);
                                }}
                                placeholder={t('events.edit.title_placeholder')}
                                disabled={isDiscord}
                            />
                            {titleError && (
                                <p className="text-red-500 text-[10px] mt-1 font-medium">
                                    {t('events.edit.title_required')}
                                </p>
                            )}
                            {isDiscord && (
                                <p className="text-[10px] text-purple-400/70 mt-1 flex items-center gap-1">
                                    <Lock size={8} /> {t('events.edit.discord_readonly')}
                                </p>
                            )}
                        </div>

                        {/* Time */}
                        <div className={`grid grid-cols-2 gap-3 ${isDiscord ? lockedClass : ''}`}>
                            <div>
                                <label className="text-xs font-bold text-nr-text/50 uppercase mb-1 flex items-center gap-1.5">
                                    {isDiscord && <Lock size={10} />}
                                    {t('events.details.time')} (start)
                                </label>
                                <input
                                    type="datetime-local"
                                    className={inputClass}
                                    value={editStart}
                                    onChange={(e) => setEditStart(e.target.value)}
                                    disabled={isDiscord}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-nr-text/50 uppercase mb-1 block">
                                    {t('events.details.time')} (end)
                                </label>
                                <input
                                    type="datetime-local"
                                    className={inputClass}
                                    value={editEnd}
                                    onChange={(e) => setEditEnd(e.target.value)}
                                    disabled={isDiscord}
                                />
                            </div>
                            {isDiscord && (
                                <p className="text-[10px] text-purple-400/70 col-span-2 flex items-center gap-1">
                                    <Lock size={8} /> {t('events.edit.discord_readonly')}
                                </p>
                            )}
                        </div>

                        {/* Server Name */}
                        <div>
                            <label className="text-xs font-bold text-nr-text/50 uppercase mb-1 block">
                                {t('events.details.server')}
                            </label>
                            <input
                                type="text"
                                className={inputClass}
                                value={editServerName}
                                onChange={(e) => setEditServerName(e.target.value)}
                                placeholder={t('events.edit.server_placeholder')}
                            />
                        </div>

                        {/* Event Type */}
                        <div>
                            <label className="text-xs font-bold text-nr-text/50 uppercase mb-1 block">
                                {t('events.edit.type')}
                            </label>
                            <div className="relative">
                                <select
                                    className={`${inputClass} appearance-none pr-8 cursor-pointer`}
                                    value={editTypeId}
                                    onChange={(e) => setEditTypeId(Number(e.target.value))}
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

                        {/* Participating Units */}
                        <div>
                            <label className="text-xs font-bold text-nr-text/50 uppercase mb-1.5 block">
                                {t('events.edit.units')}
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {unitTypes.map((ut) => {
                                    const isSelected = editUnitIds.includes(ut.id);
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

                        {/* Description */}
                        <div className={isDiscord ? lockedClass : ''}>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-nr-text/50 uppercase flex items-center gap-1.5">
                                    {isDiscord && <Lock size={10} />}
                                    {t('events.details.description')}
                                </label>
                                {!isDiscord && <LocaleTabBar activeLocale={descLocale} onLocaleChange={setDescLocale} />}
                            </div>
                            <textarea
                                className={`${inputClass} min-h-[80px] resize-y`}
                                value={editDescription[descLocale] || ''}
                                onChange={(e) => setEditDescription({ ...editDescription, [descLocale]: e.target.value })}
                                placeholder={t('events.edit.description_placeholder')}
                                disabled={isDiscord}
                                rows={3}
                            />
                            {isDiscord && (
                                <p className="text-[10px] text-purple-400/70 mt-1 flex items-center gap-1">
                                    <Lock size={8} /> {t('events.edit.discord_readonly')}
                                </p>
                            )}
                        </div>

                        {/* Save / Cancel */}
                        <div className="relative flex gap-2 pt-2">
                            {showModeDropdown && (
                                <SaveModeDropdown
                                    onSelect={handleSave}
                                    onCancel={() => setShowModeDropdown(false)}
                                    disabledModes={isDiscord ? ['FUTURE'] : []}
                                />
                            )}
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={onSaveClick}
                                disabled={isSaving}
                                className="flex-1"
                            >
                                {isSaving ? t('events.edit.saving') : t('events.edit.save')}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEdit}
                                disabled={isSaving}
                                className="flex-1"
                            >
                                {t('events.edit.cancel')}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Discord Sync Footer */}
                {event.source === 'DISCORD' && !isEditing && (
                    <div className="mt-8 pt-4 border-t border-purple-500/20 flex items-center justify-end gap-2.5">
                        <span className="text-[10px] font-bold text-purple-400/80 uppercase tracking-widest leading-none">{t('events.details.discord_sync')}</span>
                        <div className="bg-purple-500 p-1.5 rounded-lg shadow-lg shadow-purple-500/20">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default EventDetailModal;
