import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TipTapEditor } from '../richtext/TipTapEditor';
import { TipTapRenderer } from '../richtext/TipTapRenderer';
import type { WidgetDto } from '../../../api/cmsApi';
import LocaleTabBar from '../../ui/LocaleTabBar';
import { useCmsStore } from '../../../store/useCmsStore';

export const RichTextWidget: React.FC<{ widget: WidgetDto; isEditMode: boolean }> = ({ widget, isEditMode }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language.split('-')[0];
    const [activeLocale, setActiveLocale] = useState(currentLang);
    const updateWidget = useCmsStore(state => state.updateWidget);
    const pageData = useCmsStore(state => state.pageData);

    const bodyContent = (widget as any).bodyContent || {};
    
    // Local state to hold the current content being edited
    const [localContent, setLocalContent] = useState<Record<string, any>>(bodyContent);
    const debounceTimerRef = useRef<number | null>(null);

    // Sync local content when widget changes (e.g., locale switch or external update)
    useEffect(() => {
        setLocalContent(bodyContent);
    }, [widget]);

    const handleContentChange = useCallback((content: any) => {
        // Update local state immediately for responsive editing
        setLocalContent(prev => ({
            ...prev,
            [activeLocale]: content
        }));

        // Debounce the global store update
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            if (!pageData) return;

            let slotType = '';
            let widgetIndex = -1;
            
            for (const slot of pageData.layoutData.slots) {
                const index = slot.widgets.findIndex(w => w === widget);
                if (index !== -1) {
                    slotType = slot.slotType;
                    widgetIndex = index;
                    break;
                }
            }
            
            if (slotType && widgetIndex !== -1) {
                updateWidget(slotType, widgetIndex, {
                    ...widget,
                    bodyContent: {
                        ...bodyContent,
                        [activeLocale]: content
                    }
                } as any);
            }
        }, 500); // 500ms debounce delay
    }, [activeLocale, widget, pageData, updateWidget, bodyContent]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    if (isEditMode) {
        return (
            <div className="bg-nr-bg border border-nr-border/50 rounded-lg overflow-hidden flex flex-col pointer-events-auto">
                <LocaleTabBar activeLocale={activeLocale} onLocaleChange={setActiveLocale} />
                <div className="flex-1">
                    <TipTapEditor
                        key={activeLocale}
                        content={localContent[activeLocale]}
                        onChange={handleContentChange}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-xl relative overflow-hidden group pointer-events-auto">
            <div className="relative z-10">
                <TipTapRenderer content={bodyContent[currentLang] || bodyContent['en']} />
            </div>
        </div>
    );
};
