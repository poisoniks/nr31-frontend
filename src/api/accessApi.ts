import api from './axiosConfig';
import type { components, paths } from './types';

type Pageable = components['schemas']['Pageable'];

type RoleRequest = components['schemas']['RoleRequest'];
type PagedRoles = components['schemas']['PagedModelRoleDTO'];

type PermissionUpdateRequest = components['schemas']['PermissionUpdateRequest'];
type PagedPermissions = components['schemas']['PagedModelPermissionDTO'];

type PagedUsers = components['schemas']['PagedModelUserDTO'];

type GetRolePath = paths['/api/v1/admin/roles/{id}']['get'];
type GetRoleResponse = GetRolePath['responses']['200']['content']['*/*'];

type CreateRolePath = paths['/api/v1/admin/roles']['post'];
type CreateRoleResponse = CreateRolePath['responses']['201']['content']['*/*'];

type UpdateRolePath = paths['/api/v1/admin/roles/{id}']['put'];
type UpdateRoleResponse = UpdateRolePath['responses']['200']['content']['*/*'];

type UpdatePermissionPath = paths['/api/v1/admin/permissions/{id}']['put'];
type UpdatePermissionResponse = UpdatePermissionPath['responses']['200']['content']['*/*'];

export const accessApi = {
    getRoles: async (pageable?: Pageable): Promise<PagedRoles> => {
        const response = await api.get<PagedRoles>('/v1/admin/roles', {
            params: pageable,
        });
        return response.data;
    },

    getRole: async (id: number): Promise<GetRoleResponse> => {
        const response = await api.get<GetRoleResponse>(`/v1/admin/roles/${id}`);
        return response.data;
    },

    createRole: async (data: RoleRequest): Promise<CreateRoleResponse> => {
        const response = await api.post<CreateRoleResponse>('/v1/admin/roles', data);
        return response.data;
    },

    updateRole: async (id: number, data: RoleRequest): Promise<UpdateRoleResponse> => {
        const response = await api.put<UpdateRoleResponse>(`/v1/admin/roles/${id}`, data);
        return response.data;
    },

    deleteRole: async (id: number): Promise<void> => {
        await api.delete(`/v1/admin/roles/${id}`);
    },

    getPermissions: async (pageable?: Pageable): Promise<PagedPermissions> => {
        const response = await api.get<PagedPermissions>('/v1/admin/permissions', {
            params: pageable,
        });
        return response.data;
    },

    updatePermission: async (id: number, data: PermissionUpdateRequest): Promise<UpdatePermissionResponse> => {
        const response = await api.put<UpdatePermissionResponse>(`/v1/admin/permissions/${id}`, data);
        return response.data;
    },

    assignPermissionToRole: async (roleId: number, permissionId: number): Promise<void> => {
        await api.post(`/v1/admin/roles/${roleId}/permissions/${permissionId}`);
    },

    unassignPermissionFromRole: async (roleId: number, permissionId: number): Promise<void> => {
        await api.delete(`/v1/admin/roles/${roleId}/permissions/${permissionId}`);
    },

    getUsers: async (pageable?: Pageable): Promise<PagedUsers> => {
        const response = await api.get<PagedUsers>('/v1/admin/users', {
            params: pageable,
        });
        return response.data;
    },

    searchUsers: async (username: string, pageable?: Pageable): Promise<PagedUsers> => {
        const response = await api.get<PagedUsers>('/v1/admin/users/search', {
            params: { username, ...pageable },
        });
        return response.data;
    },

    assignRoleToUser: async (userId: number, roleId: number): Promise<void> => {
        await api.post(`/v1/admin/users/${userId}/roles/${roleId}`);
    },

    unassignRoleFromUser: async (userId: number, roleId: number): Promise<void> => {
        await api.delete(`/v1/admin/users/${userId}/roles/${roleId}`);
    },
};
