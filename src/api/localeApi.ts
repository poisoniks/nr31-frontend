import api from './axiosConfig';
import type { paths } from './types';

type GetSupportedLocalesPath = paths['/api/v1/public/locales']['get'];
type GetSupportedLocalesResponse = GetSupportedLocalesPath['responses']['200']['content']['application/json'];

let cachedLocales: GetSupportedLocalesResponse | null = null;
let fetchPromise: Promise<GetSupportedLocalesResponse> | null = null;

export const localeApi = {
    getSupportedLocales: async (): Promise<GetSupportedLocalesResponse> => {
        if (cachedLocales) return cachedLocales;
        if (!fetchPromise) {
            fetchPromise = api.get<GetSupportedLocalesResponse>('/v1/public/locales').then((response) => {
                cachedLocales = response.data;
                return cachedLocales;
            }).finally(() => {
                fetchPromise = null;
            });
        }
        return fetchPromise;
    },
    getAvailableLocaleCodes: async (): Promise<string[]> => {
        const locales = await localeApi.getSupportedLocales();
        return locales.map(l => l.code);
    },
    getDefaultLocaleCode: async (): Promise<string> => {
        const locales = await localeApi.getSupportedLocales();
        return locales.length > 0 ? locales[0].code : 'en';
    }
};
