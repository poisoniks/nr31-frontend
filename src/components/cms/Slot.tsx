import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { widgetRegistry } from './registry';
import { WidgetWrapper } from './WidgetWrapper';
import { AddWidgetPanel } from './AddWidgetPanel';
import { useCmsStore } from '../../store/useCmsStore';
import type { SlotDto, WidgetDto } from '../../api/cmsApi';
import type { WidgetWithUiId } from '../../store/useCmsStore';

interface SlotProps {
    slot: SlotDto;
    isEditMode: boolean;
    onEditSettings?: (widget: WidgetDto, index: number, slotType: string) => void;
}

export const Slot: React.FC<SlotProps> = ({ slot, isEditMode, onEditSettings }) => {
    const { t } = useTranslation();
    const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
    const removeWidget = useCmsStore(state => state.removeWidget);
    const addWidget = useCmsStore(state => state.addWidget);

    const { setNodeRef, isOver } = useDroppable({
        id: slot.slotType,
        data: {
            type: 'Slot',
            slotType: slot.slotType,
        }
    });

    const widgetIds = (slot.widgets as WidgetWithUiId[]).map(w => w._uiId);

    const handleDuplicate = (widget: WidgetDto) => {
        const clone = JSON.parse(JSON.stringify(widget));
        delete (clone as any)._uiId;
        addWidget(slot.slotType, clone);
    };

    return (
        <div
            ref={isEditMode ? setNodeRef : undefined}
            className={`flex flex-col gap-4 relative min-h-[50px] transition-all ${isEditMode && isOver ? 'bg-nr-accent/5 rounded-xl border border-nr-accent/30' : ''
                }`}
        >
            {isEditMode ? (
                <SortableContext items={widgetIds} strategy={verticalListSortingStrategy}>
                    {slot.widgets.map((widget, index) => {
                        const Entry = widgetRegistry[widget.type];
                        if (!Entry) return null;

                        const widgetWithId = widget as WidgetWithUiId;

                        return (
                            <WidgetWrapper
                                key={widgetWithId._uiId}
                                widget={widget}
                                widgetId={widgetWithId._uiId}
                                index={index}
                                slotType={slot.slotType}
                                isEditMode={isEditMode}
                                onEditSettings={() => onEditSettings?.(widget, index, slot.slotType)}
                                onDelete={() => {
                                    if (window.confirm(t('cms.confirm_delete_widget'))) {
                                        removeWidget(slot.slotType, index);
                                    }
                                }}
                                onDuplicate={() => handleDuplicate(widget)}
                            >
                                <Entry.component widget={widget} isEditMode={isEditMode} />
                            </WidgetWrapper>
                        );
                    })}
                </SortableContext>
            ) : (
                slot.widgets.map((widget, index) => {
                    const Entry = widgetRegistry[widget.type];
                    if (!Entry) return null;
                    const widgetWithId = widget as WidgetWithUiId;
                    return <Entry.component key={widgetWithId._uiId || `${slot.slotType}-${index}`} widget={widget} isEditMode={false} />;
                })
            )}

            {isEditMode && (
                <div className="relative mt-2">
                    <button
                        onClick={() => setIsAddPanelOpen(!isAddPanelOpen)}
                        className="w-full py-3 border-2 border-dashed border-nr-border/40 hover:border-nr-accent/50 rounded-xl text-nr-text/40 hover:text-nr-accent transition-colors flex items-center justify-center gap-2 group cursor-pointer"
                    >
                        <div className="p-1 rounded-full bg-black/5 dark:bg-white/5 group-hover:bg-nr-accent/10 transition-colors">
                            <Plus size={16} />
                        </div>
                        <span className="font-medium text-sm">{t('cms.add_widget')}</span>
                    </button>

                    {isAddPanelOpen && (
                        <AddWidgetPanel
                            slotType={slot.slotType}
                            onClose={() => setIsAddPanelOpen(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
