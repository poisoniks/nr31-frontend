import api from './axiosConfig';
import type { components, paths } from './types';

type FileMetadataDTO = components['schemas']['FileMetadataDTO'];
type FileUploadResponse = components['schemas']['FileUploadResponse'];
type MediaFolderDTO = components['schemas']['MediaFolderDTO'];

// ---- List Files ----
type ListFilesPath = paths['/api/v1/files/library/files']['get'];
type ListFilesResponse = ListFilesPath['responses']['200']['content']['application/json'];

// ---- Upload File ----
type UploadFileResponse = paths['/api/v1/files/library/files']['post']['responses']['201']['content']['application/json'];

// ---- Update File (rename/move) ----
type UpdateFilePath = paths['/api/v1/files/library/files/{id}']['patch'];
type UpdateFileRequest = UpdateFilePath['requestBody']['content']['application/json'];
type UpdateFileResponse = UpdateFilePath['responses']['200']['content']['application/json'];

// ---- List Folders ----
type ListFoldersResponse = paths['/api/v1/files/library/folders']['get']['responses']['200']['content']['application/json'];

// ---- Create Folder ----
type CreateFolderPath = paths['/api/v1/files/library/folders']['post'];
type CreateFolderRequest = CreateFolderPath['requestBody']['content']['application/json'];
type CreateFolderResponse = CreateFolderPath['responses']['201']['content']['application/json'];

// ---- Update Folder (rename/move) ----
type UpdateFolderPath = paths['/api/v1/files/library/folders/{id}']['patch'];
type UpdateFolderRequest = UpdateFolderPath['requestBody']['content']['application/json'];
type UpdateFolderResponse = UpdateFolderPath['responses']['200']['content']['application/json'];

export type { FileMetadataDTO, FileUploadResponse, MediaFolderDTO, UpdateFileRequest };

export const libraryApi = {
    // ---- Files ----

    listFiles: async (params: { folderId?: string; page: number; size: number }): Promise<ListFilesResponse> => {
        const { folderId, page, size } = params;
        const response = await api.get<ListFilesResponse>('/v1/files/library/files', {
            params: {
                ...(folderId ? { folderId } : {}),
                page,
                size,
            },
        });
        return response.data;
    },

    uploadFile: async (file: File, folderId?: string): Promise<UploadFileResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<UploadFileResponse>('/v1/files/library/files', formData, {
            params: folderId ? { folderId } : {},
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    updateFile: async (id: string, data: UpdateFileRequest): Promise<UpdateFileResponse> => {
        const response = await api.patch<UpdateFileResponse>(`/v1/files/library/files/${id}`, data);
        return response.data;
    },

    deleteFile: async (id: string): Promise<void> => {
        await api.delete(`/v1/files/library/files/${id}`);
    },

    // ---- Folders ----

    listFolders: async (parentId?: string): Promise<ListFoldersResponse> => {
        const response = await api.get<ListFoldersResponse>('/v1/files/library/folders', {
            params: parentId ? { parentId } : {},
        });
        return response.data;
    },

    createFolder: async (data: CreateFolderRequest): Promise<CreateFolderResponse> => {
        const response = await api.post<CreateFolderResponse>('/v1/files/library/folders', data);
        return response.data;
    },

    updateFolder: async (id: string, data: UpdateFolderRequest): Promise<UpdateFolderResponse> => {
        const response = await api.patch<UpdateFolderResponse>(`/v1/files/library/folders/${id}`, data);
        return response.data;
    },

    deleteFolder: async (id: string): Promise<void> => {
        await api.delete(`/v1/files/library/folders/${id}`);
    },

    // ---- URL Helpers ----

    getFileUrl: (id: string, width?: number): string => {
        const base = `/api/v1/files/${id}`;
        return width ? `${base}?w=${width}` : base;
    },
};
