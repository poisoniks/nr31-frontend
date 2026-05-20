import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TipTapEditor } from '../richtext/TipTapEditor';
import { TipTapRenderer } from '../richtext/TipTapRenderer';
import { JsonSidePanel } from '../richtext/JsonSidePanel';
import { CopyDefinitionsButton } from '../richtext/CopyDefinitionsButton';
import type { WidgetDto } from '../../../api/cmsApi';
import LocaleTabBar from '../../ui/LocaleTabBar';
import { Code } from 'lucide-react';
import { useCmsStore } from '../../../store/useCmsStore';

export const RichTextWidget: React.FC<{ widget: WidgetDto; isEditMode: boolean }> = ({ widget, isEditMode }) => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language.split('-')[0];
    const [activeLocale, setActiveLocale] = useState(currentLang);
    const updateWidget = useCmsStore(state => state.updateWidget);
    const pageData = useCmsStore(state => state.pageData);

    const bodyContent = (widget as any).bodyContent || {};
    
    // Local state to hold the current content being edited
    const [localContent, setLocalContent] = useState<Record<string, any>>(bodyContent);
    const debounceTimerRef = useRef<number | null>(null);

    // JSON Editor states
    const activeJsonEditorWidgetId = useCmsStore(state => state.activeJsonEditorWidgetId);
    const setActiveJsonEditorWidgetId = useCmsStore(state => state.setActiveJsonEditorWidgetId);
    const isSidePanelOpen = activeJsonEditorWidgetId === widget.id;
    const setIsSidePanelOpen = (open: boolean) => {
        setActiveJsonEditorWidgetId(open ? widget.id : null);
    };


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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            setActiveJsonEditorWidgetId(null);
        };
    }, [setActiveJsonEditorWidgetId]);

    if (isEditMode) {
        return (
            <div className="bg-nr-bg border border-nr-border/50 rounded-lg flex flex-col pointer-events-auto">
                <div className="flex justify-between items-center px-4 py-2 border-b border-nr-border/30 bg-nr-surface/30">
                    <div className="flex items-center gap-1">
                        <CopyDefinitionsButton />
                        <button
                            type="button"
                            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
                                isSidePanelOpen
                                    ? 'text-nr-accent bg-nr-accent/15 hover:bg-nr-accent/25'
                                    : 'text-nr-text/50 hover:text-nr-accent hover:bg-nr-accent/10'
                            }`}
                            title={t('kb.open_json_editor', { defaultValue: 'Open JSON Editor' })}
                        >
                            <Code size={16} />
                        </button>
                    </div>
                    <LocaleTabBar activeLocale={activeLocale} onLocaleChange={setActiveLocale} />
                </div>
                <div className="flex-1">
                    <TipTapEditor
                        key={activeLocale}
                        content={localContent[activeLocale]}
                        onChange={handleContentChange}
                    />
                </div>
                <JsonSidePanel
                    isOpen={isSidePanelOpen}
                    onClose={() => setIsSidePanelOpen(false)}
                    content={localContent[activeLocale]}
                    onChange={handleContentChange}
                />
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-xl relative overflow-hidden group space-y-8 pointer-events-auto">
            <div className="relative z-10">
                <TipTapRenderer content={bodyContent[currentLang] || bodyContent['en']} />
            </div>
        </div>
    );
};
