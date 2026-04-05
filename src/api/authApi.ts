import api from './axiosConfig';
import type { paths } from './types';

type LoginPath = paths['/api/v1/auth/login']['post'];
type LoginRequest = LoginPath['requestBody']['content']['application/json'];
type LoginResponse = LoginPath['responses']['200']['content']['application/json'];

type LogoutPath = paths['/api/v1/auth/logout']['post'];
type LogoutRequest = LogoutPath['requestBody']['content']['application/json'];

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/v1/auth/login', data);
        return response.data;
    },
    logout: async (data: LogoutRequest): Promise<void> => {
        await api.post('/v1/auth/logout', data);
    }
};

