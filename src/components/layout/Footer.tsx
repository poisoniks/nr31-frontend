import React from 'react';
import { Github, Disc as Discord, Youtube, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="mt-auto border-t border-nr-border glass z-10 pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">

                {/* Left Column */}
                <div className="flex flex-col items-center md:items-start gap-2">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:bg-amber-500/10 relative">
                            <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <img
                                src="/Nr31FKR_logo-no-back.png"
                                alt="NR31 Logo"
                                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_2px_rgba(251,191,36,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] transition-all duration-500"
                            />
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
