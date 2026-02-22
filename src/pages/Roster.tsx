import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Award, History, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type MemberStatus = 'active' | 'leave' | 'reserve';

interface Member {
    id: number;
    name: string;
    realName?: string;
    role: string;
    avatar: string;
    status: MemberStatus;
    joinDate: string;
    medals: number;
}

interface RosterGroup {
    group: string;
    groupKey: string;
    members: Member[];
}

const mockRoster: RosterGroup[] = [
    {
        group: "Командування",
        groupKey: "roster.groups.command",
        members: [
            { id: 1, name: "Alexander", role: "Оберст", avatar: "https://i.pravatar.cc/150?img=11", status: "active", joinDate: "2023-01-15", medals: 5 }
        ]
    },
    {
        group: "Офіцери",
        groupKey: "roster.groups.officers",
        members: [
            { id: 2, name: "Ivan", realName: "Іван", role: "Капітан", avatar: "https://i.pravatar.cc/150?img=12", status: "active", joinDate: "2023-03-20", medals: 3 },
            { id: 3, name: "Petro", role: "Лейтенант", avatar: "https://i.pravatar.cc/150?img=13", status: "leave", joinDate: "2023-05-10", medals: 2 }
        ]
    },
    {
        group: "Унтер-офіцери",
        groupKey: "roster.groups.nco",
        members: [
            { id: 4, name: "Mykola", role: "Фельдфебель", avatar: "https://i.pravatar.cc/150?img=14", status: "active", joinDate: "2023-08-01", medals: 1 },
            { id: 5, name: "Taras", role: "Капрал", avatar: "https://i.pravatar.cc/150?img=15", status: "active", joinDate: "2023-09-15", medals: 1 }
        ]
    },
    {
        group: "Рядові",
        groupKey: "roster.groups.privates",
        members: [
            { id: 6, name: "Ostap", role: "Канонір", avatar: "https://i.pravatar.cc/150?img=16", status: "active", joinDate: "2024-01-05", medals: 0 },
            { id: 7, name: "Roman", role: "Канонір", avatar: "https://i.pravatar.cc/150?img=17", status: "reserve", joinDate: "2023-11-20", medals: 0 }
        ]
    }
];

const Roster: React.FC = () => {
    const { t } = useTranslation();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ "Командування": true, "Офіцери": true });
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const toggleGroup = (group: string) => {
        setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const statusColors: Record<MemberStatus, string> = {
        active: "bg-green-500",
        leave: "bg-yellow-500",
        reserve: "bg-gray-500"
    };

    const statusLabels: Record<MemberStatus, string> = {
        active: t('roster.status.active'),
        leave: t('roster.status.leave'),
        reserve: t('roster.status.reserve')
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 pt-24 relative z-10 w-full animate-fade-in-up">
            <h1 className="font-serif text-4xl font-bold mb-8 text-nr-text text-center md:text-left drop-shadow-md">
                <span className="text-gold-gradient">{t('roster.title.p1')}</span> {t('roster.title.p2')}
            </h1>

            <div className="glass-card rounded-xl shadow-sm p-4 md:p-8">

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-nr-border gap-4">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-2 text-sm text-nr-text"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> {statusLabels.active}</span>
                        <span className="flex items-center gap-2 text-sm text-nr-text"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span> {statusLabels.leave}</span>
                        <span className="flex items-center gap-2 text-sm text-nr-text"><span className="w-2.5 h-2.5 rounded-full bg-gray-500 shadow-[0_0_8px_rgba(107,114,128,0.6)]"></span> {statusLabels.reserve}</span>
                    </div>
                    <input
                        type="text"
                        placeholder={t('roster.search.placeholder')}
                        className="w-full md:w-64 px-4 py-2 rounded-md bg-transparent border border-nr-border text-nr-text focus:outline-none focus:ring-1 focus:ring-nr-accent placeholder-nr-text/40"
                    />
                </div>

                {/* Tree List */}
                <div className="space-y-4">
                    {mockRoster.map((group) => (
                        <div key={group.group} className="border border-nr-border rounded-lg overflow-hidden bg-nr-surface/30">
                            <button
                                onClick={() => toggleGroup(group.group)}
                                className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-serif font-bold text-lg text-nr-text"
                            >
                                <div className="flex items-center gap-2">
                                    {openGroups[group.group] ? <ChevronDown size={20} className="text-nr-accent" /> : <ChevronRight size={20} className="text-nr-accent" />}
                                    {t(group.groupKey, group.group)}
                                </div>
                                <span className="text-sm font-sans font-normal bg-black/10 dark:bg-white/10 text-nr-text px-2 py-1 rounded-md">{group.members.length}</span>
                            </button>

                            {openGroups[group.group] && (
                                <div className="divide-y divide-nr-border">
                                    {group.members.map(member => (
                                        <div
                                            key={member.id}
                                            onClick={() => setSelectedMember(member)}
                                            className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-nr-accent/20 group-hover:border-nr-accent transition-colors" />
                                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-nr-surface ${statusColors[member.status]}`}></span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-nr-text group-hover:text-nr-accent transition-colors">{member.role} {member.name}</p>
                                                    {member.realName && <p className="text-sm text-nr-text/60">{member.realName}</p>}
                                                </div>
                                            </div>
                                            <div className="hidden md:flex items-center gap-4">
                                                {member.medals > 0 && (
                                                    <div className="flex -space-x-1" title={`${member.medals} ${t('roster.medals')}`}>
                                                        {[...Array(Math.min(member.medals, 3))].map((_, i) => (
                                                            <div key={i} className="w-6 h-6 rounded-full bg-linear-to-br from-yellow-300 to-yellow-600 border border-yellow-700 shadow-sm flex items-center justify-center">
                                                                <Award size={12} className="text-amber-900" />
                                                            </div>
                                                        ))}
                                                        {member.medals > 3 && <span className="text-xs font-bold pl-2 text-nr-text">+{member.medals - 3}</span>}
                                                    </div>
                                                )}
                                                <span className="text-xs px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-nr-text font-medium">{statusLabels[member.status]}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </div>

            {/* Profile Modal */}
            {selectedMember && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMember(null)} />
                    <div className="glass-card rounded-xl shadow-2xl border-2 border-nr-accent/20 relative z-10 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header Cover */}
                        <div className="h-32 bg-gray-900 overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 hero-overlay" />
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 text-white hover:bg-nr-accent/80 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="px-6 pb-6 pt-0 relative">
                            <div className="absolute -top-12 left-6 border-4 border-nr-surface rounded-full bg-nr-surface shadow-lg">
                                <img src={selectedMember.avatar} className="w-24 h-24 rounded-full object-cover" />
                            </div>
                            <div className="absolute top-4 right-6">
                                <span className={`px-2 py-1 text-xs text-white rounded shadow font-medium ${statusColors[selectedMember.status]}`}>
                                    {statusLabels[selectedMember.status]}
                                </span>
                            </div>

                            <div className="mt-16 block">
                                <h2 className="font-serif text-2xl font-bold text-nr-text">{selectedMember.role} {selectedMember.name}</h2>
                                <p className="text-sm text-nr-text/60 mb-6">{t('roster.member.join_date_label')} {selectedMember.joinDate}</p>

                                <h4 className="font-bold text-sm uppercase tracking-wider text-nr-text/50 mb-3 flex items-center gap-2">
                                    <Award size={16} className="text-nr-accent" /> {t('roster.member.medals_title')} ({selectedMember.medals})
                                </h4>
                                {selectedMember.medals > 0 ? (
                                    <div className="flex gap-2 mb-6">
                                        {[...Array(selectedMember.medals)].map((_, i) => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-300 to-yellow-600 shadow-lg border border-yellow-700 font-bold text-amber-900 flex items-center justify-center relative group cursor-pointer hover:scale-110 transition-transform">
                                                ★
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                    {t('roster.member.medal_courage')} #{i + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-nr-text/50 mb-6 italic">{t('roster.member.no_medals')}</p>
                                )}

                                <h4 className="font-bold text-sm uppercase tracking-wider text-nr-text/50 mb-3 flex items-center gap-2">
                                    <History size={16} className="text-nr-accent" /> {t('roster.member.history')}
                                </h4>
                                <div className="space-y-4 relative">
                                    <div className="flex gap-4 relative">
                                        <div className="w-px h-full bg-nr-border absolute left-1.5 top-3"></div>
                                        <div className="w-3 h-3 bg-nr-accent rounded-full mt-1.5 relative z-10 shrink-0 ring-4 ring-nr-surface shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                                        <div>
                                            <p className="font-bold text-sm text-nr-text">{selectedMember.role}</p>
                                            <p className="text-xs text-nr-text/60">{t('roster.member.current_role')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 relative">
                                        <div className="w-3 h-3 bg-gray-400 rounded-full mt-1.5 relative z-10 shrink-0 ring-4 ring-nr-surface"></div>
                                        <div>
                                            <p className="font-bold text-sm text-nr-text/60">{t('roster.member.recruit')}</p>
                                            <p className="text-xs text-nr-text/50">{selectedMember.joinDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Roster;
