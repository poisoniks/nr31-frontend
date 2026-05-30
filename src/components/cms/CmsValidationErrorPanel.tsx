import React from 'react';
import { AlertCircle, ArrowUpRight, X, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCmsStore } from '../../store/useCmsStore';
import { widgetRegistry } from './registry';

export const CmsValidationErrorPanel: React.FC = () => {
    const { t } = useTranslation();
    const validationErrors = useCmsStore(state => state.validationErrors);
    const clearValidationErrors = useCmsStore(state => state.clearValidationErrors);
    const pageData = useCmsStore(state => state.pageData);

    if (validationErrors.length === 0) return null;

    // Helper to find widget info in layout
    const findWidgetInfo = (widgetId: string) => {
        if (!pageData) return null;
        for (const slot of pageData.layoutData.slots) {
            const widget = slot.widgets.find(w => w.id === widgetId);
            if (widget) {
                return {
                    widget,
                    slotType: slot.slotType
                };
            }
        }
        return null;
    };

    const handleGoToWidget = (widgetId: string) => {
        const el = document.getElementById(`widget-${widgetId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a visual temporary highlight
            el.classList.add('ring-4', 'ring-red-500/50', 'ring-offset-2', 'ring-offset-white', 'dark:ring-offset-black');
            setTimeout(() => {
                el.classList.remove('ring-4', 'ring-red-500/50', 'ring-offset-2', 'ring-offset-white', 'dark:ring-offset-black');
            }, 2000);
        }
    };

    // Group errors by widgetId or general
    const groupedErrors = validationErrors.reduce((acc, err) => {
        const key = err.widgetId || 'layout';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(err);
        return acc;
    }, {} as Record<string, typeof validationErrors>);

    return (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-fade-in-up">
            <div className="glass-card border-2 border-red-500/40 dark:border-red-500/30 shadow-2xl rounded-2xl p-4 overflow-hidden max-h-[300px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-white/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="text-red-500 animate-pulse" size={18} />
                        <h3 className="font-serif font-bold text-sm tracking-wide text-red-600 dark:text-red-400">
                            {t('cms.validation_errors_title', { defaultValue: 'Validation Errors' })}
                        </h3>
                        <span className="text-xs bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-mono font-bold">
                            {validationErrors.length}
                        </span>
                    </div>
                    <button
                        onClick={clearValidationErrors}
                        className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5 rounded-lg p-1 transition-colors cursor-pointer"
                        title={t('cms.discard')}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Scrollable Error List */}
                <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <p className="text-xs text-neutral-500 dark:text-white/50 px-1 italic">
                        {t('cms.validation_errors_description', { defaultValue: 'The following issues must be fixed before saving:' })}
                    </p>
                    {Object.entries(groupedErrors).map(([key, errors]) => {
                        const isWidget = key !== 'layout';
                        const widgetInfo = isWidget ? findWidgetInfo(key) : null;
                        const registryEntry = widgetInfo ? widgetRegistry[widgetInfo.widget.type] : null;

                        return (
                            <div
                                key={key}
                                className="bg-neutral-50/80 border border-neutral-200 dark:bg-white/5 dark:border-white/10 rounded-xl p-3 space-y-1.5 transition-all hover:bg-neutral-100/80 dark:hover:bg-white/10"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        {registryEntry ? (
                                            <span className="text-nr-accent p-1 bg-nr-accent/10 rounded animate-fade-in">
                                                {registryEntry.icon}
                                            </span>
                                        ) : (
                                            <span className="text-red-500 p-1 bg-red-500/10 rounded">
                                                <Sparkles size={16} />
                                            </span>
                                        )}
                                        <span className="font-sans font-bold text-xs text-neutral-800 dark:text-white/90">
                                            {registryEntry
                                                ? t(registryEntry.labelKey)
                                                : t('cms.validation_error_layout', { defaultValue: 'Layout' })}
                                        </span>
                                        {widgetInfo && (
                                            <span className="text-[10px] text-neutral-400 dark:text-white/30 font-mono">
                                                {t(`cms.slot.${widgetInfo.slotType}`)}
                                            </span>
                                        )}
                                    </div>

                                    {isWidget && (
                                        <button
                                            onClick={() => handleGoToWidget(key)}
                                            className="flex items-center gap-1 text-[10px] font-bold text-nr-accent hover:text-nr-accent-hover transition-colors uppercase tracking-wider cursor-pointer"
                                        >
                                            {t('cms.validation_error_go_to_widget', { defaultValue: 'Go to widget' })}
                                            <ArrowUpRight size={12} />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-1 pl-1">
                                    {errors.map((err, i) => (
                                        <p key={i} className="text-xs text-red-600 dark:text-red-200/90 leading-relaxed font-sans">
                                            • {err.translatedMessage}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
