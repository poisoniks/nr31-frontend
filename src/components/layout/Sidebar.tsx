import React from 'react';
import { X, Book, FileText, History, Info, Moon, Sun, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../ThemeProvider';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { theme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();

    const sidebarClasses = `fixed inset-y-0 left-0 z-50 w-64 glass shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`;

    const overlayClasses = `fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`;

    const additionalLinks = [
        { name: t('sidebar.wiki', 'Вікіпедія полку'), icon: <Book size={18} />, path: '#' },
        { name: t('sidebar.rules', 'Правила сервера'), icon: <FileText size={18} />, path: '#' },
        { name: t('sidebar.history', 'Історія'), icon: <History size={18} />, path: '#' },
        { name: t('sidebar.about', 'Про нас'), icon: <Info size={18} />, path: '#' },
    ];

    const toggleLanguage = () => {
        const newLang = i18n.language?.startsWith('uk') ? 'en' : 'uk';
        i18n.changeLanguage(newLang);
    };

    return (
        <>
            <div className={overlayClasses} onClick={onClose} />

            <div className={sidebarClasses}>
                <div className="flex flex-col h-full bg-nr-bg/40">
                    <div className="h-16 flex items-center justify-between px-4 border-b border-nr-border">
                        <span className="font-serif font-bold text-xl text-nr-text">{t('sidebar.menu', 'Меню')}</span>
                        <button onClick={onClose} className="p-2 rounded-md hover:bg-nr-border/50 text-nr-text transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                        <nav className="flex flex-col gap-1 px-3 mb-8 md:hidden">
                            <Link to="/" onClick={onClose} className="px-3 py-2 text-nr-text hover:bg-nr-border/50 rounded-md font-medium">{t('header.home', 'Головна')}</Link>
                            <Link to="/roster" onClick={onClose} className="px-3 py-2 text-nr-text hover:bg-nr-border/50 rounded-md font-medium">{t('header.roster', 'Склад')}</Link>
                            <Link to="/events" onClick={onClose} className="px-3 py-2 text-nr-text hover:bg-nr-border/50 rounded-md font-medium">{t('header.events', 'Події')}</Link>
                            <Link to="/admin" onClick={onClose} className="px-3 py-2 text-nr-text hover:bg-nr-border/50 rounded-md font-medium">{t('header.admin', 'Адмін')}</Link>
                        </nav>

                        <div className="px-4 mb-2 text-xs font-semibold uppercase text-nr-text/50 tracking-wider">{t('sidebar.additional', 'Додатково')}</div>
                        <nav className="flex flex-col gap-1 px-3">
                            {additionalLinks.map((link, idx) => (
                                <a key={idx} href={link.path} className="flex items-center gap-3 px-3 py-2 text-nr-text/80 hover:text-nr-text hover:bg-nr-border/50 rounded-md transition-colors">
                                    {link.icon}
                                    <span className="font-medium">{link.name}</span>
                                </a>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-nr-border flex items-center justify-around gap-2 text-sm bg-nr-surface/30">
                        <button onClick={toggleLanguage} className="flex items-center gap-2 p-2 hover:bg-nr-border/50 rounded flex-1 justify-center transition-colors">
                            <Globe size={18} />
                            <span className="uppercase">{i18n.language || 'UA'}</span>
                        </button>
                        <div className="w-px h-6 bg-nr-border"></div>
                        <button onClick={toggleTheme} className="flex items-center gap-2 p-2 hover:bg-nr-border/50 rounded flex-1 justify-center transition-colors">
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
