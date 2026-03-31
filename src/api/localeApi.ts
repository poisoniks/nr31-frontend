import axios from './axiosConfig';
import type { components } from './types';

type SupportedLocaleDTO = components['schemas']['SupportedLocaleDTO'];

let cachedLocales: SupportedLocaleDTO[] | null = null;
let fetchPromise: Promise<SupportedLocaleDTO[]> | null = null;

export const localeApi = {
    getSupportedLocales: async (): Promise<SupportedLocaleDTO[]> => {
        if (cachedLocales) return cachedLocales;
        if (!fetchPromise) {
            fetchPromise = axios.get('/v1/public/locales').then((response) => {
                cachedLocales = response.data;
                return cachedLocales as SupportedLocaleDTO[];
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
