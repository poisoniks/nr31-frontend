import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Plus, Pencil, Trash2, Search, ChevronDown, ChevronRight, X, Check, Users, KeyRound, Lock } from 'lucide-react';
import { accessApi } from '../../api/accessApi';
import { localeApi } from '../../api/localeApi';
import { useUIStore } from '../../store/useUIStore';
import type { components } from '../../api/types';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import LocaleTabBar from '../../components/ui/LocaleTabBar';
import Pagination from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';

type RoleDTO = components['schemas']['RoleDTO'];
type PermissionDTO = components['schemas']['PermissionDTO'];
type UserDTO = components['schemas']['UserDTO'];

const localized = (map: Record<string, string> | undefined, lang: string): string => {
    if (!map) return '';
    return map[lang] || Object.values(map)[0] || '';
};

type TabId = 'roles' | 'permissions' | 'users';

const TABS: { id: TabId; labelKey: string; icon: React.ReactNode }[] = [
    { id: 'roles', labelKey: 'admin.access.tab.roles', icon: <Shield size={15} /> },
    { id: 'permissions', labelKey: 'admin.access.tab.permissions', icon: <KeyRound size={15} /> },
    { id: 'users', labelKey: 'admin.access.tab.users', icon: <Users size={15} /> },
];

/* ────────────────────── Skeleton Row ────────────────────── */
const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
    <tr className="border-b border-nr-border/30">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div className="h-4 bg-nr-text/10 rounded animate-pulse w-3/4" />
            </td>
        ))}
    </tr>
);

/* ════════════════════════════════════════════════════════════
   ROLES TAB
   ════════════════════════════════════════════════════════════ */
interface RolesTabProps {
    lang: string;
}

const RolesTab: React.FC<RolesTabProps> = ({ lang }) => {
    const { t } = useTranslation();
    const { setError } = useUIStore();

    const [roles, setRoles] = useState<RoleDTO[]>([]);
    const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const { page, size, totalPages, setTotalPages, handlePageChange } = usePagination(10);

    // Role modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleDTO | null>(null);
    const [roleName, setRoleName] = useState('');
    const [localizedName, setLocalizedName] = useState<Record<string, string>>({});
    const [nameLocale, setNameLocale] = useState(lang);
    const [saving, setSaving] = useState(false);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<RoleDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Expanded role for permission management
    const [expandedRoleId, setExpandedRoleId] = useState<number | null>(null);
    const [rolePermissions, setRolePermissions] = useState<Record<number, Set<number>>>({});
    const [permActionLoading, setPermActionLoading] = useState<string | null>(null);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const [rolesData, permsData] = await Promise.all([
                accessApi.getRoles({ page, size }),
                accessApi.getPermissions({ page: 0, size: 200 }), // Keep fetching all permissions for the assignment panel
            ]);

            const initialRolePerms: Record<number, Set<number>> = {};
            rolesData.content.forEach(role => {
                initialRolePerms[role.id] = new Set((role.permissions || []).map(p => p.id));
            });
            setRolePermissions(initialRolePerms);

            setRoles(rolesData.content);
            setTotalPages(rolesData.page?.totalPages || 1);
            setPermissions(permsData.content);
        } catch {
            setError(t('admin.access.roles.error_load'));
        } finally {
            setLoading(false);
        }
    }, [page, size, setError, t, setTotalPages]);

    useEffect(() => { fetchRoles(); }, [fetchRoles]);

    const openCreate = () => {
        setEditingRole(null);
        setRoleName('');
        setLocalizedName({});
        setNameLocale(lang);
        setModalOpen(true);
    };

    const openEdit = (role: RoleDTO) => {
        setEditingRole(role);
        setRoleName(role.name);
        setLocalizedName({ ...(role.localizedName || {}) });
        setNameLocale(lang);
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!roleName.trim()) return;
        setSaving(true);
        try {
            const availableLocales = await localeApi.getAvailableLocaleCodes();
            const filledEntries = Object.entries(localizedName).filter(([, v]) => v.trim());
            const cleanName: Record<string, string> = { ...localizedName };
            if (filledEntries.length > 0) {
                const firstVal = filledEntries[0][1];
                availableLocales.forEach(l => {
                    if (!cleanName[l]?.trim()) cleanName[l] = firstVal;
                });
            }

            if (editingRole) {
                await accessApi.updateRole(editingRole.id, {
                    name: roleName.trim(),
                    localizedName: Object.keys(cleanName).length > 0 ? cleanName : undefined,
                });
            } else {
                await accessApi.createRole({
                    name: roleName.trim(),
                    localizedName: Object.keys(cleanName).length > 0 ? cleanName : undefined,
                });
            }
            setModalOpen(false);
            await fetchRoles();
        } catch {
            setError(editingRole ? t('admin.access.roles.error_update') : t('admin.access.roles.error_create'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await accessApi.deleteRole(deleteTarget.id);
            setDeleteTarget(null);
            await fetchRoles();
        } catch {
            setError(t('admin.access.roles.error_delete'));
        } finally {
            setDeleting(false);
        }
    };

    const toggleExpand = (roleId: number) => {
        setExpandedRoleId(prev => prev === roleId ? null : roleId);
    };

    const togglePermission = async (roleId: number, permissionId: number, isAssigned: boolean) => {
        const key = `${roleId}-${permissionId}`;
        setPermActionLoading(key);
        try {
            if (isAssigned) {
                await accessApi.unassignPermissionFromRole(roleId, permissionId);
                setRolePermissions(prev => {
                    const updated = new Map(Object.entries(prev).map(([k, v]) => [Number(k), v]));
                    const set = new Set(updated.get(roleId) || []);
                    set.delete(permissionId);
                    return { ...prev, [roleId]: set };
                });
            } else {
                await accessApi.assignPermissionToRole(roleId, permissionId);
                setRolePermissions(prev => {
                    const set = new Set(prev[roleId] || []);
                    set.add(permissionId);
                    return { ...prev, [roleId]: set };
                });
            }
        } catch {
            setError(isAssigned ? t('admin.access.roles.error_unassign_perm') : t('admin.access.roles.error_assign_perm'));
        } finally {
            setPermActionLoading(null);
        }
    };

    const inputClass = 'w-full bg-nr-bg border border-nr-border rounded-lg px-3 py-2 text-sm text-nr-text focus:outline-none focus:border-nr-accent/60 transition-colors';

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-nr-text/60 uppercase tracking-wider">
                    {t('admin.access.tab.roles')}
                </h2>
                <button
                    id="access-create-role-btn"
                    onClick={openCreate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-nr-accent/15 text-nr-accent border border-nr-accent/30 hover:bg-nr-accent/25 transition-colors cursor-pointer"
                >
                    <Plus size={14} />
                    {t('admin.access.roles.create')}
                </button>
            </div>

            <div className="flex flex-col min-h-[600px] justify-between overflow-hidden rounded-xl border border-nr-border/50 bg-white/5 dark:bg-black/20 backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-nr-border/50 bg-nr-bg/30">
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-nr-text/40 uppercase tracking-wider w-8" />
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-nr-text/40 uppercase tracking-wider">
                                    {t('admin.access.roles.name')}
                                </th>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-nr-text/40 uppercase tracking-wider">
                                    {t('admin.access.roles.localized_name')}
                                </th>
                                <th className="px-4 py-2.5 text-right text-xs font-bold text-nr-text/40 uppercase tracking-wider w-28">
                                    {t('admin.access.roles.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: size }).map((_, i) => <SkeletonRow key={i} cols={4} />)
                            ) : roles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-nr-text/40 text-sm">
                                        {t('admin.access.roles.empty')}
                                    </td>
                                </tr>
                            ) : (
                                roles.map(role => (
                                    <React.Fragment key={role.id}>
                                        <tr className="border-b border-nr-border/20 hover:bg-nr-text/[0.02] transition-colors">
                                            <td className="px-4 py-2.5">
                                                <button
                                                    onClick={() => toggleExpand(role.id)}
                                                    className="p-0.5 rounded text-nr-text/30 hover:text-nr-text/60 transition-colors cursor-pointer"
                                                >
                                                    {expandedRoleId === role.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </button>
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-xs text-nr-text/70">
                                                {role.name}
                                            </td>
                                            <td className="px-4 py-2.5 text-nr-text/80">
                                                {localized(role.localizedName, lang) || <span className="text-nr-text/30 italic">—</span>}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEdit(role)}
                                                        className="p-1.5 rounded-lg text-nr-text/40 hover:text-nr-accent hover:bg-nr-accent/10 transition-colors cursor-pointer"
                                                        title={t('admin.access.roles.edit')}
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(role)}
                                                        className="p-1.5 rounded-lg text-nr-text/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                                        title={t('admin.access.modal.delete')}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedRoleId === role.id && (
                                            <tr className="border-b border-nr-border/20 bg-nr-bg/20">
                                                <td colSpan={4} className="px-6 py-4">
                                                    <RolePermissionPanel
                                                        roleId={role.id}
                                                        role={role}
                                                        permissions={permissions}
                                                        rolePermissions={rolePermissions}
                                                        setRolePermissions={setRolePermissions}
                                                        permActionLoading={permActionLoading}
                                                        onToggle={togglePermission}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Create / Edit Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingRole ? t('admin.access.roles.edit') : t('admin.access.roles.create')}>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-nr-text/50 uppercase mb-1 block">
                            {t('admin.access.roles.name')} *
                        </label>
                        <input
                            type="text"
                            className={inputClass}
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder={t('admin.access.roles.name_placeholder')}
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-nr-text/50 uppercase">
                                {t('admin.access.roles.localized_name')}
                            </label>
                            <LocaleTabBar activeLocale={nameLocale} onLocaleChange={setNameLocale} />
                        </div>
                        <input
                            type="text"
                            className={inputClass}
                            value={localizedName[nameLocale] || ''}
                            onChange={(e) => setLocalizedName({ ...localizedName, [nameLocale]: e.target.value })}
                            placeholder={t('admin.access.roles.localized_name_placeholder')}
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || !roleName.trim()} className="flex-1">
                            {saving ? t('admin.access.modal.saving') : t('admin.access.modal.save')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)} disabled={saving} className="flex-1">
                            {t('admin.access.modal.cancel')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('admin.access.modal.delete')}>
                <div className="space-y-4">
                    <p className="text-sm text-nr-text/70">
                        {t('admin.access.roles.delete_confirm', { name: deleteTarget?.name })}
                    </p>
                    <div className="flex gap-2 pt-2">
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting} className="flex-1">
                            {deleting ? t('admin.access.modal.deleting') : t('admin.access.modal.delete')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1">
                            {t('admin.access.modal.cancel')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

/* ────────────────────── Role Permission Panel ────────────────────── */
interface RolePermissionPanelProps {
    roleId: number;
    role: RoleDTO;
    permissions: PermissionDTO[];
    rolePermissions: Record<number, Set<number>>;
    setRolePermissions: React.Dispatch<React.SetStateAction<Record<number, Set<number>>>>;
    permActionLoading: string | null;
    onToggle: (roleId: number, permissionId: number, isAssigned: boolean) => Promise<void>;
}

const RolePermissionPanel: React.FC<RolePermissionPanelProps> = ({
    roleId, role, permissions, rolePermissions, setRolePermissions, permActionLoading, onToggle,
}) => {
    const { t } = useTranslation();

    useEffect(() => {
        // If for some reason we don't have this role's permissions mapped yet, initialize them
        if (!rolePermissions[roleId]) {
            const permIds = new Set((role.permissions || []).map(p => p.id));
            setRolePermissions(prev => ({ ...prev, [roleId]: permIds }));
        }
    }, [roleId, role.permissions, rolePermissions, setRolePermissions]);

    const assignedSet = rolePermissions[roleId] || new Set<number>();

    return (
        <div className="space-y-2">
            <span className="text-xs font-bold text-nr-text/40 uppercase">{t('admin.access.roles.permissions')}</span>
            <div className="flex flex-wrap gap-1.5">
                {permissions.length === 0 ? (
                    <span className="text-xs text-nr-text/30 italic">{t('admin.access.roles.no_permissions')}</span>
                ) : (
                    permissions.map(perm => {
                        const isAssigned = assignedSet.has(perm.id);
                        const actionKey = `${roleId}-${perm.id}`;
                        const isLoading = permActionLoading === actionKey;
                        return (
                            <button
                                key={perm.id}
                                onClick={() => onToggle(roleId, perm.id, isAssigned)}
                                disabled={isLoading}
                                className={`
                                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                                    border transition-all cursor-pointer disabled:opacity-50
                                    ${isAssigned
                                        ? 'bg-nr-accent/20 text-nr-accent border-nr-accent/40'
                                        : 'bg-nr-bg text-nr-text/50 border-nr-border hover:text-nr-text/70 hover:border-nr-text/30'
                                    }
                                `}
                                title={perm.name}
                            >
                                {isAssigned ? <Check size={12} /> : <Plus size={12} />}
                                {perm.name}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════
   PERMISSIONS TAB
   ════════════════════════════════════════════════════════════ */
interface PermissionsTabProps {
    lang: string;
}

const PermissionsTab: React.FC<PermissionsTabProps> = ({ lang }) => {
    const { t } = useTranslation();
    const { setError } = useUIStore();

    const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const { page, size, totalPages, setTotalPages, handlePageChange } = usePagination(10);

    // Edit modal
    const [editTarget, setEditTarget] = useState<PermissionDTO | null>(null);
    const [description, setDescription] = useState<Record<string, string>>({});
    const [descLocale, setDescLocale] = useState(lang);
    const [saving, setSaving] = useState(false);

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await accessApi.getPermissions({ page, size });
            setPermissions(data.content);
            setTotalPages(data.page?.totalPages || 1);
        } catch {
            setError(t('admin.access.permissions.error_load'));
        } finally {
            setLoading(false);
        }
    }, [page, size, setError, t, setTotalPages]);

    useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

    const openEdit = (perm: PermissionDTO) => {
        setEditTarget(perm);
        setDescription({ ...(perm.description || {}) });
        setDescLocale(lang);
    };

    const handleSave = async () => {
        if (!editTarget) return;
        setSaving(true);
        try {
            const availableLocales = await localeApi.getAvailableLocaleCodes();
            const filledEntries = Object.entries(description).filter(([, v]) => v.trim());
            const cleanDesc: Record<string, string> = { ...description };
            if (filledEntries.length > 0) {
                const firstVal = filledEntries[0][1];
                availableLocales.forEach(l => {
                    if (!cleanDesc[l]?.trim()) cleanDesc[l] = firstVal;
                });
            }

            await accessApi.updatePermission(editTarget.id, {
                description: Object.keys(cleanDesc).length > 0 ? cleanDesc : undefined,
            });
            setEditTarget(null);
            await fetchPermissions();
        } catch {
            setError(t('admin.access.permissions.error_update'));
        } finally {
            setSaving(false);
        }
    };

    const inputClass = 'w-full bg-nr-bg border border-nr-border rounded-lg px-3 py-2 text-sm text-nr-text focus:outline-none focus:border-nr-accent/60 transition-colors';

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-semibold text-nr-text/60 uppercase tracking-wider">
                {t('admin.access.tab.permissions')}
            </h2>

            <div className="flex flex-col min-h-[600px] justify-between overflow-hidden rounded-xl border border-nr-border/50 bg-white/5 dark:bg-black/20 backdrop-blur-md">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-nr-border/50 bg-nr-bg/30">
                            <th className="px-4 py-2.5 text-left text-xs font-bold text-nr-text/40 uppercase tracking-wider">
                                {t('admin.access.permissions.name')}
                            </th>
                            <th className="px-4 py-2.5 text-left text-xs font-bold text-nr-text/40 uppercase tracking-wider">
                                {t('admin.access.permissions.description')}
                            </th>
                            <th className="px-4 py-2.5 text-right text-xs font-bold text-nr-text/40 uppercase tracking-wider w-20">
                                {t('admin.access.permissions.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: size }).map((_, i) => <SkeletonRow key={i} cols={3} />)
                        ) : permissions.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-10 text-center text-nr-text/40 text-sm">
                                    {t('admin.access.permissions.empty')}
                                </td>
                            </tr>
                        ) : (
                            permissions.map(perm => (
                                <tr key={perm.id} className="border-b border-nr-border/20 hover:bg-nr-text/[0.02] transition-colors">
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <Lock size={13} className="text-nr-text/30 flex-shrink-0" />
                                            <span className="font-mono text-xs text-nr-text/70">{perm.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-nr-text/60 text-xs">
                                        {localized(perm.description, lang) || <span className="text-nr-text/30 italic">—</span>}
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <button
                                            onClick={() => openEdit(perm)}
                                            className="p-1.5 rounded-lg text-nr-text/40 hover:text-nr-accent hover:bg-nr-accent/10 transition-colors cursor-pointer"
                                            title={t('admin.access.permissions.edit')}
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loading && permissions.length > 0 && permissions.length < size && Array.from({ length: size - permissions.length }).map((_, i) => (
                            <tr key={`empty-perm-${i}`} className="border-b border-nr-border/10 h-[45px]">
                                <td colSpan={3} className="px-4 py-3">&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Edit Permission Description Modal */}
            <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={t('admin.access.permissions.edit')}>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-nr-bg/50 rounded-lg border border-nr-border/30">
                        <Lock size={14} className="text-nr-text/40" />
                        <span className="font-mono text-xs text-nr-text/60">{editTarget?.name}</span>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-nr-text/50 uppercase">
                                {t('admin.access.permissions.description')}
                            </label>
                            <LocaleTabBar activeLocale={descLocale} onLocaleChange={setDescLocale} />
                        </div>
                        <textarea
                            className={`${inputClass} min-h-[80px] resize-y`}
                            value={description[descLocale] || ''}
                            onChange={(e) => setDescription({ ...description, [descLocale]: e.target.value })}
                            placeholder={t('admin.access.permissions.description_placeholder')}
                            rows={3}
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} className="flex-1">
                            {saving ? t('admin.access.modal.saving') : t('admin.access.modal.save')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditTarget(null)} disabled={saving} className="flex-1">
                            {t('admin.access.modal.cancel')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════
   USERS TAB
   ════════════════════════════════════════════════════════════ */
interface UsersTabProps {
    lang: string;
}

const UsersTab: React.FC<UsersTabProps> = ({ lang }) => {
    const { t } = useTranslation();
    const { setError } = useUIStore();

    const [users, setUsers] = useState<UserDTO[]>([]);
    const [allRoles, setAllRoles] = useState<RoleDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { page, size, totalPages, setTotalPages, handlePageChange, resetPage } = usePagination(10);

    // Expanded user for role management
    const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
    const [roleActionLoading, setRoleActionLoading] = useState<string | null>(null);

    const fetchUsers = useCallback(async (query?: string) => {
        setLoading(true);
        try {
            const [usersData, rolesData] = await Promise.all([
                query && query.trim()
                    ? accessApi.searchUsers(query.trim(), { page, size })
                    : accessApi.getUsers({ page, size }),
                accessApi.getRoles({ page: 0, size: 200 }),
            ]);
            setUsers(usersData.content);
            setTotalPages(usersData.page?.totalPages || 1);
            setAllRoles(rolesData.content);
        } catch {
            setError(query ? t('admin.access.users.error_search') : t('admin.access.users.error_load'));
        } finally {
            setLoading(false);
        }
    }, [page, size, setError, t, setTotalPages]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        resetPage(); // Reset to first page on search change
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchUsers(value);
        }, 400);
    };

    const toggleUserExpand = (userId: number) => {
        setExpandedUserId(prev => prev === userId ? null : userId);
    };

    const toggleRole = async (user: UserDTO, roleId: number, isAssigned: boolean) => {
        const key = `${user.id}-${roleId}`;
        setRoleActionLoading(key);
        try {
            if (isAssigned) {
                await accessApi.unassignRoleFromUser(user.id, roleId);
            } else {
                await accessApi.assignRoleToUser(user.id, roleId);
            }
            // Refresh user data
            const updatedUsers = await (searchQuery.trim()
                ? accessApi.searchUsers(searchQuery.trim(), { page, size })
                : accessApi.getUsers({ page, size }));
            setUsers(updatedUsers.content);
        } catch {
            setError(isAssigned ? t('admin.access.users.error_unassign') : t('admin.access.users.error_assign'));
        } finally {
            setRoleActionLoading(null);
        }
    };

    const inputClass = 'w-full bg-nr-bg border border-nr-border rounded-lg px-3 py-2 text-sm text-nr-text focus:outline-none focus:border-nr-accent/60 transition-colors';

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-nr-text/60 uppercase tracking-wider flex-shrink-0">
                    {t('admin.access.tab.users')}
                </h2>
                <div className="relative max-w-xs w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-nr-text/30" />
                    <input
                        type="text"
                        className={`${inputClass} pl-8`}
                        placeholder={t('admin.access.users.search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(''); fetchUsers(''); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-nr-text/30 hover:text-nr-text/60 cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col min-h-[600px] justify-between overflow-hidden rounded-xl border border-nr-border/50 bg-white/5 dark:bg-black/20 backdrop-blur-md">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-nr-border/50 bg-nr-bg/30">
                            <th className="px-4 py-2.5 text-left text-xs font-bold text-nr-text/40 uppercase tracking-wider w-8" />
                            <th className="px-4 py-2.5 text-left text-xs font-bold text-nr-text/40 uppercase tracking-wider">
                                {t('admin.access.users.username')}
                            </th>
                            <th className="px-4 py-2.5 text-left text-xs font-bold text-nr-text/40 uppercase tracking-wider">
                                {t('admin.access.users.roles')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: size }).map((_, i) => <SkeletonRow key={i} cols={3} />)
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-10 text-center text-nr-text/40 text-sm">
                                    {t('admin.access.users.empty')}
                                </td>
                            </tr>
                        ) : (
                            users.map(user => {
                                const userRoleIds = new Set((user.roles || []).map(r => r.id));
                                return (
                                    <React.Fragment key={user.id}>
                                        <tr className="border-b border-nr-border/20 hover:bg-nr-text/[0.02] transition-colors">
                                            <td className="px-4 py-2.5">
                                                <button
                                                    onClick={() => toggleUserExpand(user.id)}
                                                    className="p-0.5 rounded text-nr-text/30 hover:text-nr-text/60 transition-colors cursor-pointer"
                                                >
                                                    {expandedUserId === user.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </button>
                                            </td>
                                            <td className="px-4 py-2.5 font-medium text-nr-text/80">
                                                {user.username}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {(user.roles && user.roles.length > 0) ? (
                                                        user.roles.map(role => (
                                                            <span
                                                                key={role.id}
                                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-nr-accent/15 text-nr-accent border border-nr-accent/30"
                                                            >
                                                                {localized(role.localizedName, lang) || role.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-nr-text/30 italic">{t('admin.access.users.no_roles')}</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedUserId === user.id && (
                                            <tr className="border-b border-nr-border/20 bg-nr-bg/20">
                                                <td colSpan={3} className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-bold text-nr-text/40 uppercase">
                                                            {t('admin.access.users.manage_roles')}
                                                        </span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {allRoles.map(role => {
                                                                const isAssigned = userRoleIds.has(role.id);
                                                                const actionKey = `${user.id}-${role.id}`;
                                                                const isLoading = roleActionLoading === actionKey;
                                                                return (
                                                                    <button
                                                                        key={role.id}
                                                                        onClick={() => toggleRole(user, role.id, isAssigned)}
                                                                        disabled={isLoading}
                                                                        className={`
                                                                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                                                                            border transition-all cursor-pointer disabled:opacity-50
                                                                            ${isAssigned
                                                                                ? 'bg-nr-accent/20 text-nr-accent border-nr-accent/40'
                                                                                : 'bg-nr-bg text-nr-text/50 border-nr-border hover:text-nr-text/70 hover:border-nr-text/30'
                                                                            }
                                                                        `}
                                                                    >
                                                                        {isAssigned ? <Check size={12} /> : <Plus size={12} />}
                                                                        {localized(role.localizedName, lang) || role.name}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */
const AccessManagementPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || '').split('-')[0] || 'en';
    const [activeTab, setActiveTab] = useState<TabId>('roles');

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Page header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-serif font-bold text-nr-text flex items-center gap-3">
                    <Shield className="text-nr-accent" size={24} />
                    {t('admin.access.title')}
                </h1>
                <p className="text-nr-text/60">{t('admin.access.subtitle')}</p>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-1 border-b border-nr-border/40">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        id={`access-tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all cursor-pointer
                            ${activeTab === tab.id
                                ? 'border-nr-accent text-nr-accent'
                                : 'border-transparent text-nr-text/50 hover:text-nr-text/70 hover:border-nr-text/20'
                            }
                        `}
                    >
                        {tab.icon}
                        {t(tab.labelKey)}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="glass p-6 rounded-xl border border-nr-border/50 bg-white/5 dark:bg-black/20 backdrop-blur-md shadow-lg">
                {activeTab === 'roles' && <RolesTab lang={lang} />}
                {activeTab === 'permissions' && <PermissionsTab lang={lang} />}
                {activeTab === 'users' && <UsersTab lang={lang} />}
            </div>
        </div>
    );
};

export default AccessManagementPage;
