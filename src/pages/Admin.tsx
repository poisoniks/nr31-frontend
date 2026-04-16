import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Globe, Database, ScrollText, Bot, Shield, Settings2 } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import type { AdminPageNode } from '../components/admin/AdminSidebar';
import { useAuthStore } from '../store/useAuthStore';
import OverviewPage from './admin/OverviewPage';
import CacheResetPage from './admin/CacheResetPage';
import LogsPage from './admin/LogsPage';
import DiscordPage from './admin/DiscordPage';
import AccessManagementPage from './admin/AccessManagementPage';
import SystemConfigPage from './admin/SystemConfigPage';

const findPageComponent = (nodes: AdminPageNode[], pageId: string): React.ComponentType | undefined => {
    for (const node of nodes) {
        if (node.id === pageId && node.component) return node.component;
        if (node.children) {
            const found = findPageComponent(node.children, pageId);
            if (found) return found;
        }
    }
    return undefined;
};

const findFirstAccessiblePage = (nodes: AdminPageNode[], authorities: string[]): string | null => {
    for (const node of nodes) {
        if (node.permission && !authorities.includes(node.permission)) continue;

        if (node.component) return node.id;

        if (node.children) {
            const found = findFirstAccessiblePage(node.children, authorities);
            if (found) return found;
        }
    }
    return null;
};

const Admin: React.FC = () => {
    const user = useAuthStore(state => state.user);
    const authorities = user?.authorities ?? [];

    const tree: AdminPageNode[] = useMemo(() => [
        {
            id: 'everything',
            labelKey: 'admin.sidebar.everything',
            icon: <Globe size={16} />,
            children: [
                {
                    id: 'overview',
                    labelKey: 'admin.sidebar.overview',
                    icon: <LayoutDashboard size={16} />,
                    component: OverviewPage,
                },
                {
                    id: 'cache',
                    labelKey: 'admin.sidebar.cache',
                    icon: <Database size={16} />,
                    permission: 'cache:clear',
                    component: CacheResetPage,
                },
                {
                    id: 'logs',
                    labelKey: 'admin.sidebar.logs',
                    icon: <ScrollText size={16} />,
                    permission: 'logs:read',
                    component: LogsPage,
                },
                {
                    id: 'discord',
                    labelKey: 'admin.sidebar.discord',
                    icon: <Bot size={16} />,
                    permission: 'discord:manage',
                    component: DiscordPage,
                },
                {
                    id: 'access',
                    labelKey: 'admin.sidebar.access',
                    icon: <Shield size={16} />,
                    permission: 'access:manage',
                    component: AccessManagementPage,
                },
                {
                    id: 'config',
                    labelKey: 'admin.sidebar.config',
                    icon: <Settings2 size={16} />,
                    permission: 'config:read',
                    component: SystemConfigPage,
                },
            ],
        },
    ], []);

    const defaultPage = findFirstAccessiblePage(tree, authorities) ?? 'overview';
    const [activePageId, setActivePageId] = useState(defaultPage);

    const ActiveComponent = findPageComponent(tree, activePageId);

    return (
        <div className="flex-1 flex flex-col md:flex-row h-full pt-16 animate-fade-in-up">
            <AdminSidebar
                tree={tree}
                activePageId={activePageId}
                onSelectPage={setActivePageId}
            />

            <main className="flex-1 p-4 md:p-8 bg-nr-bg min-h-screen">
                <div className="max-w-5xl mx-auto">
                    {ActiveComponent ? (
                        <ActiveComponent />
                    ) : (
                        <div className="text-center py-20 text-nr-text/40">
                            <p className="text-lg font-medium">Page not found</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Admin;
