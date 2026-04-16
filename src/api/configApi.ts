import api from './axiosConfig';
import type { components, paths } from './types';

type AppConfigDto = components['schemas']['AppConfigDto'];
type PagedModelAppConfigDto = paths['/api/v1/admin/config']['get']['responses']['200']['content']['*/*'];
type Pageable = components['schemas']['Pageable'];

export const configApi = {
    getAllConfigs: async (pageable?: Pageable): Promise<PagedModelAppConfigDto> => {
        const response = await api.get<PagedModelAppConfigDto>('/v1/admin/config', { params: pageable });
        return response.data;
    },

    getConfig: async (name: string): Promise<AppConfigDto> => {
        const response = await api.get<AppConfigDto>(`/v1/admin/config/${encodeURIComponent(name)}`);
        return response.data;
    },

    updateConfig: async (name: string, dto: AppConfigDto): Promise<AppConfigDto> => {
        const response = await api.put<AppConfigDto>(`/v1/admin/config/${encodeURIComponent(name)}`, dto);
        return response.data;
    },
};
