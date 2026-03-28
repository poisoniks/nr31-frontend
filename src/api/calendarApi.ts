import api from './axiosConfig';
import type { CalendarEventDTO, UpdateEventRequest, CreateEventRequest, SupportedLocaleDTO, EventType, UnitType } from '../types/calendar';

export const calendarApi = {
    getEvents: async (from: string, to: string, timezone?: string): Promise<CalendarEventDTO[]> => {
        const params: Record<string, string> = { from, to };
        if (timezone) {
            params.timezone = timezone;
        }
        const response = await api.get('/v1/calendar/events', { params });
        return response.data;
    },

    updateEvent: async (id: string, data: UpdateEventRequest): Promise<CalendarEventDTO> => {
        const response = await api.put(`/v1/calendar/events/${id}`, data);
        return response.data;
    },

    getSupportedLocales: async (): Promise<SupportedLocaleDTO[]> => {
        const response = await api.get('/v1/public/locales');
        return response.data;
    },

    getEventTypes: async (): Promise<EventType[]> => {
        const response = await api.get('/v1/roster/event-types');
        return response.data;
    },

    getUnitTypes: async (): Promise<UnitType[]> => {
        const response = await api.get('/v1/roster/unit-types');
        return response.data;
    },

    createEvent: async (data: CreateEventRequest): Promise<CalendarEventDTO> => {
        const response = await api.post('/v1/calendar/events', data);
        return response.data;
    },
};
