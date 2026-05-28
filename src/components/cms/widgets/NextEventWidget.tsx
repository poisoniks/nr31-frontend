import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calendarApi } from '../../../api/calendarApi';
import type { EventDTO } from '../../../api/calendarApi';
import { libraryApi } from '../../../api/libraryApi';
import type { WidgetDto } from '../../../api/cmsApi';
import Button from '../../ui/Button';

export const NextEventWidget: React.FC<{ widget: WidgetDto; isEditMode: boolean }> = ({ widget, isEditMode }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const lang = i18n.language.split('-')[0];
    const data = widget as any;

    const [nearestEvent, setNearestEvent] = useState<EventDTO | null>(null);
    const [loading, setLoading] = useState(!isEditMode);
    const [timeRemaining, setTimeRemaining] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isLessThan24h: false,
        inProgress: false
    });

    useEffect(() => {
        if (!isEditMode) {
            calendarApi.getNearestEvent(new Date().toISOString()).then(event => {
                setNearestEvent(event);
                setLoading(false);
            }).catch(() => {
                setNearestEvent(null);
                setLoading(false);
            });
        }
    }, [isEditMode]);

    const titleOverride = data.titleOverride?.[lang] || data.titleOverride?.['en'];

    useEffect(() => {
        if (!nearestEvent) {
            setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isLessThan24h: false, inProgress: false });
            return;
        }

        const updateCountdown = () => {
            const now = new Date();
            const start = new Date(nearestEvent.start);
            const end = nearestEvent.end ? new Date(nearestEvent.end) : new Date(start.getTime() + 60 * 60 * 1000);

            if (now >= start && now <= end) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isLessThan24h: false, inProgress: true });
                return;
            }

            let diffMs = start.getTime() - now.getTime();
            if (diffMs < 0) diffMs = 0;

            const isLessThan24h = diffMs < 24 * 60 * 60 * 1000;

            if (isLessThan24h) {
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
                setTimeRemaining({ days: 0, hours, minutes, seconds, isLessThan24h, inProgress: false });
            } else {
                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                setTimeRemaining({ days, hours, minutes, seconds: 0, isLessThan24h, inProgress: false });
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [nearestEvent]);

    const localized = (textObj?: Record<string, string>) => {
        if (!textObj) return '';
        return textObj[lang] || textObj['en'] || '';
    };

    if (isEditMode) {
        return (
            <div className="glass-card rounded-xl p-5 border border-dashed border-nr-border/50 text-center pointer-events-auto">
                <Swords size={32} className="mx-auto mb-3 text-nr-accent" />
                <h3 className="font-serif text-lg font-bold text-nr-text">{titleOverride || t('home.widgets.next_event')}</h3>
                <p className="text-sm text-nr-text/50">{t('cms.widget.next_event.auto_load_hint')}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="glass-card rounded-xl p-5 min-h-[250px] animate-pulse pointer-events-auto">
                <div className="h-6 bg-nr-text/10 rounded w-1/2 mb-4" />
                <div className="h-24 bg-nr-text/10 rounded mb-4" />
                <div className="h-6 bg-nr-text/10 rounded w-3/4 mb-6" />
                <div className="h-10 bg-nr-text/10 rounded w-full" />
            </div>
        );
    }

    if (!nearestEvent) {
        return (
            <div className="glass-card rounded-xl p-5 flex flex-col items-center justify-center min-h-[250px] text-nr-text/50 border border-nr-border/50 pointer-events-auto">
                <Swords size={32} className="mb-3 opacity-20" />
                <span className="font-medium">{t('cms.widget.next_event.no_events')}</span>
            </div>
        );
    }

    return (
        <div 
            className="glass-card rounded-xl p-5 relative overflow-hidden group/event border border-nr-border/50 hover:border-nr-accent/50 transition-colors cursor-pointer pointer-events-auto"
            onClick={() => navigate('/events')}
        >
            {timeRemaining.inProgress && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider rounded-bl-lg border-b border-l border-emerald-500/30 uppercase z-10 animate-pulse">
                    {t('cms.widget.next_event.in_progress')}
                </div>
            )}
            <h4 className="font-serif text-lg font-bold mb-4 flex items-center justify-between text-nr-text relative z-10">
                <div className="flex items-center gap-2">
                    {nearestEvent.type?.customIcon ? (
                        <img src={libraryApi.getFileUrl(nearestEvent.type.customIcon, 20)} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                        <Swords size={20} className="text-nr-accent" />
                    )}
                    <span>{titleOverride || t('home.widgets.next_event')}</span>
                </div>
                {!timeRemaining.inProgress && <span className="w-2 h-2 rounded-full bg-nr-accent animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>}
            </h4>
            
            <div className="bg-nr-text/5 dark:bg-black/40 border border-nr-border rounded-lg p-4 mb-4 text-center relative z-10 shadow-inner">
                {timeRemaining.inProgress ? (
                    <div className="font-serif text-2xl font-bold tracking-wider text-emerald-500 uppercase py-2 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                        {t('cms.widget.next_event.in_progress').toUpperCase()}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2 font-mono text-2xl md:text-3xl font-bold tracking-wider text-nr-accent mb-1 drop-shadow-[0_1px_1px_rgba(59,48,36,0.5)] dark:drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">
                        {timeRemaining.isLessThan24h ? (
                            <>
                                <div>{String(timeRemaining.hours).padStart(2, '0')}<span className="block mt-1 text-[10px] text-nr-text/50 font-sans font-medium uppercase tracking-widest">{t('time.hours')}</span></div>
                                <div>{String(timeRemaining.minutes).padStart(2, '0')}<span className="block mt-1 text-[10px] text-nr-text/50 font-sans font-medium uppercase tracking-widest">{t('time.minutes')}</span></div>
                                <div>{String(timeRemaining.seconds).padStart(2, '0')}<span className="block mt-1 px-1 text-[10px] text-nr-text/50 font-sans font-medium uppercase tracking-widest">{t('time.seconds')}</span></div>
                            </>
                        ) : (
                            <>
                                <div>{String(timeRemaining.days).padStart(2, '0')}<span className="block mt-1 text-[10px] text-nr-text/50 font-sans font-medium uppercase tracking-widest">{t('time.days')}</span></div>
                                <div>{String(timeRemaining.hours).padStart(2, '0')}<span className="block mt-1 text-[10px] text-nr-text/50 font-sans font-medium uppercase tracking-widest">{t('time.hours')}</span></div>
                                <div>{String(timeRemaining.minutes).padStart(2, '0')}<span className="block mt-1 px-1 text-[10px] text-nr-text/50 font-sans font-medium uppercase tracking-widest">{t('time.minutes')}</span></div>
                            </>
                        )}
                    </div>
                )}
            </div>
            
            <h5 className="font-serif text-xl font-bold text-center mb-5 text-nr-text drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] leading-tight">{localized(nearestEvent.title)}</h5>
            
            {nearestEvent.participatingUnits && nearestEvent.participatingUnits.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2.5 mb-6 relative z-10 p-3 bg-nr-text/5 dark:bg-white/5 rounded-lg border border-nr-border/30">
                    <div className="w-full text-center text-[10px] uppercase tracking-wider text-nr-text/50 font-bold mb-1 w-full">{t('cms.widget.next_event.units')}</div>
                    {nearestEvent.participatingUnits.map((unit: any) => (
                        <div key={unit.id} className="relative group cursor-help transition-transform hover:scale-110">
                            {unit.customIcon ? (
                                <img src={libraryApi.getFileUrl(unit.customIcon, 28)} alt={localized(unit.name)} className="w-7 h-7 object-contain drop-shadow-md" />
                            ) : (
                                <div className="w-7 h-7 bg-nr-border/50 rounded-sm flex items-center justify-center text-[10px] font-bold text-nr-text shadow-sm border border-nr-border">{localized(unit.name).substring(0,2)}</div>
                            )}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] bg-nr-bg/95 border border-nr-border text-nr-text text-[10px] sm:text-xs p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center pointer-events-none backdrop-blur-sm">
                                <div className="font-bold mb-1 text-nr-accent">{localized(unit.name)}</div>
                                {unit.description && <div className="text-nr-text/80 line-clamp-3">{localized(unit.description)}</div>}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-nr-border"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-3 relative z-10 w-full">
                <Button variant="primary" className="flex-1 shrink-0 py-2.5 justify-center w-full font-bold shadow-md hover:shadow-lg transition-all" onClick={(e) => { e.stopPropagation(); navigate('/events'); }}>
                    {t('cms.widget.next_event.view_calendar')}
                </Button>
                {timeRemaining.inProgress && (
                    <a 
                        href="https://discord.com/channels/454665524400619535/1311608584861257789" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block w-full transform hover:scale-[1.02] transition-transform"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button variant="secondary" className="justify-center w-full py-2.5 bg-[#5865F2] hover:bg-[#4752C4] shadow-[0_0_15px_rgba(88,101,242,0.4)] text-white border-none shrink-0 flex items-center gap-2 font-bold">
                            <span>{t('cms.widget.next_event.join_discord')}</span>
                        </Button>
                    </a>
                )}
            </div>
        </div>
    );
};
