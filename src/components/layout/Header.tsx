import React, { useState } from 'react';
import { Menu, Globe, Moon, Sun, Shield, LogIn, Swords } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../ThemeProvider';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();

    const navLinks = [
        { name: t('header.home', 'Головна'), path: '/' },
        { name: t('header.roster', 'Склад'), path: '/roster' },
        { name: t('header.events', 'Події'), path: '/events' },
        { name: t('header.admin', 'Адмін'), path: '/admin' }
    ];

    const toggleLanguage = () => {
        const newLang = i18n.language?.startsWith('uk') ? 'en' : 'uk';
        i18n.changeLanguage(newLang);
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full h-16 glass z-50 flex items-center justify-between transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 h-full w-full flex items-center justify-between">

                    {/* Left section */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-nr-text transition-colors"
                            aria-label="Toggle Menu"
                        >
                            <Menu size={24} />
                        </button>

                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-amber-600/20 rounded-full border border-amber-500/50 flex items-center justify-center group-hover:bg-amber-600/30 transition">
                                <Shield size={24} className="text-amber-500" />
                            </div>
                            <span className="font-serif font-bold text-xl tracking-wider text-nr-text group-hover:text-nr-accent transition-colors">NR31</span>
                        </Link>
                    </div>

                    {/* Center Navigation - Desktop */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium uppercase tracking-wide transition-colors relative px-2 py-1
                  ${location.pathname === link.path ? 'text-nr-accent' : 'text-nr-text/70 hover:text-nr-text'}
                `}
                            >
                                {link.name}
                                {location.pathname === link.path && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-nr-accent rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Right section */}
                    <div className="flex items-center gap-4">
                        <div
                            onClick={toggleLanguage}
                            className="hidden sm:flex items-center gap-2 hover:text-nr-text transition text-sm text-nr-text/70 cursor-pointer uppercase"
                        >
                            <span>{i18n.language || 'UA'}</span>
                            <Globe size={16} />
                        </div>

                        <button onClick={toggleTheme} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition text-nr-accent" aria-label="Toggle Theme">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button className="hidden md:flex px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded shadow-lg shadow-amber-900/40 transition-all transform hover:scale-105 items-center gap-2">
                            <span>{t('header.join', 'Вступити')}</span>
                            <Swords size={16} />
                        </button>

                        <button className="p-2 border border-nr-border rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition text-nr-text/80" aria-label="Login">
                            <LogIn size={20} />
                        </button>
                    </div>

                </div>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
};

export default Header;
