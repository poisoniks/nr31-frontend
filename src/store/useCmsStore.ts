import { create } from 'zustand';
import { cmsApi } from '../api/cmsApi';
import type { PageResponseDto, WidgetDto, JsonNode } from '../api/cmsApi';

interface CmsState {
    isEditMode: boolean;
    toggleEditMode: () => void;

    pageData: PageResponseDto | null;
    pageVersion: number;
    isDirty: boolean;
    isSaving: boolean;

    slotRestrictions: Record<string, string[]>;
    widgetSchemas: Record<string, JsonNode>;

    loadPublishedPage: (slug: string) => Promise<void>;
    loadDraftPage: (slug: string) => Promise<void>;
    loadSlotRestrictions: () => Promise<void>;
    loadWidgetSchemas: () => Promise<void>;
    saveDraft: (slug: string) => Promise<void>;
    publishDraft: (slug: string) => Promise<void>;

    updateWidget: (slotType: string, widgetIndex: number, updatedWidget: WidgetDto) => void;
    removeWidget: (slotType: string, widgetIndex: number) => void;
    addWidget: (slotType: string, widget: WidgetDto) => void;
    reorderWidgets: (slotType: string, oldIndex: number, newIndex: number) => void;
    moveWidget: (fromSlot: string, fromIndex: number, toSlot: string, toIndex: number) => void;
}

export const useCmsStore = create<CmsState>((set, get) => ({
    isEditMode: false,
    toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),

    pageData: null,
    pageVersion: 0,
    isDirty: false,
    isSaving: false,

    slotRestrictions: {},
    widgetSchemas: {},

    loadPublishedPage: async (slug: string) => {
        try {
            const data = await cmsApi.getPublishedPage(slug);
            set({ pageData: data, pageVersion: data.version, isDirty: false });
        } catch (e: any) {
            console.error('Failed to load published page', e);
            if (e.response?.status === 404) {
                if (slug === 'home') {
                    window.location.href = '/error';
                } else {
                    window.location.href = '/';
                }
                return;
            }
            throw e;
        }
    },

    loadDraftPage: async (slug: string) => {
        try {
            const data = await cmsApi.getDraftPage(slug);
            set({ pageData: data, pageVersion: data.version, isDirty: false });
        } catch (e: any) {
            console.error('Failed to load draft page', e);
            throw e;
        }
    },

    loadSlotRestrictions: async () => {
        try {
            const data = await cmsApi.getSlotRestrictions();
            set({ slotRestrictions: data.restrictions });
        } catch (e) {
            console.error('Failed to load slot restrictions', e);
        }
    },

    loadWidgetSchemas: async () => {
        try {
            const schemas = await cmsApi.getAllWidgetSchemas();
            set({ widgetSchemas: schemas });
        } catch (e) {
            console.error('Failed to load widget schemas', e);
        }
    },

    saveDraft: async (slug: string) => {
        const { pageData, pageVersion, isDirty } = get();
        if (!pageData || !isDirty) return;

        set({ isSaving: true });
        try {
            const updated = await cmsApi.updateDraft(slug, {
                version: pageVersion,
                layoutData: pageData.layoutData
            });
            set({ pageData: updated, pageVersion: updated.version, isDirty: false, isSaving: false });
        } catch (e) {
            set({ isSaving: false });
            throw e;
        }
    },

    publishDraft: async (slug: string) => {
        const { pageVersion } = get();
        set({ isSaving: true });
        try {
            const published = await cmsApi.publishDraft(slug, { version: pageVersion });
            set({ pageData: published, pageVersion: published.version, isDirty: false, isSaving: false, isEditMode: false });
        } catch (e) {
            set({ isSaving: false });
            throw e;
        }
    },

    updateWidget: (slotType: string, widgetIndex: number, updatedWidget: WidgetDto) => {
        set((state) => {
            if (!state.pageData) return state;

            const newLayoutData = { ...state.pageData.layoutData };
            const newSlots = [...newLayoutData.slots];
            const slotIndex = newSlots.findIndex((s) => s.slotType === slotType);

            if (slotIndex !== -1) {
                const newSlot = { ...newSlots[slotIndex], widgets: [...newSlots[slotIndex].widgets] };
                newSlot.widgets[widgetIndex] = updatedWidget as any;
                newSlots[slotIndex] = newSlot;
            }
            newLayoutData.slots = newSlots;

            return {
                pageData: { ...state.pageData, layoutData: newLayoutData },
                isDirty: true
            };
        });
    },

    removeWidget: (slotType: string, widgetIndex: number) => {
        set((state) => {
            if (!state.pageData) return state;

            const newLayoutData = { ...state.pageData.layoutData };
            const newSlots = [...newLayoutData.slots];
            const slotIndex = newSlots.findIndex((s) => s.slotType === slotType);

            if (slotIndex !== -1) {
                const newSlot = { ...newSlots[slotIndex], widgets: [...newSlots[slotIndex].widgets] };
                newSlot.widgets.splice(widgetIndex, 1);
                newSlots[slotIndex] = newSlot;
            }
            newLayoutData.slots = newSlots;

            return {
                pageData: { ...state.pageData, layoutData: newLayoutData },
                isDirty: true
            };
        });
    },

    addWidget: (slotType: string, widget: WidgetDto) => {
        set((state) => {
            if (!state.pageData) return state;

            const newLayoutData = { ...state.pageData.layoutData };
            const newSlots = [...newLayoutData.slots];
            const slotIndex = newSlots.findIndex((s) => s.slotType === slotType);

            if (slotIndex !== -1) {
                const newSlot = { ...newSlots[slotIndex], widgets: [...newSlots[slotIndex].widgets] };
                newSlot.widgets.push(widget as any);
                newSlots[slotIndex] = newSlot;
            } else {
                newSlots.push({ slotType, widgets: [widget as any] });
            }
            newLayoutData.slots = newSlots;

            return {
                pageData: { ...state.pageData, layoutData: newLayoutData },
                isDirty: true
            };
        });
    },

    reorderWidgets: (slotType: string, oldIndex: number, newIndex: number) => {
        set((state) => {
            if (!state.pageData) return state;

            const newLayoutData = { ...state.pageData.layoutData };
            const newSlots = [...newLayoutData.slots];
            const slotIndex = newSlots.findIndex((s) => s.slotType === slotType);

            if (slotIndex !== -1) {
                const newSlot = { ...newSlots[slotIndex], widgets: [...newSlots[slotIndex].widgets] };
                const [moved] = newSlot.widgets.splice(oldIndex, 1);
                newSlot.widgets.splice(newIndex, 0, moved);
                newSlots[slotIndex] = newSlot;
            }
            newLayoutData.slots = newSlots;

            return {
                pageData: { ...state.pageData, layoutData: newLayoutData },
                isDirty: true
            };
        });
    },

    moveWidget: (fromSlot: string, fromIndex: number, toSlot: string, toIndex: number) => {
        set((state) => {
            if (!state.pageData) return state;

            const newLayoutData = { ...state.pageData.layoutData };
            const newSlots = [...newLayoutData.slots];
            const fromSlotIndex = newSlots.findIndex((s) => s.slotType === fromSlot);
            const toSlotIndex = newSlots.findIndex((s) => s.slotType === toSlot);

            if (fromSlotIndex !== -1 && toSlotIndex !== -1) {
                const newFromSlot = { ...newSlots[fromSlotIndex], widgets: [...newSlots[fromSlotIndex].widgets] };
                const newToSlot = { ...newSlots[toSlotIndex], widgets: [...newSlots[toSlotIndex].widgets] };

                const [moved] = newFromSlot.widgets.splice(fromIndex, 1);
                newToSlot.widgets.splice(toIndex, 0, moved);

                newSlots[fromSlotIndex] = newFromSlot;
                newSlots[toSlotIndex] = newToSlot;
            }
            newLayoutData.slots = newSlots;

            return {
                pageData: { ...state.pageData, layoutData: newLayoutData },
                isDirty: true
            };
        });
    }
}));
