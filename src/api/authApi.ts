import api from './axiosConfig';
import type { paths } from './types';

type LoginPath = paths['/api/v1/auth/login']['post'];
type LoginRequest = LoginPath['requestBody']['content']['application/json'];
type LoginResponse = LoginPath['responses']['200']['content']['application/json'];

type LogoutPath = paths['/api/v1/auth/logout']['post'];
type LogoutRequest = LogoutPath['requestBody']['content']['application/json'];

type RegisterPath = paths['/api/v1/auth/register']['post'];
type RegisterRequest = RegisterPath['requestBody']['content']['application/json'];

type ResendVerificationPath = paths['/api/v1/auth/resend-verification']['post'];
type ResendVerificationRequest = ResendVerificationPath['requestBody']['content']['application/json'];

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/v1/auth/login', data);
        return response.data;
    },
    logout: async (data: LogoutRequest): Promise<void> => {
        await api.post('/v1/auth/logout', data);
    },
    register: async (data: RegisterRequest): Promise<void> => {
        await api.post('/v1/auth/register', data);
    },
    verifyEmail: async (token: string): Promise<void> => {
        await api.post('/v1/auth/verify-email', null, {
            params: { token },
        });
    },
    resendVerification: async (data: ResendVerificationRequest): Promise<void> => {
        await api.post('/v1/auth/resend-verification', data);
    },
};

