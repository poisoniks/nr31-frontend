import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { widgetRegistry } from './registry';
import { useCmsStore } from '../../store/useCmsStore';

interface AddWidgetPanelProps {
    slotType: string;
    onClose: () => void;
}

export const AddWidgetPanel: React.FC<AddWidgetPanelProps> = ({ slotType, onClose }) => {
    const { t } = useTranslation();
    const slotRestrictions = useCmsStore(state => state.slotRestrictions);
    const addWidget = useCmsStore(state => state.addWidget);
    const panelRef = useRef<HTMLDivElement>(null);

    const allowedTypes = slotRestrictions[slotType] || [];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleAdd = (type: string) => {
        // We create a dummy widget. The server should ideally provide a template,
        // but since we only have the type, we instantiate it with basic structure
        addWidget(slotType, { type } as any);
        onClose();
    };

    return (
        <div 
            ref={panelRef}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-nr-bg/95 backdrop-blur-xl border border-nr-border/60 shadow-xl rounded-xl z-50 overflow-hidden animate-fade-in-up"
        >
            <div className="p-3 border-b border-nr-border/50 bg-black/5 dark:bg-white/5">
                <h3 className="font-medium text-sm text-nr-text">{t('cms.add_widget')}</h3>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto flex flex-col gap-1">
                {allowedTypes.map(type => {
                    const entry = widgetRegistry[type];
                    if (!entry) return null;
                    return (
                        <button
                            key={type}
                            onClick={() => handleAdd(type)}
                            className="flex items-center gap-3 w-full p-2.5 hover:bg-nr-accent/10 hover:text-nr-accent rounded-lg text-left text-sm transition-colors text-nr-text/80 group"
                        >
                            <div className="text-nr-text/50 group-hover:text-nr-accent transition-colors">
                                {entry.icon}
                            </div>
                            <span className="font-medium">{t(entry.labelKey)}</span>
                        </button>
                    );
                })}
                {allowedTypes.length === 0 && (
                    <div className="p-4 text-center text-sm text-nr-text/50">
                        {t('cms.no_widgets')}
                    </div>
                )}
            </div>
        </div>
    );
};
