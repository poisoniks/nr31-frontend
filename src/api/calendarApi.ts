import api from './axiosConfig';
import type { components, paths } from './types';

type GetEventsPath = paths['/api/v1/calendar/events']['get'];
type GetEventsResponse = GetEventsPath['responses']['200']['content']['application/json'];

type CreateEventPath = paths['/api/v1/calendar/events']['post'];
type CreateEventRequest = CreateEventPath['requestBody']['content']['application/json'];
type CreateEventResponse = CreateEventPath['responses']['201']['content']['application/json'];

type UpdateEventPath = paths['/api/v1/calendar/events/{id}']['put'];
type UpdateEventRequest = UpdateEventPath['requestBody']['content']['application/json'];
type UpdateEventResponse = UpdateEventPath['responses']['200']['content']['application/json'];

type GetNearestEventPath = paths['/api/v1/calendar/events/nearest']['get'];
type GetNearestEventResponse = GetNearestEventPath['responses']['200']['content']['application/json'];

export const calendarApi = {
    getEvents: async (from: string, to: string, timezone?: string): Promise<GetEventsResponse> => {
        const params: Record<string, string> = { from, to };
        if (timezone) {
            params.timezone = timezone;
        }
        const response = await api.get<GetEventsResponse>('/v1/calendar/events', { params });
        return response.data;
    },

    updateEvent: async (id: string, data: UpdateEventRequest): Promise<UpdateEventResponse> => {
        const response = await api.put<UpdateEventResponse>(`/v1/calendar/events/${id}`, data);
        return response.data;
    },

    deleteEvent: async (id: string, mode: 'SINGLE' | 'FUTURE' | 'ALL', exceptionDate?: string): Promise<void> => {
        const params: Record<string, string> = { mode };
        if (exceptionDate) {
            params.exceptionDate = exceptionDate;
        }
        await api.delete(`/v1/calendar/events/${id}`, { params });
    },

    getNearestEvent: async (date: string, timezone?: string): Promise<GetNearestEventResponse | null> => {
        try {
            const params: Record<string, string> = { date };
            if (timezone) {
                params.timezone = timezone;
            }
            const response = await api.get<GetNearestEventResponse>('/v1/calendar/events/nearest', { params });
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw error;
        }
    },


    createEvent: async (data: CreateEventRequest): Promise<CreateEventResponse> => {
        const response = await api.post<CreateEventResponse>('/v1/calendar/events', data);
        return response.data;
    },
};

