import React from 'react';
import { Swords } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTranslation, Trans } from 'react-i18next';
import DiscordWidget from '../components/ui/DiscordWidget';
import YoutubeWidget from '../components/ui/YoutubeWidget';

const Home: React.FC = () => {
    const { t } = useTranslation();

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
                        <div className="glass-card rounded-xl p-5">
                            <h4 className="font-serif text-lg font-bold mb-4 flex items-center justify-between text-nr-text">
                                <span>{t('home.widgets.next_event')}</span>
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            </h4>
                            <div className="bg-black/10 dark:bg-black/40 border border-nr-border rounded-lg p-4 mb-4 text-center">
                                <div className="grid grid-cols-3 gap-2 font-mono text-xl font-bold tracking-wider text-nr-accent mb-1">
                                    <div>02<span className="block text-[10px] text-nr-text/50 font-sans font-normal uppercase">{t('time.days')}</span></div>
                                    <div>14<span className="block text-[10px] text-nr-text/50 font-sans font-normal uppercase">{t('time.hours')}</span></div>
                                    <div>35<span className="block px-1 text-[10px] text-nr-text/50 font-sans font-normal uppercase">{t('time.minutes')}</span></div>
                                </div>
                            </div>
                            <h5 className="font-medium text-center mb-4 text-nr-text">Flagspawn event</h5>
                            <div className="flex gap-2">
                                <Button variant="primary" className="flex-1 shrink-0 py-2">{t('rsvp.yes')}</Button>
                                <Button variant="secondary" className="px-3 shrink-0" aria-label="Відмовляюсь">✕</Button>
                            </div>
                        </div>

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
        </div>
    );
};

export default Home;
