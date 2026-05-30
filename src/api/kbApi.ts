import api from './axiosConfig';
import type { components } from './types';
import { useUIStore } from '../store/useUIStore';

export type CreateKbArticleRequest = components['schemas']['CreateKbArticleRequest'];
export type CreateKbFolderRequest = components['schemas']['CreateKbFolderRequest'];
export type UpdateKbArticleRequest = components['schemas']['UpdateKbArticleRequest'];
export type UpdateKbFolderRequest = components['schemas']['UpdateKbFolderRequest'];
export type KbArticleDetailDto = components['schemas']['KbArticleDetailDto'];
export type KbArticleSummaryDto = components['schemas']['KbArticleSummaryDto'];
export type KbFolderDetailDto = components['schemas']['KbFolderDetailDto'];
export type KbFolderDto = components['schemas']['KbFolderDto'];
export type KbSearchResultDto = components['schemas']['KbSearchResultDto'];

export const kbApi = {
    getRootFolders: async (): Promise<KbFolderDto[]> => {
        const response = await api.get<KbFolderDto[]>('/v1/kb/folders/root');
        return response.data;
    },

    getFolderBySlug: async (slug: string, page = 0, size = 10): Promise<KbFolderDetailDto> => {
        const response = await api.get<KbFolderDetailDto>(`/v1/kb/folders/${slug}`, {
            params: { page, size }
        });
        return response.data;
    },

    getArticleBySlug: async (slug: string): Promise<KbArticleDetailDto> => {
        const response = await api.get<KbArticleDetailDto>(`/v1/kb/articles/${slug}`);
        return response.data;
    },

    searchArticles: async (q: string): Promise<KbSearchResultDto[]> => {
        const response = await api.get<KbSearchResultDto[]>('/v1/kb/search', {
            params: { q }
        });
        return response.data;
    },

    createArticle: async (data: CreateKbArticleRequest): Promise<KbArticleDetailDto> => {
        try {
            const response = await api.post<KbArticleDetailDto>('/v1/kb/articles', data);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                useUIStore.getState().setError('cms.conflict');
            }
            throw error;
        }
    },

    updateArticle: async (id: number, data: UpdateKbArticleRequest): Promise<KbArticleDetailDto> => {
        try {
            const response = await api.put<KbArticleDetailDto>(`/v1/kb/articles/${id}`, data);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                useUIStore.getState().setError('cms.conflict');
            }
            throw error;
        }
    },

    deleteArticle: async (id: number): Promise<void> => {
        await api.delete(`/v1/kb/articles/${id}`);
    },

    createFolder: async (data: CreateKbFolderRequest): Promise<KbFolderDto> => {
        const response = await api.post<KbFolderDto>('/v1/kb/folders', data);
        return response.data;
    },

    updateFolder: async (id: number, data: UpdateKbFolderRequest): Promise<KbFolderDto> => {
        const response = await api.put<KbFolderDto>(`/v1/kb/folders/${id}`, data);
        return response.data;
    },

    deleteFolder: async (id: number): Promise<void> => {
        await api.delete(`/v1/kb/folders/${id}`);
    }
};
