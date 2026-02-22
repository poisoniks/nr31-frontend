import React from 'react';
import { Github, Youtube } from 'lucide-react';
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
                                alt="Nr.31 FKR Logo"
                                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_2px_rgba(251,191,36,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] transition-all duration-500"
                            />
                        </div>
                        <span className="font-serif font-bold text-lg tracking-wider text-nr-text">Nr.31 FKR</span>
                    </div>
                    <p className="text-sm text-nr-text/60 mt-2">© {new Date().getFullYear()} Nr.31 FKR Regiment. {t('footer.rights')}</p>
                </div>

                {/* Center Column */}
                <div className="flex flex-col items-center gap-2 text-sm text-nr-text/70">
                    <p>
                        {t('footer.developed_for')} <span className="font-medium text-nr-accent">ЄУК</span>
                    </p>
                    <div className="relative group/github flex items-center justify-center">
                        <div className="flex items-center gap-1 text-nr-text/50 hover:text-nr-text transition-colors cursor-pointer pb-2">
                            <Github size={16} />
                            <span>{t('footer.repository')}</span>
                        </div>
                        <div className="absolute bottom-full mb-0 left-1/2 -translate-x-1/2 opacity-0 invisible group-hover/github:opacity-100 group-hover/github:visible transition-all duration-300 flex flex-col glass-card rounded-xl p-1.5 gap-1 min-w-max z-50 shadow-lg">
                            <a href="https://github.com/poisoniks/nr31-frontend" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-nr-text/70 hover:text-nr-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors px-4 py-2 rounded-lg text-center">
                                Frontend
                            </a>
                            <a href="https://github.com/poisoniks/nr31-backend" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-nr-text/70 hover:text-nr-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors px-4 py-2 rounded-lg text-center">
                                Backend
                            </a>
                            <a href="https://github.com/poisoniks/nr31-infra" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-nr-text/70 hover:text-nr-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors px-4 py-2 rounded-lg text-center">
                                Infra
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex items-center justify-center md:justify-end gap-2 md:gap-4">
                    <a href="https://discord.com/invite/uuc" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-nr-text/60 hover:text-[#5865F2] hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="Discord">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                        </svg>
                    </a>
                    <div className="relative group/youtube flex items-center justify-center">
                        <div className="p-2 pb-4 -mb-2 rounded-full text-nr-text/60 hover:text-[#FF0000] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer" title="YouTube">
                            <Youtube size={24} />
                        </div>
                        <div className="absolute bottom-full mb-0 left-1/2 -translate-x-1/2 opacity-0 invisible group-hover/youtube:opacity-100 group-hover/youtube:visible transition-all duration-300 flex flex-col glass-card rounded-xl p-1.5 gap-1 min-w-max z-50 shadow-lg">
                            <a href="https://www.youtube.com/@MrRifleman1706" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-nr-text/70 hover:text-[#FF0000] hover:bg-black/5 dark:hover:bg-white/10 transition-colors px-4 py-2 rounded-lg text-center">
                                @MrRifleman1706
                            </a>
                            <a href="https://www.youtube.com/@silentfanat2698" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-nr-text/70 hover:text-[#FF0000] hover:bg-black/5 dark:hover:bg-white/10 transition-colors px-4 py-2 rounded-lg text-center">
                                @silentfanat2698
                            </a>
                        </div>
                    </div>
                    <a href="https://www.tiktok.com/@nr31feldkanonenregiment" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-nr-text/60 hover:text-black dark:hover:text-[#00f2fe] hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="TikTok">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
                        </svg>
                    </a>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
