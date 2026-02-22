import React, { useState } from 'react';
import { Users, FileText, Settings, Search, Edit3, Trash2, CheckCircle, Save, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const Admin: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('users');

    const tabs = [
        { id: 'users', label: t('admin.tabs.users'), icon: <Users size={18} /> },
        { id: 'news', label: t('admin.tabs.news'), icon: <FileText size={18} /> },
        { id: 'settings', label: t('admin.tabs.settings'), icon: <Settings size={18} /> },
    ];

    return (
        <div className="flex-1 flex flex-col md:flex-row h-full pt-16 animate-fade-in-up">

            {/* Admin Sidebar */}
            <aside className="w-full md:w-64 glass border-r border-nr-border md:h-[calc(100vh-4rem)] md:sticky top-16 z-10">
                <div className="p-6">
                    <h2 className="font-serif font-bold text-xl text-nr-text mb-6">{t('admin.title')}</h2>
                    <nav className="flex flex-col gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-nr-accent/20 text-nr-accent border border-nr-accent/30'
                                    : 'text-nr-text/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-nr-text'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Admin Content */}
            <main className="flex-1 p-4 md:p-8 bg-nr-bg min-h-screen">
                <div className="max-w-5xl mx-auto">

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <div>
                                    <h1 className="font-serif text-3xl font-bold text-nr-text">{t('admin.users.title')}</h1>
                                    <p className="text-nr-text/60 mt-1">{t('admin.users.subtitle')}</p>
                                </div>
                                <Button className="flex items-center gap-2"><Plus size={16} /> {t('admin.users.add')}</Button>
                            </div>

                            <div className="glass-card rounded-xl shadow-sm border border-nr-border overflow-hidden">
                                <div className="p-4 border-b border-nr-border flex justify-between items-center bg-black/5 dark:bg-white/5">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nr-text/40" size={18} />
                                        <input
                                            type="text"
                                            placeholder={t('admin.users.search')}
                                            className="pl-10 pr-4 py-2 bg-nr-surface border border-nr-border rounded-md text-sm focus:outline-none focus:border-nr-accent w-64 text-nr-text"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <select className="bg-nr-surface border border-nr-border rounded-md px-3 py-2 text-sm text-nr-text focus:outline-none focus:border-nr-accent">
                                            <option>{t('admin.users.filter_all')}</option>
                                            <option>{t('admin.users.filter_officers')}</option>
                                            <option>{t('admin.users.filter_privates')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-black/5 dark:bg-white/5 text-nr-text/60 text-sm uppercase tracking-wider">
                                                <th className="p-4 font-semibold">{t('admin.users.table.name')}</th>
                                                <th className="p-4 font-semibold">{t('admin.users.table.rank')}</th>
                                                <th className="p-4 font-semibold">{t('admin.users.table.status')}</th>
                                                <th className="p-4 font-semibold text-right">{t('admin.users.table.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-nr-border">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <img src={`https://i.pravatar.cc/150?img=${i + 10}`} className="w-10 h-10 rounded-full border border-nr-border" />
                                                            <div className="font-medium text-nr-text">Player {i}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-nr-text">{t('roster.member.recruit')}</td>
                                                    <td className="p-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                            {t('roster.status.active')}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button className="p-2 text-nr-text/50 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"><Edit3 size={18} /></button>
                                                            <button className="p-2 text-nr-text/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 size={18} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4 border-t border-nr-border text-sm text-nr-text/50 flex justify-between items-center bg-black/5 dark:bg-white/5">
                                    <span>{t('admin.users.pagination.showing')} 1-5 {t('admin.users.pagination.out_of')} 42</span>
                                    <div className="flex gap-1">
                                        <button className="px-3 py-1 border border-nr-border rounded bg-nr-surface text-nr-text disabled:opacity-50">{t('admin.users.pagination.prev')}</button>
                                        <button className="px-3 py-1 border border-nr-border rounded bg-nr-surface text-nr-text">{t('admin.users.pagination.next')}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NEWS TAB */}
                    {activeTab === 'news' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <div>
                                    <h1 className="font-serif text-3xl font-bold text-nr-text">{t('admin.news.title')}</h1>
                                    <p className="text-nr-text/60 mt-1">{t('admin.news.subtitle')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Editor */}
                                    <div className="glass-card rounded-xl p-6 shadow-sm border border-nr-border">
                                        <input
                                            type="text"
                                            placeholder={t('admin.news.editor.title_placeholder')}
                                            className="w-full text-2xl font-serif font-bold bg-transparent border-none placeholder-nr-text/30 text-nr-text focus:outline-none mb-4"
                                        />

                                        <div className="flex gap-2 mb-4 border-b border-nr-border pb-4">
                                            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded text-nr-text"><span className="font-bold">B</span></button>
                                            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded text-nr-text"><span className="italic">I</span></button>
                                            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded text-nr-text"><span className="underline">U</span></button>
                                            <div className="w-px h-6 bg-nr-border my-auto mx-2"></div>
                                            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded text-nr-text flex items-center gap-1 text-sm"><Edit3 size={16} /> {t('admin.news.editor.description')}</button>
                                        </div>

                                        <textarea
                                            placeholder={t('admin.news.editor.content_placeholder')}
                                            className="w-full h-64 bg-transparent border-none resize-none focus:outline-none text-nr-text placeholder-nr-text/30"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Sidebar options */}
                                    <div className="glass-card rounded-xl p-6 shadow-sm border border-nr-border">
                                        <h3 className="font-bold text-nr-text mb-4 border-b border-nr-border pb-2">{t('admin.news.publish.title')}</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-nr-text/70 mb-1">{t('admin.news.publish.category')}</label>
                                                <select className="w-full bg-nr-surface border border-nr-border rounded-md px-3 py-2 focus:outline-none focus:border-nr-accent text-nr-text">
                                                    <option>{t('events.types.battle')}</option>
                                                    <option>{t('events.types.training')}</option>
                                                    <option>{t('admin.news.publish.category_important')}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-nr-text/70 mb-1">{t('admin.news.publish.cover')}</label>
                                                <input type="text" className="w-full bg-nr-surface border border-nr-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-nr-accent text-nr-text" placeholder="https://" />
                                            </div>
                                            <div className="pt-4 flex flex-col gap-2">
                                                <Button variant="primary" className="w-full flex items-center justify-center gap-2"><CheckCircle size={18} /> {t('admin.news.publish.publish_btn')}</Button>
                                                <Button variant="secondary" className="w-full flex items-center justify-center gap-2"><Save size={18} /> {t('admin.news.publish.draft_btn')}</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="font-serif text-3xl font-bold text-nr-text">{t('admin.settings.title')}</h1>
                                <p className="text-nr-text/60 mt-1">{t('admin.settings.subtitle')}</p>
                            </div>
                            <div className="glass-card rounded-xl p-8 border border-nr-border shadow-sm text-center py-20">
                                <Settings size={48} className="mx-auto text-nr-text/20 mb-4 animate-spin-slow" />
                                <h3 className="text-xl font-bold text-nr-text mb-2">{t('admin.settings.wip')}</h3>
                                <p className="text-nr-text/60 max-w-md mx-auto">{t('admin.settings.wip_desc')}</p>
                            </div>
                        </div>
                    )}

                </div>
            </main>

        </div>
    );
};

export default Admin;
