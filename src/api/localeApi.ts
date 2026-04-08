import api from './axiosConfig';
import type { components, paths } from './types';

type GetSupportedLocalesPath = paths['/api/v1/public/locales']['get'];
type GetSupportedLocalesResponse = GetSupportedLocalesPath['responses']['200']['content']['application/json'];
type Pageable = components['schemas']['Pageable'];

let cachedLocales: GetSupportedLocalesResponse | null = null;
let fetchPromise: Promise<GetSupportedLocalesResponse> | null = null;

export const localeApi = {
    getSupportedLocales: async (pageable?: Pageable): Promise<GetSupportedLocalesResponse> => {
        if (cachedLocales && !pageable) return cachedLocales;
        if (!fetchPromise || pageable) {
            const currentPromise = api.get<GetSupportedLocalesResponse>('/v1/public/locales', {
                params: pageable || { page: 0, size: 200 }
            }).then((response) => {
                if (!pageable) cachedLocales = response.data;
                return response.data;
            });

            if (!pageable) {
                fetchPromise = currentPromise;
                currentPromise.finally(() => {
                    fetchPromise = null;
                });
            }
            return currentPromise;
        }
        return fetchPromise;
    },
    getAvailableLocaleCodes: async (): Promise<string[]> => {
        const data = await localeApi.getSupportedLocales();
        return data.content.map(l => l.code);
    },
    getDefaultLocaleCode: async (): Promise<string> => {
        const data = await localeApi.getSupportedLocales();
        return data.content.length > 0 ? data.content[0].code : 'en';
    }
};
