import api from './axiosConfig';
import type { components } from './types';
import { useUIStore } from '../store/useUIStore';

export type PageResponseDto = components['schemas']['PageResponseDto'];
export type UpdateDraftRequest = components['schemas']['UpdateDraftRequest'];
export type PublishDraftRequest = components['schemas']['PublishDraftRequest'];
export type SlotRestrictionsDto = components['schemas']['SlotRestrictionsDto'];
export type UpdateSlotRestrictionsRequest = components['schemas']['UpdateSlotRestrictionsRequest'];
export type DiscordWidgetDataDto = components['schemas']['DiscordWidgetDataDto'];
export type YoutubeVideoDto = components['schemas']['YoutubeVideoDto'];
export type WidgetDto = components['schemas']['WidgetDto'];
export type JsonNode = components['schemas']['JsonNode'];
export type SlotDto = components['schemas']['SlotDto'];

export const cmsApi = {
    getPublishedPage: async (slug: string): Promise<PageResponseDto> => {
        const response = await api.get<PageResponseDto>(`/v1/cms/pages/${slug}`);
        return response.data;
    },

    getDraftPage: async (slug: string): Promise<PageResponseDto> => {
        const response = await api.get<PageResponseDto>(`/v1/cms/pages/${slug}/draft`);
        return response.data;
    },

    updateDraft: async (slug: string, data: UpdateDraftRequest): Promise<PageResponseDto> => {
        try {
            const response = await api.put<PageResponseDto>(`/v1/cms/pages/${slug}/draft`, data);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                useUIStore.getState().setError('cms.conflict');
            } else if (error.response?.status === 400 && error.response.data?.details?.id === "Layout contains duplicate widget IDs") {
                useUIStore.getState().setError('cms.error.duplicate_ids');
            }
            throw error;
        }
    },

    publishDraft: async (slug: string, data: PublishDraftRequest): Promise<PageResponseDto> => {
        try {
            const response = await api.post<PageResponseDto>(`/v1/cms/pages/${slug}/publish`, data);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                useUIStore.getState().setError('cms.conflict');
            } else if (error.response?.status === 400 && error.response.data?.details?.id === "Layout contains duplicate widget IDs") {
                useUIStore.getState().setError('cms.error.duplicate_ids');
            }
            throw error;
        }
    },

    getSlotRestrictions: async (): Promise<SlotRestrictionsDto> => {
        const response = await api.get<SlotRestrictionsDto>('/v1/cms/slot-restrictions');
        return response.data;
    },

    updateSlotRestrictions: async (data: UpdateSlotRestrictionsRequest): Promise<SlotRestrictionsDto> => {
        const response = await api.put<SlotRestrictionsDto>('/v1/cms/slot-restrictions', data);
        return response.data;
    },

    getAllWidgetSchemas: async (): Promise<Record<string, JsonNode>> => {
        const response = await api.get<Record<string, JsonNode>>('/v1/cms/widget-schemas');
        return response.data;
    },

    getWidgetSchema: async (type: string): Promise<JsonNode> => {
        const response = await api.get<JsonNode>(`/v1/cms/widget-schemas/${type}`);
        return response.data;
    },

    getDiscordWidgetData: async (inviteCode: string): Promise<DiscordWidgetDataDto> => {
        const response = await api.get<DiscordWidgetDataDto>(`/v1/cms/discord/${inviteCode}`);
        return response.data;
    },

    getYoutubeVideo: async (channelId: string): Promise<YoutubeVideoDto> => {
        const response = await api.get<YoutubeVideoDto>(`/v1/cms/youtube/${channelId}`);
        return response.data;
    },
};
