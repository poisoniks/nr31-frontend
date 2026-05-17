import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragOverlay, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { useCmsStore } from '../store/useCmsStore';
import { Slot } from '../components/cms/Slot';
import { CmsToolbar } from '../components/cms/CmsToolbar';
import { WidgetSettingsModal } from '../components/cms/WidgetSettingsModal';
import { widgetRegistry } from '../components/cms/registry';
import type { WidgetDto } from '../api/cmsApi';
import { Loader2 } from 'lucide-react';

const CmsPage: React.FC<{ slug?: string }> = ({ slug: defaultSlug }) => {
    const params = useParams();
    const slug = defaultSlug || params.slug || 'home';
    const { t } = useTranslation();

    const isEditMode = useCmsStore(state => state.isEditMode);
    const isDirty = useCmsStore(state => state.isDirty);
    const pageData = useCmsStore(state => state.pageData);
    const loadPublishedPage = useCmsStore(state => state.loadPublishedPage);
    const loadDraftPage = useCmsStore(state => state.loadDraftPage);
    const loadSlotRestrictions = useCmsStore(state => state.loadSlotRestrictions);
    const loadWidgetSchemas = useCmsStore(state => state.loadWidgetSchemas);
    const reorderWidgets = useCmsStore(state => state.reorderWidgets);
    const moveWidget = useCmsStore(state => state.moveWidget);

    const [activeWidget, setActiveWidget] = React.useState<WidgetDto | null>(null);
    const [settingsWidget, setSettingsWidget] = React.useState<{ widget: WidgetDto, index: number, slotType: string } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        if (isEditMode) {
            loadDraftPage(slug);
            loadSlotRestrictions();
            loadWidgetSchemas();
        } else {
            loadPublishedPage(slug);
        }
    }, [slug, isEditMode, loadPublishedPage, loadDraftPage, loadSlotRestrictions, loadWidgetSchemas]);

    // Warn user before leaving page with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isEditMode && isDirty) {
                e.preventDefault();
                // Modern browsers ignore custom messages, but setting returnValue is required
                e.returnValue = t('cms.confirm_leave_unsaved');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isEditMode, isDirty, t]);

    if (!pageData) {
        return (
            <div className="flex-1 flex justify-center items-center h-screen bg-nr-bg">
                <Loader2 className="animate-spin text-nr-accent" size={32} />
            </div>
        );
    }

    const layout = pageData.layoutData;
    const heroSlot = layout.slots.find(s => s.slotType === 'hero') || { slotType: 'hero', widgets: [] };
    const contentSlot = layout.slots.find(s => s.slotType === 'content') || { slotType: 'content', widgets: [] };
    const sidebarSlot = layout.slots.find(s => s.slotType === 'sidebar') || { slotType: 'sidebar', widgets: [] };

    const handleDragStart = (event: any) => {
        const { active } = event;
        setActiveWidget(active.data.current?.widget || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveWidget(null);

        if (!over) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        if (!activeData) return;

        if (overData?.type === 'Slot') {
            const targetSlot = overData.slotType;
            if (activeData.slotType !== targetSlot) {
                // Move to empty slot
                moveWidget(activeData.slotType, activeData.index, targetSlot, 0);
            }
        } else if (overData?.type === 'Widget') {
            const sourceSlot = activeData.slotType;
            const targetSlot = overData.slotType;
            const sourceIndex = activeData.index;
            const targetIndex = overData.index;

            if (sourceSlot === targetSlot) {
                if (sourceIndex !== targetIndex) {
                    reorderWidgets(sourceSlot, sourceIndex, targetIndex);
                }
            } else {
                moveWidget(sourceSlot, sourceIndex, targetSlot, targetIndex);
            }
        }
    };

    const handleEditSettings = (widget: WidgetDto, index: number, slotType: string) => {
        setSettingsWidget({ widget, index, slotType });
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className={`flex-1 flex flex-col ${isEditMode ? 'pb-24' : ''}`}>
                {/* Hero Slot */}
                <div className="w-full relative">
                    {isEditMode && (
                        <div className="absolute top-0 left-0 bg-nr-accent text-black font-bold text-xs px-2 py-1 rounded-br-lg z-10 opacity-50">
                            {t('cms.slot.hero')}
                        </div>
                    )}
                    <Slot slot={heroSlot} isEditMode={isEditMode} onEditSettings={handleEditSettings} />
                </div>

                {/* Grid Layout for Content and Sidebar */}
                <section className="flex-1 py-16 bg-nr-bg transition-colors">
                    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Content Slot */}
                        <div className="lg:col-span-8 space-y-8 relative">
                            {isEditMode && (
                                <div className="absolute -top-6 left-0 text-nr-text/40 font-bold text-xs z-10">
                                    {t('cms.slot.content')}
                                </div>
                            )}
                            <Slot slot={contentSlot} isEditMode={isEditMode} onEditSettings={handleEditSettings} />
                        </div>

                        {/* Sidebar Slot */}
                        <div className="lg:col-span-4 space-y-6 relative">
                            {isEditMode && (
                                <div className="absolute -top-6 left-0 text-nr-text/40 font-bold text-xs z-10">
                                    {t('cms.slot.sidebar')}
                                </div>
                            )}
                            <Slot slot={sidebarSlot} isEditMode={isEditMode} onEditSettings={handleEditSettings} />
                        </div>
                    </div>
                </section>
            </div>

            <CmsToolbar slug={slug} />

            <DragOverlay>
                {activeWidget ? (
                    <div className="opacity-80 scale-105 transition-transform pointer-events-none">
                        {(() => {
                            const Entry = widgetRegistry[activeWidget.type];
                            return Entry ? <Entry.component widget={activeWidget} isEditMode={false} /> : null;
                        })()}
                    </div>
                ) : null}
            </DragOverlay>

            {settingsWidget && (
                <WidgetSettingsModal
                    isOpen={true}
                    onClose={() => setSettingsWidget(null)}
                    widget={settingsWidget.widget}
                    slotType={settingsWidget.slotType}
                    index={settingsWidget.index}
                />
            )}
        </DndContext>
    );
};

export default CmsPage;
