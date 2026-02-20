import React from 'react';
import { Disc as Discord } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[80vh] min-h-[600px] flex items-center bg-[#020617] border-b border-nr-border overflow-hidden">
                {/* Mock background image overlay */}
                <div className="absolute inset-0 hero-overlay z-10" />
                <img
                    src="/home_background.jpg"
                    alt="Battle"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />

                <div className="relative z-20 max-w-7xl mx-auto px-4 w-full flex flex-col items-center md:items-start text-center md:text-left mt-20 animate-fade-in-up">
                    <div className="inline-flex items-center rounded-full border border-nr-accent/30 bg-nr-accent/10 px-3 py-1 text-sm font-medium text-nr-accent mb-6 backdrop-blur-md">
                        <span>{t('home.hero.badge', 'Частина ЄУК Community')}</span>
                    </div>
                    <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
                        <span className="block text-gold-gradient">NR31</span>
                        <span className="text-nr-text">Feldkanonenregiment</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-nr-text/80 mb-10 max-w-2xl font-light">
                        {t('home.hero.subtitle', 'Стань артилеристом імператорської армії. Приєднуйся до найактивнішого україномовного полку в Mount & Blade Warband: Napoleonic Wars.')}
                    </p>
                    <Button variant="primary" size="lg" className="text-lg w-full md:w-auto shadow-lg shadow-nr-accent/20 hover:scale-105 transition-transform">
                        {t('home.hero.cta', 'Приєднатися до Discord')}
                    </Button>
                </div>
            </section>

            {/* Grid Layout Section */}
            <section className="flex-1 py-16 bg-nr-bg transition-colors">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content (70%) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* About Us Card */}
                        <div className="glass-card p-6 rounded-xl shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition transform group-hover:scale-110">
                                <Discord size={120} className="text-nr-accent" />
                            </div>
                            <h2 className="font-serif text-2xl font-bold text-nr-text mb-4 relative z-10">{t('home.about.title', 'Про полк')}</h2>
                            <p className="text-nr-text/80 mb-6 leading-relaxed relative z-10">
                                {t('home.about.text', 'Ми — група ентузіастів, які грають у Mount & Blade: Warband з доповненням Napoleonic Wars. Наш полк відтворює 31-й польовий артилерійський полк (Feldkanonenregiment Nr. 31) Австрійської Імперії. Ми регулярно беремо участь у лінійних битвах, осадах та івентах спільноти ЄУК.')}
                            </p>
                            <Button variant="secondary" className="relative z-10">{t('home.about.button', 'Читати історію')}</Button>
                        </div>

                        {/* News Feed */}
                        <div className="space-y-6">
                            <h3 className="font-serif text-xl font-bold flex items-center gap-2 text-nr-text">
                                <span className="w-2 h-2 rounded-full bg-nr-accent"></span>
                                {t('home.news.title', 'Останні новини')}
                            </h3>

                            {[1, 2].map(i => (
                                <div key={i} className="glass-card rounded-xl overflow-hidden flex flex-col sm:flex-row group hover:border-nr-accent/50 transition-colors shadow-sm">
                                    <div className="sm:w-1/3 aspect-video sm:aspect-auto bg-gray-200 overflow-hidden relative">
                                        <img
                                            src={`https://images.unsplash.com/photo-1582216171542-0f0e8fca7a72?q=80&w=600&auto=format&fit=crop&sig=${i}`}
                                            alt="News"
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-nr-accent mb-2 block">{t('home.news.tag', 'Івент')}</span>
                                            <h4 className="font-serif text-lg font-bold mb-2 text-nr-text group-hover:text-nr-accent transition-colors">{t('home.news.item.title', 'Перемога на Гранд Кампанії')}</h4>
                                            <p className="text-sm text-nr-text/70 line-clamp-2">
                                                {t('home.news.item.text', 'Дякуємо всім бійцям, які взяли участь у вчорашньому івенті. Наша батарея показала найкращий результат серед союзників, знищивши до 40 піхотинців...')}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pb-1 border-t border-nr-border/50 pt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-400"></div>
                                                <span className="text-xs text-nr-text/60">Col. Username • {t('home.news.item.ago', '2 дні тому')}</span>
                                            </div>
                                            <button className="text-xs font-medium text-nr-accent hover:underline">{t('home.news.comments', 'Коментарі')} (5)</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* EUC Block */}
                        <div className="glass-card p-1 rounded-xl shadow-md border-2 border-blue-500/30">
                            <div className="bg-blue-900/10 dark:bg-blue-950/30 h-full rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border border-blue-400/30 shrink-0">
                                    <span className="font-bold text-xl text-blue-900">ЄУК</span>
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold mb-2 text-nr-text">{t('home.euk.title', 'Об\'єднана Українська Спільнота')}</h3>
                                    <p className="text-sm text-nr-text/70">
                                        {t('home.euk.text', 'NR31 є гордою частиною ЄУК. Долучайтеся до нас на масштабних щотижневих івентах, де ми боремося пліч-о-пліч з іншими україномовними полками.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column / Widgets (30%) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Next Event Widget */}
                        <div className="glass-card rounded-xl p-5 shadow-sm sticky top-24">
                            <h4 className="font-serif text-lg font-bold mb-4 flex items-center justify-between text-nr-text">
                                <span>{t('home.widgets.next_event', 'Наступна подія')}</span>
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            </h4>
                            <div className="bg-black/10 dark:bg-black/40 border border-nr-border rounded-lg p-4 mb-4 text-center">
                                <div className="grid grid-cols-3 gap-2 font-mono text-xl font-bold tracking-wider text-nr-accent mb-1">
                                    <div>02<span className="block text-[10px] text-nr-text/50 font-sans font-normal uppercase">{t('time.days', 'Дні')}</span></div>
                                    <div>14<span className="block text-[10px] text-nr-text/50 font-sans font-normal uppercase">{t('time.hours', 'Год')}</span></div>
                                    <div>35<span className="block px-1 text-[10px] text-nr-text/50 font-sans font-normal uppercase">{t('time.minutes', 'Хв')}</span></div>
                                </div>
                            </div>
                            <h5 className="font-medium text-center mb-4 text-nr-text">ЄУК Public Linebattle</h5>
                            <div className="flex gap-2">
                                <Button variant="primary" className="flex-1 shrink-0 py-2">{t('rsvp.yes', 'Я буду')}</Button>
                                <Button variant="secondary" className="px-3 shrink-0" aria-label="Відмовляюсь">✕</Button>
                            </div>
                        </div>

                        {/* Discord Widget */}
                        <div className="glass-card rounded-xl border border-[#5865F2]/20 p-5 shadow-sm">
                            <h4 className="font-serif text-lg font-bold mb-4 flex items-center gap-2 text-[#5865F2]">
                                <Discord size={20} />
                                <span>Discord</span>
                            </h4>
                            <div className="flex items-center gap-2 text-sm mb-4 text-nr-text">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="font-medium">45 Online</span>
                            </div>
                            <div className="flex -space-x-2 overflow-hidden mb-6">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-nr-surface" src={`https://i.pravatar.cc/100?img=${i}`} alt="Online user" />
                                ))}
                            </div>
                            <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white">Connect</Button>
                        </div>

                        {/* Media Widget */}
                        <div className="glass-card aspect-9/16 rounded-xl overflow-hidden relative group">
                            <img src="https://images.unsplash.com/photo-1542502690-0b6dc0863bb5?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" alt="Video thumbnail" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 glass rounded-full flex items-center justify-center cursor-pointer group-hover:bg-nr-accent transition-colors">
                                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <h5 className="text-white font-serif font-bold text-sm drop-shadow-md">{t('home.widgets.latest_short', 'Новий Short: Зарядка гармати за 10с')}</h5>
                            </div>
                        </div>

                    </div>

                </div>
            </section>
        </div>
    );
};

export default Home;
