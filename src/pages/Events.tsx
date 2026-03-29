import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { calendarApi } from '../api/calendarApi';
import type { CalendarEventDTO } from '../types/calendar';
import EventDetailModal from '../components/events/EventDetailModal';
import EventCreateModal from '../components/events/EventCreateModal';
import { DateFormatter } from '../utils/dateFormatter';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

type ViewMode = 'week' | 'month';

const localized = (map: Record<string, string> | undefined, lang: string): string => {
    if (!map) return '';
    if (!map) return '';
    return map[lang] || Object.values(map)[0] || '';
};

// ── Date helpers ──

const getWeekRange = (date: Date): { from: Date; to: Date } => {
    const d = new Date(date);
    const day = d.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const from = new Date(d);
    from.setDate(d.getDate() + diffToMon);
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    to.setHours(23, 59, 59, 999);
    return { from, to };
};

const getMonthRange = (date: Date): { from: Date; to: Date } => {
    const from = new Date(date.getFullYear(), date.getMonth(), 1);
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    to.setHours(23, 59, 59, 999);
    return { from, to };
};

const formatDateParam = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const formatWeekLabel = (from: Date, to: Date, lang: string): string => {
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const locale = lang || 'en';
    return `${from.toLocaleDateString(locale, opts)} – ${to.toLocaleDateString(locale, { ...opts, year: 'numeric' })}`;
};

const formatMonthLabel = (date: Date, lang: string): string => {
    const locale = lang || 'en';
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
};

const getDaysOfWeek = (lang: string): string[] => {
    const locale = lang || 'en';
    const base = new Date(2024, 0, 1); // Monday
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        days.push(d.toLocaleDateString(locale, { weekday: 'short' }));
    }
    return days;
};

const isSameDay = (a: Date, b: Date): boolean =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isToday = (d: Date): boolean => isSameDay(d, new Date());

// ── Cache ──
const eventsCache: Record<string, CalendarEventDTO> = {};
const fetchedRangesCache = new Set<string>();

// ── Components ──

const EventBox = ({ ev, lang, onClick }: { ev: CalendarEventDTO, lang: string, onClick: () => void }) => {
    const isDiscord = ev.source === 'DISCORD';
    
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-1 md:p-1.5 rounded-md transition-colors cursor-pointer flex flex-col gap-1 group overflow-hidden relative ${ev.cancelled ? 'grayscale opacity-60' : ''} ${
                isDiscord 
                ? 'bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50' 
                : 'bg-nr-accent/10 border border-nr-accent/20 hover:bg-nr-accent/20 hover:border-nr-accent/40'
            }`}
        >
            <div className="flex items-center gap-1.5 w-full">
                {ev.type?.customIcon ? (
                    <img src={ev.type.customIcon} alt="" className="w-3 h-3 md:w-4 md:h-4 object-contain shrink-0" />
                ) : (
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-nr-accent/50 shrink-0" />
                )}
                <span className={`text-[10px] md:text-xs font-medium text-nr-text truncate transition-colors ${ev.cancelled ? 'line-through' : (isDiscord ? 'group-hover:text-purple-400' : 'group-hover:text-nr-accent')}`}>
                    {localized(ev.title, lang)}
                </span>
            </div>
            <div className="flex items-center justify-between w-full mt-0.5">
                <span className={`text-[9px] md:text-[10px] text-nr-text/70 ${ev.cancelled ? 'line-through' : ''}`}>
                    {DateFormatter.formatTime(ev.start, lang)}
                </span>
                {ev.participatingUnits && ev.participatingUnits.length > 0 && (
                    <div className="flex -space-x-1 shrink-0 ml-1">
                        {ev.participatingUnits.slice(0, 4).map(unit => (
                            <div 
                                key={unit.id}
                                title={localized(unit.description || unit.name, lang)}
                                className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-nr-accent/60 border border-nr-bg flex items-center justify-center text-[7px] md:text-[8px] font-bold text-white shadow-sm"
                            >
                                {localized(unit.name, lang).charAt(0).toUpperCase()}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isDiscord && (
                <div className="absolute bottom-1 right-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-purple-400">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
                    </svg>
                </div>
            )}
        </button>
    );
};

const Events: React.FC = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || '').split('-')[0] || 'en';
    const user = useAuthStore((s) => s.user);
    const canCreate = user?.authorities?.includes('event:write') ?? false;

    const location = useLocation();
    
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentDate, setCurrentDate] = useState(() => {
        const queryDate = new URLSearchParams(location.search).get('date');
        const parsed = queryDate ? new Date(queryDate) : new Date();
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    });
    const [events, setEvents] = useState<CalendarEventDTO[]>([]);
    const [showSpinner, setShowSpinner] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEventDTO | null>(null);
    const [createDate, setCreateDate] = useState<Date | null>(null);
    const { setError } = useUIStore();

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const fetchEvents = useCallback(async () => {
        const { from, to } = viewMode === 'week' ? getWeekRange(currentDate) : getMonthRange(currentDate);
        const cacheKey = `${formatDateParam(from)}_${formatDateParam(to)}`;

        if (fetchedRangesCache.has(cacheKey)) {
            setEvents(Object.values(eventsCache));
            return;
        }

        setShowSpinner(false);
        const spinnerTimer = setTimeout(() => setShowSpinner(true), 2000);

        try {
            const data = await calendarApi.getEvents(formatDateParam(from), formatDateParam(to), timezone);
            data.forEach(ev => {
                const key = `${ev.id}_${ev.start}`;
                eventsCache[key] = ev;
            });
            fetchedRangesCache.add(cacheKey);
            setEvents(Object.values(eventsCache));
        } catch (err) {
            console.error('Failed to fetch events', err);
        } finally {
            clearTimeout(spinnerTimer);
            setShowSpinner(false);
        }
    }, [currentDate, viewMode, timezone]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const navigatePrev = () => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            if (viewMode === 'week') d.setDate(d.getDate() - 7);
            else d.setMonth(d.getMonth() - 1);
            return d;
        });
    };

    const navigateNext = () => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            if (viewMode === 'week') d.setDate(d.getDate() + 7);
            else d.setMonth(d.getMonth() + 1);
            return d;
        });
    };

    const { from: rangeFrom, to: rangeTo } = viewMode === 'week' ? getWeekRange(currentDate) : getMonthRange(currentDate);
    const headerLabel = viewMode === 'week'
        ? formatWeekLabel(rangeFrom, rangeTo, lang)
        : formatMonthLabel(currentDate, lang);

    const daysOfWeek = getDaysOfWeek(lang);

    const getEventsForDay = (date: Date): CalendarEventDTO[] => {
        return events.filter(ev => {
            const evDate = new Date(ev.start);
            return isSameDay(evDate, date);
        });
    };

    // ── Week View ──
    const renderWeekView = () => {
        const weekDays: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(rangeFrom);
            d.setDate(rangeFrom.getDate() + i);
            weekDays.push(d);
        }

        return (
            <div className="grid grid-cols-7 gap-2 md:gap-3">
                {weekDays.map((day, i) => {
                    const dayEvents = getEventsForDay(day);
                    const today = isToday(day);

                    return (
                        <div key={i} className="min-h-[120px] md:min-h-[200px] flex flex-col">
                            {/* Day header */}
                            <div className={`text-center py-2 rounded-t-lg border border-b-0 border-nr-border ${today ? 'bg-nr-accent/20' : 'bg-black/5 dark:bg-white/5'}`}>
                                <p className="text-[10px] md:text-xs font-medium text-nr-text/50 uppercase">{daysOfWeek[i]}</p>
                                <p className={`text-sm md:text-lg font-bold ${today ? 'text-nr-accent' : 'text-nr-text'}`}>
                                    {day.getDate()}
                                </p>
                            </div>

                            {/* Events column */}
                            <div
                                className={`flex-1 border border-t-0 border-nr-border rounded-b-lg p-1 md:p-2 space-y-1.5 bg-nr-surface/30 ${canCreate ? 'cursor-pointer hover:bg-nr-accent/5 transition-colors' : ''}`}
                                onClick={(e) => {
                                    if (canCreate && e.target === e.currentTarget) {
                                        setCreateDate(new Date(day));
                                    }
                                }}
                            >
                                {dayEvents.map(ev => (
                                    <EventBox key={`${ev.id}_${ev.start}`} ev={ev} lang={lang} onClick={() => setSelectedEvent(ev)} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // ── Month View ──
    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();

        // Monday = 0, Sunday = 6
        let startDay = firstDayOfMonth.getDay() - 1;
        if (startDay < 0) startDay = 6;

        return (
            <>
                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 gap-1 md:gap-3 mb-2">
                    {daysOfWeek.map((name, i) => (
                        <div key={i} className="text-center font-bold text-nr-text/60 text-xs md:text-sm py-2 bg-black/5 dark:bg-white/5 rounded-md">
                            {name}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-3">
                    {/* Empty cells before month starts */}
                    {[...Array(startDay)].map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-nr-bg/10 rounded-lg p-2 opacity-30 border border-nr-border border-dashed" />
                    ))}

                    {/* Days of the month */}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const date = new Date(year, month, i + 1);
                        const dayKey = date.toISOString();
                        const dayEvents = getEventsForDay(date);
                        const hasActiveEvents = dayEvents.some(ev => !ev.cancelled);
                        const today = isToday(date);

                        return (
                            <div
                                key={dayKey}
                                className={`aspect-square p-1 md:p-2 rounded-lg border transition-all flex flex-col overflow-hidden
                                    ${hasActiveEvents ? 'border-nr-border bg-nr-bg shadow-sm hover:border-nr-accent cursor-pointer' : `border-nr-border/50 bg-nr-surface/30 ${canCreate ? 'hover:border-nr-accent/40 hover:bg-nr-accent/5 cursor-pointer' : ''}`}
                                    ${today ? 'ring-2 ring-nr-accent ring-offset-2 ring-offset-nr-bg' : ''}
                                `}
                                onClick={(e) => {
                                    if (canCreate && e.target === e.currentTarget) {
                                        setCreateDate(new Date(date));
                                    }
                                }}
                            >
                                <span className={`font-medium text-xs md:text-sm ${today ? 'text-nr-accent font-bold' : 'text-nr-text/70'}`}>
                                    {i + 1}
                                </span>

                                {dayEvents.length > 0 && (
                                    <div className="mt-1 w-full space-y-1">
                                        {dayEvents.slice(0, 2).map(ev => (
                                            <EventBox key={`${ev.id}_${ev.start}`} ev={ev} lang={lang} onClick={() => setSelectedEvent(ev)} />
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <p className="text-[9px] text-nr-text/50 text-center">+{dayEvents.length - 2}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24 min-h-screen relative z-10 w-full animate-fade-in-up">
            {/* Page header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
                <div>
                    <h1 className="font-serif text-4xl font-bold text-nr-text mb-2 drop-shadow-md">
                        {t('events.title_part1')} <span className="text-gold-gradient">{t('events.title_part2')}</span>
                    </h1>
                </div>

                {/* View toggle */}
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === 'week' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('week')}
                    >
                        {t('events.view.week')}
                    </Button>
                    <Button
                        variant={viewMode === 'month' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('month')}
                    >
                        {t('events.view.month')}
                    </Button>
                </div>
            </div>

            <div className="glass-card rounded-xl shadow-sm p-4 md:p-8">
                {/* Navigation header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-nr-border">
                    <Button variant="ghost" size="sm" className="hover:bg-nr-border/20" onClick={navigatePrev}>
                        <ChevronLeft size={20} /> {t('events.calendar.prev')}
                    </Button>
                    <span className="font-serif font-bold text-lg md:text-xl text-nr-text capitalize">{headerLabel}</span>
                    <Button variant="ghost" size="sm" className="hover:bg-nr-border/20" onClick={navigateNext}>
                        {t('events.calendar.next')} <ChevronRight size={20} />
                    </Button>
                </div>

                {/* Content */}
                <div className="relative min-h-[400px]">
                    {showSpinner && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-nr-bg/50 backdrop-blur-sm rounded-xl">
                            <Loader2 className="animate-spin text-nr-accent" size={32} />
                            <span className="ml-3 text-nr-text/60 mt-2">{t('events.loading')}</span>
                        </div>
                    )}

                    {viewMode === 'week' ? renderWeekView() : renderMonthView()}
                </div>
            </div>

            {/* Event detail modal */}
            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEventUpdated={() => {
                    Object.keys(eventsCache).forEach(key => delete eventsCache[key]);
                    fetchedRangesCache.clear();
                    fetchEvents();
                    setSelectedEvent(null);
                }}
            />

            {/* Event create modal */}
            <EventCreateModal
                isOpen={!!createDate}
                initialDate={createDate}
                onClose={() => setCreateDate(null)}
                onCreated={() => {
                    Object.keys(eventsCache).forEach(key => delete eventsCache[key]);
                    fetchedRangesCache.clear();
                    fetchEvents();
                }}
                onError={(msg) => setError(msg)}
            />
        </div>
    );
};

export default Events;
