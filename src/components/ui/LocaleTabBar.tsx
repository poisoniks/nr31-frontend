import React, { useEffect, useState } from 'react';
import { calendarApi } from '../../api/calendarApi';
import type { SupportedLocaleDTO } from '../../types/calendar';

interface LocaleTabBarProps {
    activeLocale: string;
    onLocaleChange: (locale: string) => void;
}

let cachedLocales: SupportedLocaleDTO[] | null = null;

const LocaleTabBar: React.FC<LocaleTabBarProps> = ({ activeLocale, onLocaleChange }) => {
    const [locales, setLocales] = useState<SupportedLocaleDTO[]>(cachedLocales || []);

    useEffect(() => {
        if (cachedLocales) return;
        calendarApi.getSupportedLocales().then((data) => {
            cachedLocales = data;
            setLocales(data);
        });
    }, []);

    if (locales.length === 0) return null;

    return (
        <div className="flex items-end gap-0.5 -mb-px">
            {locales.map((locale) => {
                const isActive = activeLocale === locale.code;
                return (
                    <button
                        key={locale.id}
                        onClick={() => onLocaleChange(locale.code)}
                        className={`
                            px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                            rounded-t-md border border-b-0 transition-all duration-150 cursor-pointer
                            ${isActive
                                ? 'bg-nr-bg text-nr-accent border-nr-border z-10 -mb-px'
                                : 'bg-nr-surface/50 text-nr-text/40 border-transparent hover:text-nr-text/60 hover:bg-nr-surface/80'
                            }
                        `}
                        title={locale.description}
                    >
                        {locale.code}
                    </button>
                );
            })}
        </div>
    );
};

export default LocaleTabBar;
