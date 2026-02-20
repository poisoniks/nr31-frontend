import api from './axiosConfig';

export interface AuthRequest {
    username: string;
    password?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

export const authApi = {
    login: async (data: AuthRequest): Promise<AuthResponse> => {
        const response = await api.post('/v1/auth/login', data);
        return response.data;
    },
    logout: async (data: { refreshToken: string }): Promise<void> => {
        await api.post('/v1/auth/logout', data);
    }
};
