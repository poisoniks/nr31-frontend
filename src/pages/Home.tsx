import React from 'react';
import { Swords } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
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
                        <span className="block text-gold-gradient">NR31</span>
                        <span className="text-nr-text">Feldkanonenregiment</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-nr-text/80 mb-10 max-w-2xl font-light">
                        {t('home.hero.subtitle')}
                    </p>
                    <Button variant="primary" size="lg" className="w-full md:w-auto flex justify-center items-center gap-2 font-bold shadow-lg shadow-amber-900/40 transform hover:scale-105">
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
                        <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
                            <h2 className="font-serif text-2xl font-bold text-nr-text mb-4 relative z-10">{t('home.about.title')}</h2>
                            <p className="text-nr-text/80 mb-6 leading-relaxed relative z-10">
                                {t('home.about.text')}
                            </p>
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
                                            <button className="text-xs font-medium text-nr-accent hover:underline">{t('home.news.comments')} (5)</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* EUC Block */}
                        <div className="glass-card p-1 rounded-xl border-2 border-blue-500/30">
                            <div className="bg-blue-900/10 dark:bg-blue-950/30 h-full rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border border-blue-400/30 shrink-0">
                                    <span className="font-bold text-xl text-blue-900">ЄУК</span>
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold mb-2 text-nr-text">{t('home.euk.title')}</h3>
                                    <p className="text-sm text-nr-text/70">
                                        {t('home.euk.text')}
                                    </p>
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
                            <h5 className="font-medium text-center mb-4 text-nr-text">ЄУК Public Linebattle</h5>
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
