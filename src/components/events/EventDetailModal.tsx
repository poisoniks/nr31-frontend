import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin, Users, Globe } from 'lucide-react';
import Modal from '../ui/Modal';
import type { CalendarEventDTO } from '../../types/calendar';

interface EventDetailModalProps {
    event: CalendarEventDTO | null;
    onClose: () => void;
}

const localized = (map: Record<string, string> | undefined, lang: string): string => {
    if (!map) return '';
    return map[lang] || map['en'] || Object.values(map)[0] || '';
};

const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
};

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language?.startsWith('uk') ? 'uk' : 'en';

    if (!event) return null;

    const title = localized(event.title, lang);
    const description = localized(event.description, lang);
    const typeName = localized(event.type?.name, lang);

    return (
        <Modal isOpen={!!event} onClose={onClose} title={title}>
            {/* Type badge */}
            <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-nr-accent/20 text-nr-accent border border-nr-accent/30">
                    {typeName}
                </span>
                {event.recurring && (
                    <span className="inline-block ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        ↻ {t('events.details.recurring')}
                    </span>
                )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-3 text-nr-text p-3 bg-nr-bg rounded-lg border border-nr-border">
                    <Clock className="text-nr-accent shrink-0" size={18} />
                    <div className="min-w-0">
                        <p className="text-[10px] text-nr-text/50 uppercase">{t('events.details.time')}</p>
                        <p className="font-bold text-sm truncate">{formatDate(event.start)}</p>
                        <p className="text-xs text-nr-text/70">
                            {formatTime(event.start)}
                            {event.end && ` – ${formatTime(event.end)}`}
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

                {event.participatingUnits && event.participatingUnits.length > 0 && (
                    <div className="flex items-center gap-3 text-nr-text p-3 bg-nr-bg rounded-lg border border-nr-border col-span-2">
                        <Users className="text-nr-accent shrink-0" size={18} />
                        <div className="min-w-0">
                            <p className="text-[10px] text-nr-text/50 uppercase">{t('events.details.units')}</p>
                            <p className="font-bold text-sm">
                                {event.participatingUnits.map(u => localized(u.name, lang)).join(', ')}
                            </p>
                        </div>
                    </div>
                )}

                {event.source && (
                    <div className="flex items-center gap-3 text-nr-text p-3 bg-nr-bg rounded-lg border border-nr-border">
                        <MapPin className="text-nr-accent shrink-0" size={18} />
                        <div className="min-w-0">
                            <p className="text-[10px] text-nr-text/50 uppercase">{t('events.details.source')}</p>
                            <p className="font-bold text-sm">{event.source}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Description */}
            {description && (
                <div>
                    <h4 className="font-bold text-xs text-nr-text/50 uppercase mb-2">{t('events.details.description')}</h4>
                    <p className="text-nr-text/90 text-sm leading-relaxed p-4 bg-nr-bg rounded-lg border border-nr-border">
                        {description}
                    </p>
                </div>
            )}
        </Modal>
    );
};

export default EventDetailModal;
