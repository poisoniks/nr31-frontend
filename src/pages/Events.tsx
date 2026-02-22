import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, X } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

// Mock data
type EventType = 'battle' | 'training' | 'meeting';

interface MockEvent {
    id: number;
    date: number;
    title: string;
    type: EventType;
    time: string;
    map: string;
    faction: string;
    going: number;
    description: string;
}

const mockEvents: MockEvent[] = [
    { id: 1, date: 5, title: "Public Linebattle", type: "battle", time: "20:00", map: "Austrian Fields", faction: "Austria", going: 24, description: "Щотижневий івент від спільноти ЄУК. Збираємось на 19:30 у голосовому." },
    { id: 2, date: 12, title: "Training", type: "training", time: "19:00", map: "Drill Square", faction: "Austria", going: 18, description: "Відпрацювання стройового кроку та швидкості ведення вогню." },
    { id: 3, date: 15, title: "Grand Campaign", type: "battle", time: "18:00", map: "Waterloo", faction: "Austria", going: 45, description: "Масштабна кампанія з іншими полками. Обов'язкова явка!" },
    { id: 4, date: 24, title: "Officers Meeting", type: "meeting", time: "21:00", map: "Discord", faction: "-", going: 5, description: "Збори для обговорення планів на наступний місяць." }
];

const EventTypes = {
    battle: { color: "bg-red-500", labelKey: "events.types.battle", defaultLabel: "Битва" },
    training: { color: "bg-green-500", labelKey: "events.types.training", defaultLabel: "Тренування" },
    meeting: { color: "bg-blue-500", labelKey: "events.types.meeting", defaultLabel: "Збори" }
};

const Events: React.FC = () => {
    const { t } = useTranslation();
    const [selectedEvent, setSelectedEvent] = useState<MockEvent | null>(null);

    const daysInMonth = 28; // Feb 2026 for mock
    const startingDay = 6; // starts on Saturday for mock
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24 min-h-screen relative z-10 w-full animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
                <div>
                    <h1 className="font-serif text-4xl font-bold text-nr-text mb-2 drop-shadow-md">
                        {t('events.title_part1')} <span className="text-gold-gradient">{t('events.title_part2')}</span>
                    </h1>
                    <p className="text-nr-text/60">{t('events.month_year')}</p>
                </div>

                <div className="flex gap-4 text-sm text-nr-text">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> {t('events.types.battle')}</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> {t('events.types.training')}</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span> {t('events.types.meeting')}</span>
                </div>
            </div>

            <div className="glass-card rounded-xl shadow-sm p-4 md:p-8">

                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-nr-border">
                    <Button variant="ghost" size="sm" className="hover:bg-nr-border/20">
                        <ChevronLeft size={20} /> {t('events.calendar.prev')}
                    </Button>
                    <span className="font-serif font-bold text-xl text-nr-text">{t('events.month_year')}</span>
                    <Button variant="ghost" size="sm" className="hover:bg-nr-border/20">
                        {t('events.calendar.next')} <ChevronRight size={20} />
                    </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 md:gap-4 mb-4">
                    {daysOfWeek.map((_, index) => (
                        <div key={index} className="text-center font-bold text-nr-text/60 text-xs md:text-sm py-2 bg-black/5 dark:bg-white/5 rounded-md">
                            {t(`events.days.${index}`)}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2 md:gap-4">
                    {/* Empty cells */}
                    {[...Array(startingDay)].map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-nr-bg/10 rounded-lg p-2 opacity-50 border border-nr-border border-dashed"></div>
                    ))}

                    {/* Days */}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const date = i + 1;
                        const eventInfo = mockEvents.find(e => e.date === date);
                        const isToday = date === 20;

                        return (
                            <div
                                key={date}
                                onClick={() => eventInfo && setSelectedEvent(eventInfo)}
                                className={`aspect-square p-1 md:p-2 rounded-lg border transition-all cursor-pointer relative group flex flex-col items-center md:items-start
                  ${eventInfo ? 'border-nr-border bg-nr-bg shadow hover:border-nr-accent' : 'border-nr-border/50 bg-nr-surface/30 hover:bg-black/5 dark:hover:bg-white/5'}
                  ${isToday ? 'ring-2 ring-nr-accent ring-offset-2 ring-offset-nr-bg' : ''}
                `}
                            >
                                <span className={`font-medium text-xs md:text-sm ${isToday ? 'text-nr-accent font-bold' : 'text-nr-text/70'}`}>
                                    {date}
                                </span>

                                {eventInfo && (
                                    <div className="mt-auto w-full">
                                        <div className={`${EventTypes[eventInfo.type].color} h-1.5 md:h-1 w-1/2 mx-auto md:w-full rounded-full md:rounded-sm mb-1`}></div>
                                        <div className={`${EventTypes[eventInfo.type].color}/20 text-${EventTypes[eventInfo.type].color.replace('bg-', '')} border border-${EventTypes[eventInfo.type].color.replace('bg-', '')}/30 text-[10px] p-1 rounded font-medium hidden md:block truncate`}>
                                            {eventInfo.time} {eventInfo.title}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Event Details Popover (Modal) */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
                    <div className="glass-card rounded-xl shadow-2xl relative z-10 w-full max-w-lg border border-nr-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className={`${EventTypes[selectedEvent.type].color} px-6 py-4 flex items-start justify-between text-white`}>
                            <div>
                                <div className="text-xs font-bold tracking-wider uppercase opacity-80 mb-1">{t(EventTypes[selectedEvent.type].labelKey, EventTypes[selectedEvent.type].defaultLabel)}</div>
                                <h3 className="font-serif text-2xl font-bold">{selectedEvent.title}</h3>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-black/20 rounded transition-colors"><X size={24} /></button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
                                <div className="flex items-center gap-3 text-nr-text p-3 bg-nr-bg rounded border border-nr-border">
                                    <Clock className="text-nr-accent" size={20} />
                                    <div><p className="text-xs text-nr-text/50 uppercase">{t('events.details.time')}</p><p className="font-bold">{selectedEvent.time}</p></div>
                                </div>
                                <div className="flex items-center gap-3 text-nr-text p-3 bg-nr-bg rounded border border-nr-border">
                                    <MapPin className="text-nr-accent" size={20} />
                                    <div><p className="text-xs text-nr-text/50 uppercase">{t('events.details.location')}</p><p className="font-bold">{selectedEvent.map}</p></div>
                                </div>
                                <div className="flex items-center gap-3 text-nr-text p-3 bg-nr-bg rounded border border-nr-border">
                                    <span className="font-serif font-bold text-nr-accent text-xl w-5 text-center px-1 border border-nr-accent rounded">F</span>
                                    <div><p className="text-xs text-nr-text/50 uppercase">{t('events.details.faction')}</p><p className="font-bold">{selectedEvent.faction}</p></div>
                                </div>
                                <div className="flex items-center gap-3 text-nr-text p-3 bg-nr-bg rounded border border-nr-border">
                                    <Users className="text-nr-accent" size={20} />
                                    <div><p className="text-xs text-nr-text/50 uppercase">{t('events.details.attendance')}</p><p className="font-bold">{selectedEvent.going} {t('events.details.members_count')}</p></div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="font-bold text-sm text-nr-text/50 uppercase mb-2">{t('events.details.description_title')}</h4>
                                <p className="text-nr-text/90 leading-relaxed p-4 bg-nr-bg rounded border border-nr-border">{selectedEvent.description}</p>
                            </div>

                            {/* RSVP Actions */}
                            <div className="pt-6 border-t border-nr-border flex gap-4">
                                <Button variant="primary" className="flex-1 shadow-lg shadow-nr-accent/20">{t('rsvp.actions.confirm')}</Button>
                                <Button variant="secondary" className="flex-1">{t('rsvp.actions.decline')}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
