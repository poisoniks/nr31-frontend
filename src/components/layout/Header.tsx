import React, { useState } from 'react';
import { Menu, Globe, Moon, Sun, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../ThemeProvider';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/useAuthStore';

const Header: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const user = useAuthStore(state => state.user);
    const hasAdminPermission = user?.authorities?.includes('admin:view') ?? false;

    const navLinks = [
        { name: t('header.home'), path: '/' },
        { name: t('header.roster'), path: '/roster' },
        { name: t('header.events'), path: '/events' },
        ...(hasAdminPermission ? [{ name: t('header.admin'), path: '/admin' }] : [])
    ];

    const toggleLanguage = () => {
        const newLang = i18n.language?.startsWith('uk') ? 'en' : 'uk';
        i18n.changeLanguage(newLang);
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full h-16 glass border-b border-nr-border z-50 flex items-center justify-between transition-all duration-300">
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
                            <div className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] group-hover:bg-amber-500/10 relative">
                                <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <img
                                    src="/Nr31FKR_logo-no-back.png"
                                    alt="NR31 Logo"
                                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_2px_rgba(251,191,36,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] transition-all duration-500"
                                />
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

                        <Button variant="ghost" size="icon" className="border border-nr-border text-nr-text/80" aria-label="Login">
                            <LogIn size={20} />
                        </Button>
                    </div>

                </div>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
};

export default Header;
