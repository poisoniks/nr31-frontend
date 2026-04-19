import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTranslation, Trans } from 'react-i18next';
import DiscordWidget from '../components/ui/DiscordWidget';
import YoutubeWidget from '../components/ui/YoutubeWidget';
import { calendarApi } from '../api/calendarApi';
import { libraryApi } from '../api/libraryApi';
import type { components } from '../api/types';

type CalendarEventDTO = components['schemas']['CalendarEventDTO'];
import EventDetailModal from '../components/events/EventDetailModal';

const Home: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const lang = (i18n.language || '').split('-')[0] || 'en';

    const [nearestEvent, setNearestEvent] = useState<CalendarEventDTO | null>(null);
    const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, inProgress: false });
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        fetchNearest();
    }, []);

    useEffect(() => {
        if (!nearestEvent) return;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const start = new Date(nearestEvent.start).getTime();
            const end = new Date(nearestEvent.end).getTime();

            if (now >= start && now <= end) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, inProgress: true });
            } else if (now > end) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, inProgress: false });
            } else {
                const diff = start - now;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeRemaining({ days, hours, minutes, inProgress: false });
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [nearestEvent]);

    const localized = (map: Record<string, string> | undefined) => {
        if (!map) return '';
        return map[lang] || Object.values(map)[0] || '';
    };

    const handleEventJoin = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!nearestEvent) return;
        const dateString = nearestEvent.start.split('T')[0];
        navigate(`/events?date=${dateString}`);
    };

    const fetchNearest = () => {
        const now = new Date().toISOString();
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        calendarApi.getNearestEvent(now, tz)
            .then(event => setNearestEvent(event))
            .catch((err) => console.error(err));
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[80vh] min-h-[600px] flex items-center bg-nr-bg border-b border-nr-border overflow-hidden">
                {/* Mock background image overlay */}
                <div className="absolute inset-0 hero-overlay z-10" />
                <img
                    src="/home_background.jpg"
                    alt="Battle"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />

                <div className="relative z-20 max-w-7xl mx-auto px-4 w-full flex flex-col items-center md:items-start text-center md:text-left mt-20 animate-fade-in-up">
                    <div className="inline-flex items-center rounded-full glass border border-nr-accent/20 px-4 py-1.5 text-sm font-bold text-nr-accent mb-6 shadow-sm dark:shadow-none transition-all">
                        <span>{t('home.hero.badge')}</span>
                    </div>
                    <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] dark:drop-shadow-lg">
                        <span className="block text-gold-gradient">Nr.31</span>
                        <span className="text-nr-text">Feldkanonenregiment</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-nr-text/80 mb-10 max-w-2xl font-light">
                        {t('home.hero.subtitle')}
                    </p>
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full md:w-auto flex justify-center items-center gap-2 font-bold shadow-lg shadow-amber-900/40 transform hover:scale-105"
                        onClick={() => document.getElementById('how-to-join')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <span>{t('home.hero.cta')}</span>
                        <Swords size={20} />
                    </Button>
                </div>
            </section>

            {/* Grid Layout Section */}
            <section className="flex-1 py-16 bg-nr-bg transition-colors">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content (70%) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* About Us Card */}
                        <div className="glass-card p-6 rounded-xl relative overflow-hidden group space-y-8">
                            <div className="relative z-10">
                                <h2 className="font-serif text-2xl font-bold text-nr-text mb-4">{t('home.about.title')}</h2>
                                <p className="text-nr-text/80 leading-relaxed">
                                    {t('home.about.text')}
                                </p>
                            </div>

                            {/* What we offer */}
                            <div className="relative z-10">
                                <h3 className="font-serif text-xl font-bold mb-3 text-nr-text">{t('home.join.offer.title')}</h3>
                                <ul className="space-y-2 text-nr-text/80 list-disc list-inside marker:text-nr-accent">
                                    {[0, 1, 2, 3, 4, 5].map(i => (
                                        <li key={i}>{t(`home.join.offer.items.${i}`)}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Command */}
                            <div className="relative z-10">
                                <h3 className="font-serif text-xl font-bold mb-3 text-nr-text">{t('home.join.command.title')}</h3>
                                <ul className="space-y-2 text-nr-text/80 list-disc list-inside marker:text-nr-accent">
                                    <li>{t('home.join.command.leader')}</li>
                                    <li>{t('home.join.command.officer1')}</li>
                                    <li>{t('home.join.command.officer2')}</li>
                                </ul>
                            </div>

                            {/* Important Links */}
                            <div className="relative z-10">
                                <h3 className="font-serif text-xl font-bold mb-3 text-nr-text">{t('home.join.links.title')}</h3>
                                <div className="flex flex-wrap gap-3">
                                    <a href="https://discord.gg/uuc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-black/5 dark:bg-black/20 hover:bg-nr-accent/10 px-4 py-2 rounded-lg border border-nr-border/50 transition-colors text-nr-text font-medium text-sm">
                                        {t('home.join.links.euc')}
                                    </a>
                                    <a href="https://www.fsegames.eu/forum/index.php?topic=49585.0" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-black/5 dark:bg-black/20 hover:bg-nr-accent/10 px-4 py-2 rounded-lg border border-nr-border/50 transition-colors text-nr-text font-medium text-sm">
                                        {t('home.join.links.forum')}
                                    </a>
                                    <a href="https://docs.google.com/spreadsheets/d/1kkzzUGL1VGYnH3OrzGC8TsalzWd42ZNYfP6yhvxPi7U/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-black/5 dark:bg-black/20 hover:bg-nr-accent/10 px-4 py-2 rounded-lg border border-nr-border/50 transition-colors text-nr-text font-medium text-sm">
                                        {t('home.join.links.roster')}
                                    </a>
                                    <a href="https://www.youtube.com/@silentfanat2698" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-black/5 dark:bg-black/20 hover:bg-nr-accent/10 px-4 py-2 rounded-lg border border-nr-border/50 transition-colors text-nr-text font-medium text-sm">
                                        {t('home.join.links.youtube')}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* How to join block */}
                        <div id="how-to-join" className="glass-card p-6 rounded-xl relative overflow-hidden group border border-amber-500/30 scroll-mt-24">
                            {/* How to join */}
                            <div className="relative z-10">
                                <h3 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-gold-gradient block">{t('home.join.how.title')}</h3>
                                <ul className="space-y-2 text-nr-text/80 list-disc list-inside marker:text-nr-accent">
                                    <li className="mb-4">
                                        {t('home.join.how.items.0')}
                                        <div className="flex flex-col gap-2 max-w-sm ml-4 lg:ml-6 mt-3">
                                            {[
                                                { name: 'Manul', steam: 'https://steamcommunity.com/profiles/76561198250504840' },
                                                { name: 'Dizhka', steam: 'https://steamcommunity.com/profiles/76561198871671245' },
                                                { name: 'GodyX', steam: 'https://steamcommunity.com/profiles/76561199466448146' }
                                            ].map(cmd => (
                                                <a
                                                    key={cmd.name}
                                                    href={cmd.steam}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between bg-black/5 dark:bg-white/5 px-4 py-3 rounded-lg border border-nr-border/50 transition-all hover:border-nr-accent/50 hover:bg-black/10 dark:hover:bg-white/10 group/cmd"
                                                >
                                                    <span className="font-bold text-nr-text group-hover/cmd:text-nr-accent transition-colors">{cmd.name}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </li>
                                    <li>
                                        <Trans
                                            i18nKey="home.join.how.items.1"
                                            components={{ 1: <a href="https://discord.gg/uuc" target="_blank" rel="noopener noreferrer" className="text-nr-accent hover:underline font-bold" /> }}
                                        />
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* News Feed */}
                        <div className="space-y-6">
                            <h3 className="font-serif text-xl font-bold flex items-center gap-2 text-nr-text">
                                <span className="w-2 h-2 rounded-full bg-nr-accent"></span>
                                {t('home.news.title')}
                            </h3>

                            {[1, 2].map(i => (
                                <div key={i} className="glass-card rounded-xl overflow-hidden flex flex-col sm:flex-row group hover:border-nr-accent/50 transition-colors">
                                    <div className="sm:w-1/3 aspect-video sm:aspect-auto bg-gray-200 overflow-hidden relative">
                                        <img
                                            src={`https://images.unsplash.com/photo-1582216171542-0f0e8fca7a72?q=80&w=600&auto=format&fit=crop&sig=${i}`}
                                            alt="News"
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-nr-accent mb-2 block">{t('home.news.tag')}</span>
                                            <h4 className="font-serif text-lg font-bold mb-2 text-nr-text group-hover:text-nr-accent transition-colors">{t('home.news.item.title')}</h4>
                                            <p className="text-sm text-nr-text/70 line-clamp-2">
                                                {t('home.news.item.text')}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pb-1 border-t border-nr-border/50 pt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-400"></div>
                                                <span className="text-xs text-nr-text/60">Col. Username • {t('home.news.item.ago')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Support Us */}
                        <div className="glass-card p-6 rounded-xl relative overflow-hidden group border border-nr-border/50">
                            <div className="relative z-10">
                                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 text-nr-text">{t('home.support.title')}</h3>
                                <div className="flex flex-col gap-3 max-w-sm ml-2 md:ml-4">
                                    <a
                                        href="https://send.monobank.ua/jar/3m9TAxi5Eb"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 bg-black/5 dark:bg-white/5 px-4 py-3 rounded-lg border border-nr-border/50 transition-all hover:border-nr-accent/50 hover:bg-black/10 dark:hover:bg-white/10 group/supp"
                                    >
                                        <img
                                            src="https://play-lh.googleusercontent.com/tVdBTQSX3ek05SxDZJClWtohEohC0EHLF7BRqzfq7tRsr3533ONjQxUd-pmQxjGtb2I=s48-rw"
                                            alt="Monobank"
                                            className="w-8 h-8 shrink-0 rounded-lg shadow-sm"
                                        />
                                        <span className="font-bold text-nr-text group-hover/supp:text-nr-accent transition-colors">{t('home.support.monobank')}</span>
                                    </a>

                                    <a
                                        href="https://next.privat24.ua/send/27n07"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 bg-black/5 dark:bg-white/5 px-4 py-3 rounded-lg border border-nr-border/50 transition-all hover:border-nr-accent/50 hover:bg-black/10 dark:hover:bg-white/10 group/supp"
                                    >
                                        <img
                                            src="https://next.privat24.ua/assets/912a277127b20d16edea.svg"
                                            alt="Privat24"
                                            className="w-8 h-8 shrink-0 rounded-lg shadow-sm"
                                        />
                                        <span className="font-bold text-nr-text group-hover/supp:text-nr-accent transition-colors">{t('home.support.privat24')}</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column / Widgets (30%) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Next Event Widget */}
                        {nearestEvent ? (
                            <div 
                                className="glass-card rounded-xl p-5 relative overflow-hidden group/event border border-nr-border/50 hover:border-nr-accent/50 transition-colors cursor-pointer"
                                onClick={() => setShowDetail(true)}
                            >
                                {timeRemaining.inProgress && (
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider rounded-bl-lg border-b border-l border-emerald-500/30 uppercase z-10 animate-pulse">
                                        {lang === 'uk' ? 'В ГРІ' : 'In Progress'}
                                    </div>
                                )}
                                <h4 className="font-serif text-lg font-bold mb-4 flex items-center justify-between text-nr-text relative z-10">
                                    <div className="flex items-center gap-2">
                                        {nearestEvent.type?.customIcon ? (
                                            <img src={libraryApi.getFileUrl(nearestEvent.type.customIcon, 20)} alt="" className="w-5 h-5 object-contain" />
                                        ) : (
                                            <Swords size={20} className="text-nr-accent" />
                                        )}
                                        <span>{t('home.widgets.next_event')}</span>
                                    </div>
                                    {!timeRemaining.inProgress && <span className="w-2 h-2 rounded-full bg-nr-accent animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>}
                                </h4>
                                
                                <div className="bg-black/10 dark:bg-black/40 border border-nr-border rounded-lg p-4 mb-4 text-center relative z-10 shadow-inner">
                                    {timeRemaining.inProgress ? (
                                        <div className="font-serif text-2xl font-bold tracking-wider text-emerald-500 uppercase py-2 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                                            {lang === 'uk' ? 'В ГРІ' : 'IN PROGRESS'}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2 font-mono text-2xl md:text-3xl font-bold tracking-wider text-nr-accent mb-1 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">
                                            <div>{String(timeRemaining.days).padStart(2, '0')}<span className="block mt-1 text-[10px] text-nr-text/50 font-sans font-medium uppercase tracking-widest">{t('time.days')}</span></div>
                                            <div>{String(timeRemaining.hours).padStart(2, '0')}<span className="block mt-1 text-[10px] text-nr-text/50 font-sans font-medium uppercase tracking-widest">{t('time.hours')}</span></div>
                                            <div>{String(timeRemaining.minutes).padStart(2, '0')}<span className="block mt-1 px-1 text-[10px] text-nr-text/50 font-sans font-medium uppercase tracking-widest">{t('time.minutes')}</span></div>
                                        </div>
                                    )}
                                </div>
                                
                                <h5 className="font-serif text-xl font-bold text-center mb-5 text-nr-text drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] leading-tight">{localized(nearestEvent.title)}</h5>
                                
                                {nearestEvent.participatingUnits && nearestEvent.participatingUnits.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-2.5 mb-6 relative z-10 p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-nr-border/30">
                                        <div className="w-full text-center text-[10px] uppercase tracking-wider text-nr-text/50 font-bold mb-1 w-full">{lang === 'uk' ? 'Підрозділи' : 'Units'}</div>
                                        {nearestEvent.participatingUnits.map(unit => (
                                            <div key={unit.id} className="relative group cursor-help transition-transform hover:scale-110">
                                                {unit.customIcon ? (
                                                    <img src={libraryApi.getFileUrl(unit.customIcon, 28)} alt={localized(unit.name)} className="w-7 h-7 object-contain drop-shadow-md" />
                                                ) : (
                                                    <div className="w-7 h-7 bg-nr-border/50 rounded-sm flex items-center justify-center text-[10px] font-bold text-nr-text shadow-sm border border-nr-border">{localized(unit.name).substring(0,2)}</div>
                                                )}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] bg-nr-bg/95 border border-nr-border text-nr-text text-[10px] sm:text-xs p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center pointer-events-none backdrop-blur-sm">
                                                    <div className="font-bold mb-1 text-nr-accent">{localized(unit.name)}</div>
                                                    {unit.description && <div className="text-nr-text/80 line-clamp-3">{localized(unit.description)}</div>}
                                                    {/* Little arrow at the bottom of tooltip */}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-nr-border"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 relative z-10 w-full">
                                    <Button variant="primary" className="flex-1 shrink-0 py-2.5 justify-center w-full font-bold shadow-md hover:shadow-lg transition-all" onClick={handleEventJoin}>
                                        {lang === 'uk' ? 'Перейти в календар' : 'View in Calendar'}
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
                                                <span>{lang === 'uk' ? 'Приєднатись до Discord' : 'Join Discord Voice'}</span>
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card rounded-xl p-5 flex flex-col items-center justify-center min-h-[250px] text-nr-text/50 border border-nr-border/50">
                                <Swords size={32} className="mb-3 opacity-20" />
                                <span className="font-medium">{lang === 'uk' ? 'Немає майбутніх подій' : 'No upcoming events'}</span>
                            </div>
                        )}

                        {/* Discord Widget */}
                        <div className="glass-card rounded-xl overflow-hidden h-[400px]">
                            <DiscordWidget />
                        </div>

                        {/* Media Widget */}
                        <div className="glass-card rounded-xl overflow-hidden relative">
                            <YoutubeWidget />
                        </div>

                    </div>

                </div>
            </section>

            {nearestEvent && (
                <EventDetailModal
                    event={nearestEvent}
                    isOpen={showDetail}
                    onClose={() => setShowDetail(false)}
                    onEventUpdated={() => {
                        setShowDetail(false);
                        fetchNearest();
                    }}
                />
            )}
        </div>
    );
};

export default Home;
