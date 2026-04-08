import api from './axiosConfig';
import type { components, paths } from './types';

type PagedLogFilesResponse = components['schemas']['PagedModelString'];
type Pageable = components['schemas']['Pageable'];
type LogFileContent = paths['/api/v1/admin/logs/{fileName}']['get']['responses']['200']['content']['*/*'];
type LogFileQueryParams = paths['/api/v1/admin/logs/{fileName}']['get']['parameters']['query'];
type DiscordBotStatusResponse = components['schemas']['DiscordBotStatusResponse'];

export const adminApi = {
    clearCache: async (): Promise<paths['/api/v1/admin/cache/clear']['post']['responses']['204']['content'] extends { 'application/json': infer T } ? T : void> => {
        await api.post('/v1/admin/cache/clear');
    },

    listLogFiles: async (pageable?: Pageable): Promise<PagedLogFilesResponse> => {
        const response = await api.get<PagedLogFilesResponse>('/v1/admin/logs/list', {
            params: pageable,
        });
        return response.data;
    },

    getLogFile: async (fileName: string, params?: LogFileQueryParams): Promise<LogFileContent> => {
        const response = await api.get<LogFileContent>(`/v1/admin/logs/${encodeURIComponent(fileName)}`, {
            responseType: 'text',
            transformResponse: [(data: string) => data],
            params,
        });
        return response.data;
    },

    downloadLogFile: async (fileName: string): Promise<LogFileContent> => {
        const response = await api.get<LogFileContent>(`/v1/admin/logs/${encodeURIComponent(fileName)}`, {
            responseType: 'text',
            transformResponse: [(data: string) => data],
        });
        return response.data;
    },

    getDiscordBotStatus: async (): Promise<DiscordBotStatusResponse> => {
        const response = await api.get<DiscordBotStatusResponse>('/v1/admin/integrations/discord/status');
        return response.data;
    },

    startDiscordBot: async (): Promise<void> => {
        await api.post('/v1/admin/integrations/discord/start');
    },

    stopDiscordBot: async (): Promise<void> => {
        await api.post('/v1/admin/integrations/discord/stop');
    },
};
