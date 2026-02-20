import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface UserPayload {
    sub: string;
    authorities: string[];
    [key: string]: any;
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: UserPayload | null;
    isAuthenticated: boolean;
    login: (token: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    let user = null;
    let isAuthenticated = false;

    if (token) {
        try {
            user = jwtDecode<UserPayload>(token);
            isAuthenticated = true;
        } catch (e) {
            console.error('Invalid token in local storage', e);
        }
    }

    return {
        token,
        refreshToken,
        user,
        isAuthenticated,
        login: (newToken, newRefreshToken) => {
            localStorage.setItem('token', newToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            try {
                const decodedUser = jwtDecode<UserPayload>(newToken);
                set({
                    token: newToken,
                    refreshToken: newRefreshToken,
                    user: decodedUser,
                    isAuthenticated: true,
                });
            } catch (e) {
                console.error('Failed to decode token on login', e);
            }
        },
        logout: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            set({
                token: null,
                refreshToken: null,
                user: null,
                isAuthenticated: false,
            });
        }
    };
});
