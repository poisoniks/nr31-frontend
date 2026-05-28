import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, Trash2, Copy, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WidgetDto } from '../../api/cmsApi';
import { useCmsStore } from '../../store/useCmsStore';

interface WidgetWrapperProps {
    widget: WidgetDto;
    widgetId: string;
    index: number;
    slotType: string;
    isEditMode: boolean;
    children: React.ReactNode;
    onEditSettings?: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
    widget,
    widgetId,
    index,
    slotType,
    isEditMode,
    children,
    onEditSettings,
    onDelete,
    onDuplicate
}) => {
    const { t } = useTranslation();
    const id = widgetId;
    const validationErrors = useCmsStore(state => state.validationErrors);
    const hasError = validationErrors.some(err => err.widgetId === widgetId);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id,
        data: {
            type: 'Widget',
            widget,
            index,
            slotType,
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    if (!isEditMode) {
        return <>{children}</>;
    }

    return (
        <div
            id={`widget-${widgetId}`}
            ref={setNodeRef}
            style={style}
            className="group relative"
        >
            {/* Edit mode error/hover border */}
            <div className={`absolute -inset-1 border-2 rounded-2xl pointer-events-none z-40 transition-all ${
                hasError 
                    ? 'border-red-500/60 bg-red-500/[0.02] shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-pulse' 
                    : 'border-transparent group-hover:border-nr-accent/30'
            }`} />

            {/* Error indicator banner */}
            {hasError && (
                <div className="absolute top-2 left-2 z-50 bg-red-600 text-white rounded-full p-1 shadow-lg shadow-red-950/50 border border-red-500 flex items-center gap-1.5 px-2 py-0.5 select-none animate-bounce">
                    <AlertCircle size={12} className="shrink-0 animate-pulse" />
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider">
                        {t('cms.validation_error_badge', { defaultValue: 'Issue' })}
                    </span>
                </div>
            )}

            {/* Toolbar that appears on hover */}
            <div className={`absolute ${
                widget.type === 'hero'
                    ? 'bottom-2 right-2'
                    : widget.type === 'richtext'
                        ? 'top-2 left-1/2 -translate-x-1/2'
                        : 'top-2 right-2'
            } opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-50 glass-card rounded-lg p-1 border border-nr-border/50 shadow-lg`}>
                <div
                    {...attributes}
                    {...listeners}
                    className="p-1.5 text-nr-text/60 hover:text-nr-text hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-grab active:cursor-grabbing"
                    title={t('cms.drag_reorder')}
                >
                    <GripVertical size={16} />
                </div>

                <button
                    onClick={(e) => { e.preventDefault(); onEditSettings?.(); }}
                    className="p-1.5 text-nr-text/60 hover:text-nr-text hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
                    title={t('cms.settings')}
                >
                    <Settings size={16} />
                </button>

                <button
                    onClick={(e) => { e.preventDefault(); onDuplicate?.(); }}
                    className="p-1.5 text-nr-text/60 hover:text-nr-text hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
                    title={t('cms.duplicate')}
                >
                    <Copy size={16} />
                </button>

                <div className="w-px h-4 bg-nr-border mx-1" />

                <button
                    onClick={(e) => { e.preventDefault(); onDelete?.(); }}
                    className="p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded cursor-pointer"
                    title={t('cms.delete')}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className={isDragging ? 'pointer-events-none' : ''}>
                {children}
            </div>
        </div>
    );
};
