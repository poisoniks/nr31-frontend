import React from 'react';

interface LocaleContextType {
    activeLocale: string;
    setActiveLocale: (locale: string) => void;
}

export const LocaleContext = React.createContext<LocaleContextType>({
    activeLocale: 'en',
    setActiveLocale: () => {},
});

export const useLocale = () => React.useContext(LocaleContext);
