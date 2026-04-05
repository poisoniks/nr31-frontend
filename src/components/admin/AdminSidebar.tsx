import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';

export interface AdminPageNode {
    id: string;
    labelKey: string;
    icon?: React.ReactNode;
    permission?: string;
    children?: AdminPageNode[];
    component?: React.ComponentType;
}

interface AdminSidebarProps {
    tree: AdminPageNode[];
    activePageId: string;
    onSelectPage: (pageId: string) => void;
}

interface TreeNodeProps {
    node: AdminPageNode;
    depth: number;
    activePageId: string;
    onSelectPage: (pageId: string) => void;
    expandedCategories: Set<string>;
    toggleCategory: (id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth, activePageId, onSelectPage, expandedCategories, toggleCategory }) => {
    const { t } = useTranslation();
    const user = useAuthStore(state => state.user);

    if (node.permission) {
        const hasPermission = user?.authorities?.includes(node.permission) ?? false;
        if (!hasPermission) return null;
    }

    const isCategory = !!node.children && node.children.length > 0;
    const isExpanded = expandedCategories.has(node.id);
    const isActive = activePageId === node.id;

    const paddingLeft = 16 + depth * 16;

    if (isCategory) {
        return (
            <div>
                <button
                    onClick={() => toggleCategory(node.id)}
                    className="w-full flex items-center gap-2.5 py-2.5 pr-3 rounded-lg text-sm font-medium transition-colors text-nr-text/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-nr-text"
                    style={{ paddingLeft: `${paddingLeft}px` }}
                >
                    <span className="flex-shrink-0 text-nr-text/40 transition-transform duration-200">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                    {node.icon && <span className="flex-shrink-0 text-nr-text/50">{node.icon}</span>}
                    <span className="truncate">{t(node.labelKey)}</span>
                </button>
                <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    {node.children!.map(child => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            activePageId={activePageId}
                            onSelectPage={onSelectPage}
                            expandedCategories={expandedCategories}
                            toggleCategory={toggleCategory}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => onSelectPage(node.id)}
            className={`w-full flex items-center gap-2.5 py-2.5 pr-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                    ? 'bg-nr-accent/15 text-nr-accent border border-nr-accent/25'
                    : 'text-nr-text/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-nr-text'
            }`}
            style={{ paddingLeft: `${paddingLeft}px` }}
        >
            {node.icon && <span className="flex-shrink-0">{node.icon}</span>}
            <span className="truncate">{t(node.labelKey)}</span>
        </button>
    );
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ tree, activePageId, onSelectPage }) => {
    const { t } = useTranslation();

    const collectCategoryIds = (nodes: AdminPageNode[]): string[] => {
        const ids: string[] = [];
        for (const node of nodes) {
            if (node.children && node.children.length > 0) {
                ids.push(node.id);
                ids.push(...collectCategoryIds(node.children));
            }
        }
        return ids;
    };

    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        () => new Set(collectCategoryIds(tree))
    );

    const toggleCategory = (id: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <aside className="w-full md:w-64 lg:w-72 glass border-r border-nr-border md:h-[calc(100vh-4rem)] md:sticky top-16 z-10 flex-shrink-0">
            <div className="p-5">
                <h2 className="font-serif font-bold text-lg text-nr-text mb-5 flex items-center gap-2">
                    {t('admin.title')}
                </h2>
                <nav className="flex flex-col gap-0.5">
                    {tree.map(node => (
                        <TreeNode
                            key={node.id}
                            node={node}
                            depth={0}
                            activePageId={activePageId}
                            onSelectPage={onSelectPage}
                            expandedCategories={expandedCategories}
                            toggleCategory={toggleCategory}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default AdminSidebar;
