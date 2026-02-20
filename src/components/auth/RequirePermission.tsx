import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';

interface RequirePermissionProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({ permission, children, fallback = null }) => {
    const user = useAuthStore(state => state.user);

    const hasPermission = user?.authorities?.includes(permission) ?? false;

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
