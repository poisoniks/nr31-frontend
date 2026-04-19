import api from './axiosConfig';
import type { components, paths } from './types';

// Unit Types
type GetUnitTypesPath = paths['/api/v1/roster/unit-types']['get'];
type GetUnitTypesResponse = GetUnitTypesPath['responses']['200']['content']['application/json'];

type CreateUnitTypePath = paths['/api/v1/roster/unit-types']['post'];
type CreateUnitTypeRequest = CreateUnitTypePath['requestBody']['content']['application/json'];
type CreateUnitTypeResponse = CreateUnitTypePath['responses']['201']['content']['application/json'];

type UpdateUnitTypePath = paths['/api/v1/roster/unit-types/{id}']['put'];
type UpdateUnitTypeRequest = UpdateUnitTypePath['requestBody']['content']['application/json'];
type UpdateUnitTypeResponse = UpdateUnitTypePath['responses']['200']['content']['application/json'];

// Event Types
type GetEventTypesPath = paths['/api/v1/roster/event-types']['get'];
type GetEventTypesResponse = GetEventTypesPath['responses']['200']['content']['application/json'];

type CreateEventTypePath = paths['/api/v1/roster/event-types']['post'];
type CreateEventTypeRequest = CreateEventTypePath['requestBody']['content']['application/json'];
type CreateEventTypeResponse = CreateEventTypePath['responses']['201']['content']['application/json'];

type UpdateEventTypePath = paths['/api/v1/roster/event-types/{id}']['put'];
type UpdateEventTypeRequest = UpdateEventTypePath['requestBody']['content']['application/json'];
type UpdateEventTypeResponse = UpdateEventTypePath['responses']['200']['content']['application/json'];

type Pageable = components['schemas']['Pageable'];

export const rosterApi = {
    // ---- Unit Types ----
    getUnitTypes: async (pageable?: Pageable): Promise<GetUnitTypesResponse> => {
        const response = await api.get<GetUnitTypesResponse>('/v1/roster/unit-types', {
            params: pageable,
        });
        return response.data;
    },

    createUnitType: async (data: CreateUnitTypeRequest): Promise<CreateUnitTypeResponse> => {
        const response = await api.post<CreateUnitTypeResponse>('/v1/roster/unit-types', data);
        return response.data;
    },

    updateUnitType: async (id: number, data: UpdateUnitTypeRequest): Promise<UpdateUnitTypeResponse> => {
        const response = await api.put<UpdateUnitTypeResponse>(`/v1/roster/unit-types/${id}`, data);
        return response.data;
    },

    deleteUnitType: async (id: number): Promise<void> => {
        await api.delete(`/v1/roster/unit-types/${id}`);
    },

    // ---- Event Types ----
    getEventTypes: async (pageable?: Pageable): Promise<GetEventTypesResponse> => {
        const response = await api.get<GetEventTypesResponse>('/v1/roster/event-types', {
            params: pageable,
        });
        return response.data;
    },

    createEventType: async (data: CreateEventTypeRequest): Promise<CreateEventTypeResponse> => {
        const response = await api.post<CreateEventTypeResponse>('/v1/roster/event-types', data);
        return response.data;
    },

    updateEventType: async (id: number, data: UpdateEventTypeRequest): Promise<UpdateEventTypeResponse> => {
        const response = await api.put<UpdateEventTypeResponse>(`/v1/roster/event-types/${id}`, data);
        return response.data;
    },

    deleteEventType: async (id: number): Promise<void> => {
        await api.delete(`/v1/roster/event-types/${id}`);
    },
};
