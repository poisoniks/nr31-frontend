import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Users, Calendar, FileText } from 'lucide-react';

const OverviewPage: React.FC = () => {
    const { t } = useTranslation();

    const stats = [
        {
            labelKey: 'admin.overview.stat.members',
            value: '—',
            icon: <Users size={20} />,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
        },
        {
            labelKey: 'admin.overview.stat.events',
            value: '—',
            icon: <Calendar size={20} />,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/20',
        },
        {
            labelKey: 'admin.overview.stat.news',
            value: '—',
            icon: <FileText size={20} />,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20',
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="font-serif text-3xl font-bold text-nr-text">
                    {t('admin.overview.title')}
                </h1>
                <p className="text-nr-text/60 mt-1">{t('admin.overview.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.labelKey}
                        className={`glass-card rounded-xl p-5 border ${stat.borderColor} flex items-center gap-4`}
                    >
                        <div className={`w-11 h-11 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-nr-text">{stat.value}</p>
                            <p className="text-xs text-nr-text/50 font-medium uppercase tracking-wide">
                                {t(stat.labelKey)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card rounded-xl p-8 border border-nr-border text-center py-16">
                <BarChart3
                    size={48}
                    className="mx-auto text-nr-text/15 mb-4"
                />
                <h3 className="text-xl font-bold text-nr-text mb-2">
                    {t('admin.overview.placeholder_title')}
                </h3>
                <p className="text-nr-text/50 max-w-md mx-auto text-sm">
                    {t('admin.overview.placeholder_desc')}
                </p>
            </div>
        </div>
    );
};

export default OverviewPage;
