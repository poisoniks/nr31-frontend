import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, Trash2, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WidgetDto } from '../../api/cmsApi';

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
            ref={setNodeRef}
            style={style}
            className="group relative"
        >
            {/* Edit mode hover border */}
            <div className="absolute -inset-1 border-2 border-transparent group-hover:border-nr-accent/30 rounded-2xl pointer-events-none z-40 transition-colors" />

            {/* Toolbar that appears on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-50 bg-black/80 backdrop-blur-md rounded-lg p-1 border border-nr-border/50 shadow-lg">
                <div
                    {...attributes}
                    {...listeners}
                    className="p-1.5 text-nr-text/60 hover:text-nr-text hover:bg-white/10 rounded cursor-grab active:cursor-grabbing"
                    title={t('cms.drag_reorder')}
                >
                    <GripVertical size={16} />
                </div>

                <button
                    onClick={(e) => { e.preventDefault(); onEditSettings?.(); }}
                    className="p-1.5 text-nr-text/60 hover:text-nr-text hover:bg-white/10 rounded"
                    title={t('cms.settings')}
                >
                    <Settings size={16} />
                </button>

                <button
                    onClick={(e) => { e.preventDefault(); onDuplicate?.(); }}
                    className="p-1.5 text-nr-text/60 hover:text-nr-text hover:bg-white/10 rounded"
                    title={t('cms.duplicate')}
                >
                    <Copy size={16} />
                </button>

                <div className="w-px h-4 bg-white/20 mx-1" />

                <button
                    onClick={(e) => { e.preventDefault(); onDelete?.(); }}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
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
