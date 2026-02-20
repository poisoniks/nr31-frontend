import React from 'react';
import { Flame, Github, Disc as Discord, Youtube, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="mt-auto border-t border-nr-border glass z-10 pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">

                {/* Left Column */}
                <div className="flex flex-col items-center md:items-start gap-2">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-8 h-8 bg-amber-600/20 rounded-full border border-amber-500/50 flex items-center justify-center transition">
                            <Flame size={16} className="text-amber-500" />
                        </div>
                        <span className="font-serif font-bold text-lg tracking-wider text-nr-text">NR31</span>
                    </div>
                    <p className="text-sm text-nr-text/60 mt-2">© {new Date().getFullYear()} NR31 Regiment. {t('footer.rights', 'All rights reserved.')}</p>
                </div>

                {/* Center Column */}
                <div className="flex flex-col items-center gap-2 text-sm text-nr-text/70">
                    <p>
                        {t('footer.developed_for', 'Розроблено для спільноти')} <span className="font-medium text-nr-accent">ЄУК</span>
                    </p>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-nr-text/50 hover:text-nr-text transition-colors">
                        <Github size={16} />
                        <span>{t('footer.repository', 'GitHub репозиторій')}</span>
                    </a>
                </div>

                {/* Right Column */}
                <div className="flex items-center justify-center md:justify-end gap-4">
                    <a href="#" className="p-2 rounded-full text-nr-text/60 hover:text-[#5865F2] hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <Discord size={24} />
                    </a>
                    <a href="#" className="p-2 rounded-full text-nr-text/60 hover:text-[#FF0000] hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <Youtube size={24} />
                    </a>
                    <a href="#" className="p-2 rounded-full text-nr-text/60 hover:text-[#0088cc] hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <Send size={24} />
                    </a>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
