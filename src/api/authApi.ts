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

type ForgotPasswordPath = paths['/api/v1/auth/forgot-password']['post'];
type ForgotPasswordRequest = ForgotPasswordPath['requestBody']['content']['application/json'];

type ResetPasswordPath = paths['/api/v1/auth/reset-password']['post'];
type ResetPasswordRequest = ResetPasswordPath['requestBody']['content']['application/json'];

type ChangePasswordPath = paths['/api/v1/auth/password']['put'];
type ChangePasswordRequest = ChangePasswordPath['requestBody']['content']['application/json'];

type GetCurrentUserPath = paths['/api/v1/users/me']['get'];
type UserDTO = GetCurrentUserPath['responses']['200']['content']['application/json'];

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
    forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
        await api.post('/v1/auth/forgot-password', data);
    },
    resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
        await api.post('/v1/auth/reset-password', data);
    },
    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        await api.put('/v1/auth/password', data);
    },
    getCurrentUser: async (): Promise<UserDTO> => {
        const response = await api.get<UserDTO>('/v1/users/me');
        return response.data;
    },
};

