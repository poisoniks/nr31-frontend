import api from './axiosConfig';
import type { CalendarEventDTO } from '../types/calendar';

export const calendarApi = {
    getEvents: async (from: string, to: string, timezone?: string): Promise<CalendarEventDTO[]> => {
        const params: Record<string, string> = { from, to };
        if (timezone) {
            params.timezone = timezone;
        }
        const response = await api.get('/v1/calendar/events', { params });
        return response.data;
    },
};
